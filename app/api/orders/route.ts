import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const NOTIFICATION_EMAIL = 'onlineoctobermdystaff@gmail.com'

// POST /api/orders - create new order
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customer_name, customer_email, customer_phone, shipping_address, items, total } = body

  if (!customer_name || !customer_email || !items || items.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Save order to database
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_name,
      customer_email,
      customer_phone: customer_phone || '',
      shipping_address: shipping_address || '',
      total: parseFloat(total),
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Save order items
  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity
  }))

  await supabaseAdmin.from('order_items').insert(orderItems)

  // Send email notification (using mailto fallback if no email service)
  // To enable real emails, sign up at resend.com or sendgrid.com and add API key
  try {
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Online October <orders@onlineoctober.com>',
          to: NOTIFICATION_EMAIL,
          subject: `🍂 New Order #${order.id.slice(0, 8)} from ${customer_name}`,
          html: `
            <h2>New Order Received!</h2>
            <p><strong>Customer:</strong> ${customer_name}</p>
            <p><strong>Email:</strong> ${customer_email}</p>
            <p><strong>Phone:</strong> ${customer_phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${shipping_address || 'N/A'}</p>
            <p><strong>Total:</strong> $${total}</p>
            <h3>Items:</h3>
            <ul>
              ${items.map((i: any) => `<li>${i.name} × ${i.quantity} = $${(i.price * i.quantity).toFixed(2)}</li>`).join('')}
            </ul>
            <p><a href="https://online-october.vercel.app/admin">View in Admin Panel</a></p>
          `
        })
      })
    }
  } catch (e) {
    console.error('Email send failed:', e)
  }

  return NextResponse.json({ success: true, order_id: order.id })
}

// GET /api/orders - list all orders
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// PATCH /api/orders?id=xxx - update order status
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
