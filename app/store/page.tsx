export default function Page() {
  if (typeof window !== 'undefined') {
    window.location.href = '/store.html'
  }
  return (
    <script dangerouslySetInnerHTML={{
      __html: "window.location.href='/store.html'"
    }} />
  )
}
