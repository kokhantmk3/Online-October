'use client'

import { useState, useEffect, useRef } from 'react'

const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Accessories', 'Footwear', 'Bikinis']

const SUPER_ADMIN = { email: 'super@oo.com', password: 'super123' }
const REGULAR_ADMIN = { email: 'admin@oo.com', password: 'admin123' }

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [view, setView] = useState<'products' | 'orders'>('products')

  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Tops', image_url: '', stock: '0'
  })

  useEffect(() => {
    if (isLoggedIn) { fetchProducts(); fetchOrders() }
  }, [isLoggedIn])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if ((email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) ||
        (email === REGULAR_ADMIN.email && password === REGULAR_ADMIN.password)) {
      setIsLoggedIn(true); setLoginError('')
    } else { setLoginError('Incorrect email or password') }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Image too large. Max 5MB.'); return }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setForm(prev => ({ ...prev, image_url: data.url }))
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) { alert('Name and price are required!'); return }
    try {
      const url = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        await fetchProducts()
        setShowAddForm(false); setEditingProduct(null)
        setForm({ name: '', description: '', price: '', category: 'Tops', image_url: '', stock: '0' })
      } else {
        const err = await res.json()
        alert('Error: ' + (err.error || 'Something went wrong'))
      }
    } catch (e: any) { alert('Error: ' + e.message) }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setForm({
      name: product.name, description: product.description || '', price: String(product.price),
      category: product.category, image_url: product.image_url || '', stock: String(product.stock || 0)
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      await fetchProducts()
    } catch (e: any) { alert('Error: ' + e.message) }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    await fetchOrders()
  }

  if (!isLoggedIn) {
    return (
      <main style={s.loginWrap}>
        <div style={s.loginCard}>
          <h1 style={s.logo}>ONLINE<br/>OCTOBER</h1>
          <p style={s.loginSub}>Admin Portal — Sign in to continue</p>
          <form onSubmit={handleLogin}>
            {loginError && <div style={s.error}>{loginError}</div>}
            <label style={s.label}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={s.input} required />
            <label style={s.label}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={s.input} required />
            <button type="submit" style={s.btnPrimary}>Sign in →</button>
            <p style={s.hint}>Super Admin: super@oo.com / super123<br/>Admin: admin@oo.com / admin123</p>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main style={s.dashWrap}>
      <header style={s.header}>
        <div>
          <h1 style={s.headerLogo}>ONLINE OCTOBER®</h1>
          <p style={s.headerSub}>Admin Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setView('products')} style={view === 'products' ? s.tabActive : s.tab}>📦 Products ({products.length})</button>
          <button onClick={() => setView('orders')} style={view === 'orders' ? s.tabActive : s.tab}>🛒 Orders ({orders.length})</button>
          <button onClick={() => setIsLoggedIn(false)} style={s.btnLogout}>Logout</button>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {view === 'products' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: '#3d1f0a' }}>Products</h2>
              <button onClick={() => { setShowAddForm(true); setEditingProduct(null); setForm({ name: '', description: '', price: '', category: 'Tops', image_url: '', stock: '0' }) }} style={s.btnPrimary}>+ Add Product</button>
            </div>

            {showAddForm && (
              <div style={s.formCard}>
                <h3 style={{ marginBottom: '1rem', color: '#3d1f0a' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSubmitProduct}>
                  <label style={s.label}>PRODUCT NAME *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={s.input} required />

                  <label style={s.label}>DESCRIPTION</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...s.input, minHeight: '80px'}} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={s.label}>PRICE (USD) *</label>
                      <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={s.input} required />
                    </div>
                    <div>
                      <label style={s.label}>STOCK</label>
                      <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={s.input} />
                    </div>
                  </div>

                  <label style={s.label}>CATEGORY *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={s.input}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <label style={s.label}>PRODUCT IMAGE</label>

                  {form.image_url && (
                    <div style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
                      <img src={form.image_url} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e8d5c0' }}/>
                      <button type="button" onClick={() => setForm({...form, image_url: ''})} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#c44', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ ...s.btnSecondary, marginTop: 0, opacity: uploading ? 0.6 : 1, cursor: uploading ? 'wait' : 'pointer' }}>
                      {uploading ? '⏳ Uploading...' : '📷 Choose Image from Computer'}
                    </button>
                    <span style={{ fontSize: '11px', color: '#a0612a' }}>JPG, PNG, WebP, GIF · Max 5MB</span>
                  </div>

                  <details style={{ marginBottom: '12px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '11px', color: '#a0612a' }}>Or paste an image URL instead</summary>
                    <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." style={{...s.input, marginTop: '8px'}} />
                  </details>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                    <button type="submit" style={s.btnPrimary}>{editingProduct ? 'Update' : 'Add'} Product</button>
                    <button type="button" onClick={() => { setShowAddForm(false); setEditingProduct(null) }} style={s.btnSecondary}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <p>Loading...</p> : (
              products.length === 0 ? (
                <div style={s.emptyState}>
                  <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</p>
                  <p>No products yet. Click "+ Add Product" to add your first one!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {products.map(p => (
                    <div key={p.id} style={s.productCard}>
                      <div style={{ background: 'linear-gradient(135deg, #f5e6d3, #c4915a)', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', overflow: 'hidden' }}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : '👕'}
                      </div>
                      <div style={{ padding: '12px' }}>
                        <div style={{ fontSize: '10px', color: '#a0612a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{p.category}</div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#3d1f0a', marginBottom: '4px' }}>{p.name}</h4>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#c4915a', marginBottom: '8px' }}>${Number(p.price).toFixed(2)}</div>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '12px' }}>Stock: {p.stock || 0}</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleEdit(p)} style={{...s.btnSmall, background: '#3d1f0a', color: '#fff5e8'}}>Edit</button>
                          <button onClick={() => handleDelete(p.id)} style={{...s.btnSmall, background: '#c44', color: '#fff'}}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}

        {view === 'orders' && (
          <>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: '#3d1f0a', marginBottom: '2rem' }}>Orders</h2>
            {orders.length === 0 ? (
              <div style={s.emptyState}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
                <p>No orders yet. They will appear here when customers buy from your store.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {orders.map(o => (
                  <div key={o.id} style={s.orderCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ color: '#3d1f0a' }}>{o.customer_name}</strong>
                        <p style={{ fontSize: '12px', color: '#a0612a' }}>{o.customer_email} · {o.customer_phone}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#c4915a' }}>${Number(o.total).toFixed(2)}</div>
                        <div style={{ fontSize: '10px', color: '#666' }}>{new Date(o.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>📍 {o.shipping_address || 'No address'}</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['pending', 'confirmed', 'shipped', 'delivered'].map(st => (
                        <button key={st} onClick={() => updateOrderStatus(o.id, st)} style={{
                          ...s.btnSmall,
                          background: o.status === st ? '#3d1f0a' : '#faf7f4',
                          color: o.status === st ? '#fff5e8' : '#3d1f0a',
                          border: '1px solid #e8d5c0'
                        }}>{st}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

const s: Record<string, React.CSSProperties> = {
  loginWrap: { minHeight: '100vh', background: '#3d1f0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, -apple-system, sans-serif' },
  loginCard: { background: '#faf7f4', borderRadius: '16px', padding: '40px', maxWidth: '420px', width: '100%' },
  logo: { fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: '#3d1f0a', lineHeight: 1, marginBottom: '8px' },
  loginSub: { color: '#a0612a', fontSize: '13px', marginBottom: '24px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#a0612a', marginBottom: '6px', marginTop: '12px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e8d5c0', fontSize: '14px', fontFamily: 'inherit', background: '#fff', color: '#3d1f0a', boxSizing: 'border-box' },
  btnPrimary: { background: '#3d1f0a', color: '#fff5e8', border: 'none', padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '16px' },
  btnSecondary: { background: '#fff', color: '#3d1f0a', border: '1px solid #e8d5c0', padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '16px' },
  btnSmall: { padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', flex: 1 },
  btnLogout: { background: 'transparent', color: '#fff5e8', border: '1px solid rgba(255,245,232,0.3)', padding: '8px 16px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer' },
  error: { background: '#fde8e8', color: '#c44', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' },
  hint: { fontSize: '11px', color: '#a0612a', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 },
  dashWrap: { minHeight: '100vh', background: '#faf7f4', fontFamily: 'Inter, -apple-system, sans-serif' },
  header: { background: '#3d1f0a', color: '#fff5e8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  headerLogo: { fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.5rem', margin: 0 },
  headerSub: { fontSize: '11px', opacity: 0.7, margin: 0 },
  tab: { background: 'transparent', color: '#fff5e8', border: '1px solid rgba(255,245,232,0.3)', padding: '8px 16px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer' },
  tabActive: { background: '#c4915a', color: '#3d1f0a', border: '1px solid #c4915a', padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  formCard: { background: '#fff', border: '1px solid #e8d5c0', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  productCard: { background: '#fff', border: '1px solid #e8d5c0', borderRadius: '12px', overflow: 'hidden' },
  orderCard: { background: '#fff', border: '1px solid #e8d5c0', borderRadius: '12px', padding: '16px' },
  emptyState: { background: '#fff', border: '1px dashed #e8d5c0', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', color: '#a0612a' },
}
