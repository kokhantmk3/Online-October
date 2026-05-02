import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online October',
  description: 'Shop every season — quality products, fair prices, real-time delivery tracking.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
