// lib/supabase.ts
// ── Supabase client for Online October ──
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase (for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase with full permissions (for API routes only)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── PRODUCTS ──────────────────────────────────────────────

export async function getProducts(category?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getLowStockProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .lte('stock', 10) // less than or equal to reorder level
    .eq('active', true)
  if (error) throw error
  return data
}

// ── MEMBERS ──────────────────────────────────────────────

export async function getMemberByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('members')
    .select('*')
    .eq('email', email)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getMemberById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createMember(member: {
  name: string
  email: string
  password_hash: string
  phone?: string
  language?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('members')
    .insert(member)
    .select()
    .single()
  if (error) throw error

  // Award welcome bonus points
  await addLoyaltyPoints(data.id, 250, 'bonus', 'Welcome bonus — joined Online October 🎉')
  return data
}

export async function updateMemberPoints(memberId: string, points: number, lifetimeAdd: number) {
  const { data, error } = await supabaseAdmin
    .from('members')
    .update({
      points,
      lifetime_points: lifetimeAdd > 0
        ? supabase.rpc('increment', { x: lifetimeAdd })
        : undefined
    })
    .eq('id', memberId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── LOYALTY ──────────────────────────────────────────────

export async function addLoyaltyPoints(
  memberId: string,
  points: number,
  type: 'earn' | 'redeem' | 'bonus' | 'expire',
  description: string,
  orderId?: string
) {
  // Log the transaction
  await supabaseAdmin.from('loyalty_transactions').insert({
    member_id: memberId,
    order_id: orderId || null,
    type,
    points: type === 'redeem' ? -Math.abs(points) : Math.abs(points),
    description
  })

  // Update member's points balance
  const member = await getMemberById(memberId)
  const newPoints = type === 'redeem'
    ? member.points - Math.abs(points)
    : member.points + Math.abs(points)
  const newLifetime = type === 'earn' || type === 'bonus'
    ? member.lifetime_points + Math.abs(points)
    : member.lifetime_points

  const { error } = await supabaseAdmin
    .from('members')
    .update({ points: newPoints, lifetime_points: newLifetime })
    .eq('id', memberId)
  if (error) throw error
}

export async function getLoyaltyHistory(memberId: string) {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

// ── ORDERS ──────────────────────────────────────────────

export async function createOrder(order: {
  member_id?: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  address: string
  city: string
  postal_code: string
  country: string
  subtotal: number
  shipping_cost: number
  discount: number
  tax: number
  total: number
  currency: string
  payment_method: string
  points_redeemed?: number
  items: Array<{
    product_id: string
    product_name: string
    product_sku: string
    product_emoji: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}) {
  const { items, ...orderData } = order

  // Create order
  const { data: newOrder, error } = await supabaseAdmin
    .from('orders')
    .insert(orderData)
    .select()
    .single()
  if (error) throw error

  // Create order items
  await supabaseAdmin.from('order_items').insert(
    items.map(item => ({ ...item, order_id: newOrder.id }))
  )

  // Award loyalty points (1 pt per $1 spent)
  if (order.member_id) {
    const pointsEarned = Math.floor(order.total)
    await addLoyaltyPoints(
      order.member_id,
      pointsEarned,
      'earn',
      `Purchase — ${newOrder.order_number}`,
      newOrder.id
    )

    // Update order with points earned
    await supabaseAdmin
      .from('orders')
      .update({ points_earned: pointsEarned })
      .eq('id', newOrder.id)
  }

  return newOrder
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single()
  if (error) throw error
  return data
}

export async function getOrdersByMember(memberId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId: string, status: 1 | 2 | 3 | 4, adminId: string, note?: string) {
  // Update order
  await supabaseAdmin
    .from('orders')
    .update({
      status,
      ...(status === 4 ? { delivered_at: new Date().toISOString() } : {}),
      ...(status === 3 ? { shipped_at: new Date().toISOString() } : {}),
    })
    .eq('id', orderId)

  // Log delivery event
  await supabaseAdmin.from('delivery_tracking').insert({
    order_id: orderId,
    status,
    note,
    updated_by: adminId
  })
}

// ── ADMINS ──────────────────────────────────────────────

export async function getAdminByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('active', true)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getAllAdmins() {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('id, name, email, role, store_name, active, permissions, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// ── STORE SETTINGS ───────────────────────────────────────

export async function getStoreSetting(key: string) {
  const { data } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value
}

export async function getAllStoreSettings() {
  const { data } = await supabase.from('store_settings').select('*')
  return Object.fromEntries((data || []).map(s => [s.key, s.value]))
}

// ── DISCOUNT CODES ───────────────────────────────────────

export async function validateDiscountCode(code: string, orderTotal: number) {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()

  if (error || !data) return { valid: false, message: 'Invalid discount code' }
  if (data.valid_until && new Date(data.valid_until) < new Date()) return { valid: false, message: 'This code has expired' }
  if (data.max_uses && data.used_count >= data.max_uses) return { valid: false, message: 'This code has reached its usage limit' }
  if (orderTotal < data.min_order) return { valid: false, message: `Minimum order of $${data.min_order} required` }

  const discount = data.type === 'percentage'
    ? (orderTotal * data.value) / 100
    : data.value

  return { valid: true, discount, code: data }
}
