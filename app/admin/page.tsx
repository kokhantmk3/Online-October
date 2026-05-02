export default function Page() {
  if (typeof window !== 'undefined') {
    window.location.href = '/admin.html'
  }
  return (
    <script dangerouslySetInnerHTML={{
      __html: "window.location.href='/admin.html'"
    }} />
  )
}
