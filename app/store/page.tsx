'use client'

import { useState, useEffect } from 'react'

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Accessories', 'Footwear', 'Bikinis']

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d.filter(p => p.is_active !== false) : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product_id: product.id, name: product.name, price: Number(product.price), quantity: 1, image_url: product.image_url }]
    })
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product_id !== id))
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) removeFromCart(id)
    else setCart(prev => prev.map(i => i.product_id === id ? { ...i, quantity: qty } : i))
  }

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { alert('Name and email required'); return }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: form.address,
          items: cart,
          total: cartTotal
        })
      })
      if (res.ok) {
        setOrderSuccess(true)
        setCart([])
        setForm({ name: '', email: '', phone: '', address: '' })
      } else {
        alert('Order failed. Please try again.')
      }
    } catch { alert('Network error') }
  }

  return (
    <main style={s.wrap}>
      <header style={s.header}>
        <a href="/" style={s.logo}>ONLINE<span style={{color:'#c4915a'}}>OCTOBER®</span></a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/landing" style={s.navLink}>Home</a>
          <a href="/loyalty" style={s.navLink}>Loyalty</a>
          <button onClick={() => setShowCart(true)} style={s.cartBtn}>🛒 {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}</button>
        </div>
      </header>

      <div style={s.banner}>
        <h1 style={s.title}>SHOP ALL</h1>
        <p style={s.subtitle}>{products.length} products · Free shipping over $50</p>
      </div>

      <div style={s.catBar}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={activeCategory === cat ? s.catActive : s.catBtn}>{cat}</button>
        ))}
      </div>

      <div style={s.section}>
        {loading ? <p style={{ textAlign: 'center', color: '#a0612a' }}>Loading...</p> : (
          filtered.length === 0 ? (
            <div style={s.empty}>
              <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛍️</p>
              <h3 style={{ color: '#3d1f0a', marginBottom: '8px' }}>No products yet</h3>
              <p style={{ color: '#a0612a', fontSize: '14px' }}>Add products in the <a href="/admin" style={{ color: '#c4915a', fontWeight: 700 }}>admin panel</a> to see them here</p>
            </div>
          ) : (
            <div style={s.grid}>
              {filtered.map(p => (
                <div key={p.id} style={s.card}>
                  <div style={s.imgBox}>
                    {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <span style={{ fontSize: '4rem' }}>👕</span>}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={s.tag}>{p.category}</div>
                    <h4 style={s.pName}>{p.name}</h4>
                    {p.description && <p style={s.pDesc}>{p.description}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <div style={s.pPrice}>${Number(p.price).toFixed(2)}</div>
                      <button onClick={() => addToCart(p)} style={s.addBtn}>+ Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div style={s.overlay} onClick={() => { setShowCart(false); setCheckout(false); setOrderSuccess(false) }}>
          <div style={s.drawer} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: '#3d1f0a' }}>{orderSuccess ? '✅ Order Placed!' : checkout ? 'Checkout' : 'Your Cart'}</h2>
              <button onClick={() => { setShowCart(false); setCheckout(false); setOrderSuccess(false) }} style={s.closeBtn}>✕</button>
            </div>

            {orderSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍂</p>
                <p style={{ color: '#3d1f0a', fontSize: '16px', marginBottom: '8px' }}>Thank you for your order!</p>
                <p style={{ color: '#a0612a', fontSize: '13px' }}>You'll receive a confirmation email shortly. We're preparing your items for shipping.</p>
                <button onClick={() => { setShowCart(false); setOrderSuccess(false) }} style={s.btnDark}>Continue Shopping</button>
              </div>
            ) : checkout ? (
              <form onSubmit={submitOrder}>
                <label style={s.label}>FULL NAME *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={s.input} required />
                <label style={s.label}>EMAIL *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={s.input} required />
                <label style={s.label}>PHONE</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={s.input} />
                <label style={s.label}>SHIPPING ADDRESS</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{...s.input, minHeight: '80px'}} />

                <div style={s.totalRow}>
                  <span>Total:</span>
                  <strong style={{ color: '#c4915a', fontSize: '20px' }}>${cartTotal.toFixed(2)}</strong>
                </div>
                <button type="submit" style={s.btnDark}>Place Order →</button>
                <button type="button" onClick={() => setCheckout(false)} style={s.btnLight}>← Back to cart</button>
              </form>
            ) : cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
                <p style={{ color: '#a0612a' }}>Your cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.product_id} style={s.cartItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#3d1f0a' }}>{item.name}</div>
                      <div style={{ color: '#c4915a', fontSize: '14px', fontWeight: 700 }}>${item.price.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => updateQty(item.product_id, item.quantity - 1)} style={s.qtyBtn}>-</button>
                      <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, item.quantity + 1)} style={s.qtyBtn}>+</button>
                    </div>
                  </div>
                ))}
                <div style={s.totalRow}>
                  <span>Total:</span>
                  <strong style={{ color: '#c4915a', fontSize: '20px' }}>${cartTotal.toFixed(2)}</strong>
                </div>
                <button onClick={() => setCheckout(true)} style={s.btnDark}>Checkout →</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', background: '#faf7f4', fontFamily: 'Inter, -apple-system, sans-serif', margin: 0 },
  header: { background: '#fff', borderBottom: '1px solid #e8d5c0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  logo: { fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#3d1f0a', textDecoration: 'none', letterSpacing: '0.04em' },
  navLink: { color: '#3d1f0a', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500 },
  cartBtn: { background: '#3d1f0a', color: '#fff5e8', border: 'none', padding: '10px 18px', borderRadius: '999px', cursor: 'pointer', fontSize: '14px', position: 'relative' },
  cartBadge: { background: '#c4915a', color: '#3d1f0a', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, marginLeft: '6px' },
  banner: { background: 'linear-gradient(180deg, #c4915a 0%, #a0612a 100%)', color: '#fff5e8', padding: '60px 24px', textAlign: 'center' },
  title: { fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(3rem, 10vw, 6rem)', letterSpacing: '0.02em', margin: 0 },
  subtitle: { fontSize: '15px', opacity: 0.9, marginTop: '8px' },
  catBar: { display: 'flex', gap: '8px', padding: '20px 24px', overflowX: 'auto', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' },
  catBtn: { background: '#fff', border: '1px solid #e8d5c0', color: '#3d1f0a', padding: '8px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  catActive: { background: '#3d1f0a', color: '#fff5e8', border: '1px solid #3d1f0a', padding: '8px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  section: { padding: '20px 24px 60px', maxWidth: '1200px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' },
  card: { background: '#fff', border: '1px solid #e8d5c0', borderRadius: '12px', overflow: 'hidden' },
  imgBox: { background: 'linear-gradient(135deg, #f5e6d3, #c4915a)', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tag: { fontSize: '10px', color: '#a0612a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', fontWeight: 600 },
  pName: { fontSize: '15px', fontWeight: 600, color: '#3d1f0a', margin: '0 0 4px 0' },
  pDesc: { fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.5 },
  pPrice: { fontSize: '18px', fontWeight: 700, color: '#c4915a' },
  addBtn: { background: '#3d1f0a', color: '#fff5e8', border: 'none', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
  empty: { background: '#fff', border: '1px dashed #e8d5c0', borderRadius: '16px', padding: '60px 24px', textAlign: 'center' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' },
  drawer: { background: '#fff', width: '100%', maxWidth: '420px', height: '100vh', padding: '24px', overflowY: 'auto' },
  closeBtn: { background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#3d1f0a' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e8d5c0' },
  qtyBtn: { width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e8d5c0', background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#3d1f0a' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderTop: '2px solid #3d1f0a', marginTop: '16px', fontSize: '16px', fontWeight: 600, color: '#3d1f0a' },
  btnDark: { width: '100%', background: '#3d1f0a', color: '#fff5e8', border: 'none', padding: '14px', borderRadius: '999px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, marginTop: '12px', textTransform: 'uppercase' },
  btnLight: { width: '100%', background: 'transparent', color: '#3d1f0a', border: '1px solid #e8d5c0', padding: '14px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', marginTop: '8px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#a0612a', marginBottom: '6px', marginTop: '12px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e8d5c0', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
}
