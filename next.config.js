/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/landing', destination: '/landing.html' },
      { source: '/store', destination: '/store.html' },
      { source: '/admin', destination: '/admin.html' },
      { source: '/loyalty', destination: '/loyalty.html' },
      { source: '/payment', destination: '/payment.html' },
      { source: '/checkout', destination: '/store.html' },
      { source: '/track', destination: '/store.html' },
    ]
  },
}

module.exports = nextConfig
