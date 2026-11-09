/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [20, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/shipping',
        destination: '/shipping-policy',
        permanent: true,
      },
      {
        source: '/returns',
        destination: '/refund-policy',
        permanent: true,
      },
      {
        source: '/shop',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/track',
        destination: '/profile',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;