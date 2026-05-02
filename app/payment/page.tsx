export default function Page() {
  if (typeof window !== 'undefined') {
    window.location.href = '/payment.html'
  }
  return (
    <script dangerouslySetInnerHTML={{
      __html: "window.location.href='/payment.html'"
    }} />
  )
}
