export default function Page() {
  if (typeof window !== 'undefined') {
    window.location.href = '/loyalty.html'
  }
  return (
    <script dangerouslySetInnerHTML={{
      __html: "window.location.href='/loyalty.html'"
    }} />
  )
}
