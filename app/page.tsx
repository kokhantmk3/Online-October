export default function Home() {
  const pages = [
    { href: '/landing', emoji: '🏠', label: 'Landing Page', desc: 'Your main marketing page' },
    { href: '/store', emoji: '🛍️', label: 'Store', desc: 'Customer shopping experience' },
    { href: '/checkout', emoji: '💳', label: 'Checkout', desc: 'Payment & order placement' },
    { href: '/loyalty', emoji: '🪙', label: 'Loyalty Program', desc: 'Member points & rewards' },
    { href: '/payment', emoji: '💰', label: 'Payment Methods', desc: 'Global payment options' },
    { href: '/admin', emoji: '⚙️', label: 'Admin Panel', desc: 'Manage your store' },
  ]

  return (
    <main style={{
      fontFamily: 'Georgia, serif',
      background: '#faf7f4',
      minHeight: '100vh',
      padding: '2rem 1.5rem',
      color: '#3d1f0a'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-block',
          background: '#3d1f0a',
          color: '#fff5e8',
          padding: '6px 20px',
          borderRadius: '999px',
          fontSize: '11px',
          letterSpacing: '0.1em',
          marginBottom: '1.5rem',
          fontFamily: 'sans-serif',
          textTransform: 'uppercase'
        }}>🍂 Live on Vercel</div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          fontWeight: '600',
          lineHeight: '1',
          marginBottom: '0.5rem'
        }}>Online</h1>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          fontWeight: '600',
          lineHeight: '1',
          color: '#c4915a',
          marginBottom: '1rem'
        }}>October®</h1>
        <p style={{
          fontFamily: 'sans-serif',
          fontSize: '14px',
          color: '#a0612a',
          opacity: 0.7
        }}>Your e-commerce platform · 5 languages · Global payments</p>
      </div>

      {/* Pages Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        maxWidth: '800px',
        margin: '0 auto 3rem'
      }}>
        {pages.map((page) => (
          <a key={page.href} href={page.href} style={{
            display: 'block',
            background: '#fff',
            border: '1px solid #e8d5c0',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            textDecoration: 'none',
            color: '#3d1f0a',
            transition: 'all 0.2s',
            fontFamily: 'sans-serif'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#c4915a'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#e8d5c0'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{page.emoji}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{page.label}</div>
            <div style={{ fontSize: '12px', color: '#a0612a', opacity: 0.7 }}>{page.desc}</div>
            <div style={{
              marginTop: '0.875rem',
              fontSize: '11px',
              color: '#c4915a',
              fontWeight: '600',
              letterSpacing: '0.04em'
            }}>OPEN →</div>
          </a>
        ))}
      </div>

      {/* Status */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        marginBottom: '2rem'
      }}>
        {[
          { emoji: '🗄️', label: 'Supabase', status: 'Connected', ok: true },
          { emoji: '💳', label: 'Stripe', status: 'Setup needed', ok: false },
          { emoji: '📧', label: 'SendGrid', status: 'Setup needed', ok: false },
          { emoji: '🌍', label: '5 Languages', status: 'Ready', ok: true },
          { emoji: '🪙', label: 'Loyalty', status: 'Ready', ok: true },
          { emoji: '🚚', label: 'Delivery', status: 'Ready', ok: true },
        ].map(item => (
          <div key={item.label} style={{
            background: '#fff',
            border: '1px solid #e8d5c0',
            borderRadius: '10px',
            padding: '0.875rem',
            fontFamily: 'sans-serif',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '3px' }}>{item.emoji}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#3d1f0a' }}>{item.label}</div>
            <div style={{
              fontSize: '10px',
              marginTop: '2px',
              color: item.ok ? '#2d7a4a' : '#a0612a',
              fontWeight: '600'
            }}>{item.status} {item.ok ? '✅' : '⏳'}</div>
          </div>
        ))}
      </div>

      <p style={{
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#a0612a',
        opacity: 0.4
      }}>© 2026 Online October · Built with Next.js + Supabase · Hosted on Vercel</p>
    </main>
  )
}
