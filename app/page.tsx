export default function Home() {
  return (
    <main style={{
      fontFamily: "'Georgia', serif",
      background: "#faf7f4",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
      padding: "2rem",
      color: "#3d1f0a"
    }}>
      <div style={{
        background: "#3d1f0a",
        color: "#fff5e8",
        padding: "1rem 2rem",
        borderRadius: "999px",
        fontSize: "12px",
        letterSpacing: "0.1em",
        marginBottom: "1.5rem",
        textTransform: "uppercase"
      }}>
        🍂 Now live
      </div>

      <h1 style={{
        fontSize: "clamp(2.5rem, 8vw, 5rem)",
        fontWeight: "600",
        lineHeight: "1",
        marginBottom: "0.5rem",
        color: "#3d1f0a"
      }}>
        Online
      </h1>
      <h1 style={{
        fontSize: "clamp(2.5rem, 8vw, 5rem)",
        fontWeight: "600",
        lineHeight: "1",
        marginBottom: "1.5rem",
        color: "#c4915a"
      }}>
        October®
      </h1>

      <p style={{
        fontSize: "16px",
        color: "#a0612a",
        marginBottom: "2.5rem",
        opacity: 0.8
      }}>
        Your store is live. Shop every season.
      </p>

      <div style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <a href="/store" style={{
          background: "#3d1f0a",
          color: "#fff5e8",
          padding: "12px 28px",
          borderRadius: "999px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "600",
          fontFamily: "sans-serif"
        }}>
          Visit Store →
        </a>
        <a href="/admin" style={{
          background: "transparent",
          color: "#3d1f0a",
          padding: "12px 28px",
          borderRadius: "999px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "600",
          fontFamily: "sans-serif",
          border: "1px solid #ddd0c0"
        }}>
          Admin Panel
        </a>
      </div>

      <div style={{
        marginTop: "4rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "12px",
        maxWidth: "600px",
        width: "100%"
      }}>
        {[
          { emoji: "🗄️", label: "Supabase", status: "Connected ✅" },
          { emoji: "💳", label: "Stripe", status: "Coming soon" },
          { emoji: "📧", label: "SendGrid", status: "Coming soon" },
          { emoji: "🌍", label: "5 Languages", status: "Ready ✅" },
        ].map((item) => (
          <div key={item.label} style={{
            background: "#fff",
            border: "1px solid #e8d5c0",
            borderRadius: "12px",
            padding: "1rem",
            fontFamily: "sans-serif"
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{item.emoji}</div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#3d1f0a" }}>{item.label}</div>
            <div style={{ fontSize: "11px", color: "#a0612a", marginTop: "2px" }}>{item.status}</div>
          </div>
        ))}
      </div>

      <p style={{
        marginTop: "3rem",
        fontSize: "11px",
        color: "#a0612a",
        opacity: 0.5,
        fontFamily: "sans-serif"
      }}>
        © 2026 Online October · Built with Next.js + Supabase
      </p>
    </main>
  )
}
