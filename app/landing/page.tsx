export default function Page() {
  if (typeof window !== 'undefined') {
    window.location.href = '/landing.html'
  }
  return (
    <script dangerouslySetInnerHTML={{
      __html: "window.location.href='/landing.html'"
    }} />
  )
}
