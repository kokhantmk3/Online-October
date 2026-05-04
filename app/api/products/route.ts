import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/products - list all products
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST /api/products - add new product
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, category, image_url, stock } = body

  if (!name || !price || !category) {
    return NextResponse.json({ error: 'Name, price, and category required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image_url: image_url || '',
      stock: parseInt(stock) || 0,
      is_active: true
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/products?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// PATCH /api/products?id=xxx - update product
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const body = await req.json()
  const updates: any = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.description !== undefined) updates.description = body.description
  if (body.price !== undefined) updates.price = parseFloat(body.price)
  if (body.category !== undefined) updates.category = body.category
  if (body.image_url !== undefined) updates.image_url = body.image_url
  if (body.stock !== undefined) updates.stock = parseInt(body.stock)
  if (body.is_active !== undefined) updates.is_active = body.is_active

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
