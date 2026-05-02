// ============================================================
// API ROUTES OVERVIEW — Online October Next.js
// Each file goes in app/api/[route]/route.ts
// ============================================================

// ── app/api/products/route.ts ────────────────────────────
export const GET_products = `
import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || undefined
  const products = await getProducts(category)
  return NextResponse.json(products)
}
`

// ── app/api/members/register/route.ts ───────────────────
export const POST_register = `
import { NextRequest, NextResponse } from 'next/server'
import { createMember, getMemberByEmail } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { name, email, password, language } = await req.json()
  if (!name || !email || !password)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const existing = await getMemberByEmail(email)
  if (existing)
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

  const password_hash = await bcrypt.hash(password, 12)
  const member = await createMember({ name, email, password_hash, language })
  return NextResponse.json({ success: true, member: { id: member.id, name: member.name, email: member.email, tier: member.tier, points: member.points } })
}
`

// ── app/api/members/login/route.ts ──────────────────────
export const POST_login = `
import { NextRequest, NextResponse } from 'next/server'
import { getMemberByEmail } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const member = await getMemberByEmail(email)
  if (!member) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, member.password_hash)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = jwt.sign({ id: member.id, email: member.email, role: 'member' }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  return NextResponse.json({ token, member: { id: member.id, name: member.name, email: member.email, tier: member.tier, points: member.points, referral_code: member.referral_code } })
}
`

// ── app/api/orders/route.ts ─────────────────────────────
export const POST_orders = `
import { NextRequest, NextResponse } from 'next/server'
import { createOrder, validateDiscountCode } from '@/lib/supabase'
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { paymentMethodId, discountCode, ...orderData } = body

  // Validate discount if provided
  let discountAmount = 0
  if (discountCode) {
    const result = await validateDiscountCode(discountCode, orderData.subtotal)
    if (result.valid) discountAmount = result.discount || 0
  }

  // Confirm payment with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round((orderData.total - discountAmount) * 100),
    currency: orderData.currency.toLowerCase(),
    payment_method: paymentMethodId,
    confirm: true,
    return_url: process.env.NEXT_PUBLIC_SITE_URL + '/checkout/success',
  })

  if (paymentIntent.status !== 'succeeded')
    return NextResponse.json({ error: 'Payment failed' }, { status: 400 })

  // Create order in database
  const order = await createOrder({
    ...orderData,
    discount: discountAmount,
    payment_method: 'stripe',
    stripe_payment_id: paymentIntent.id,
  })

  return NextResponse.json({ success: true, order })
}
`

// ── app/api/orders/track/route.ts ───────────────────────
export const GET_track = `
import { NextRequest, NextResponse } from 'next/server'
import { getOrderByNumber } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get('id')
  if (!orderNumber) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  const order = await getOrderByNumber(orderNumber)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(order)
}
`

// ── app/api/loyalty/route.ts ────────────────────────────
export const GET_loyalty = `
import { NextRequest, NextResponse } from 'next/server'
import { getLoyaltyHistory, getMemberById } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
  const [member, history] = await Promise.all([getMemberById(decoded.id), getLoyaltyHistory(decoded.id)])
  return NextResponse.json({ member, history })
}
`

// ── app/api/admin/login/route.ts ────────────────────────
export const POST_admin_login = `
import { NextRequest, NextResponse } from 'next/server'
import { getAdminByEmail } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json()
  const admin = await getAdminByEmail(email)
  if (!admin || admin.role !== role)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, admin.password_hash)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET!, { expiresIn: '8h' })
  return NextResponse.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, store_name: admin.store_name, permissions: admin.permissions } })
}
`

// ── app/api/admin/orders/route.ts ───────────────────────
export const PATCH_admin_orders = `
import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as { id: string, role: string }
  if (!['admin','super'].includes(decoded.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { orderId, status, note } = await req.json()
  await updateOrderStatus(orderId, status, decoded.id, note)
  return NextResponse.json({ success: true })
}
`

// ── app/api/payments/stripe-webhook/route.ts ────────────
export const POST_webhook = `
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    await supabaseAdmin.from('orders')
      .update({ payment_status: 'paid' })
      .eq('stripe_payment_id', pi.id)
  }

  return NextResponse.json({ received: true })
}
`
