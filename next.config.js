/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/landing', destination: '/landing.html' },
      { source: '/loyalty', destination: '/loyalty.html' },
      { source: '/payment', destination: '/payment.html' },
    ]
  },
}

module.exports = nextConfig
