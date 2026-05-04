export default function Home() {
  const pages = [
    { href: '/landing', emoji: '🏠', label: 'Landing Page', desc: '5-language marketing page' },
    { href: '/store', emoji: '🛍️', label: 'Store', desc: 'Browse & buy products' },
    { href: '/admin', emoji: '⚙️', label: 'Admin Panel', desc: 'Manage products & orders' },
    { href: '/loyalty', emoji: '🪙', label: 'Loyalty', desc: 'Member rewards' },
    { href: '/payment', emoji: '💳', label: 'Payment', desc: 'Payment options' },
  ]

  return (
    <main style={{ fontFamily: '-apple-system, sans-serif', background: '#faf7f4', minHeight: '100vh', padding: '2rem 1.5rem', color: '#3d1f0a', margin: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '900px', margin: '0 auto 3rem' }}>
        <div style={{ display: 'inline-block', background: '#3d1f0a', color: '#fff5e8', padding: '6px 20px', borderRadius: '999px', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>🍂 Live</div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 700, lineHeight: 1, marginBottom: '0.25rem' }}>Online</h1>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 700, lineHeight: 1, color: '#c4915a', margin: '0 0 1rem 0' }}>October®</h1>
        <p style={{ fontSize: '15px', color: '#a0612a', opacity: 0.7 }}>Tap any page below to view it</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', maxWidth: '800px', margin: '0 auto 2rem' }}>
        {pages.map((page) => (
          <a key={page.href} href={page.href} className="page-card" style={{ display: 'block', background: '#fff', border: '1px solid #e8d5c0', borderRadius: '14px', padding: '1.5rem', textDecoration: 'none', color: '#3d1f0a' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{page.emoji}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{page.label}</div>
            <div style={{ fontSize: '13px', color: '#a0612a', opacity: 0.7 }}>{page.desc}</div>
            <div style={{ marginTop: '1rem', fontSize: '12px', color: '#c4915a', fontWeight: 700 }}>OPEN →</div>
          </a>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#a0612a', opacity: 0.4 }}>© 2026 Online October®</p>

      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; }
        .page-card { transition: all 0.2s; }
        .page-card:hover { border-color: #c4915a !important; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(61,31,10,0.1); }
      ` }} />
    </main>
  )
}
