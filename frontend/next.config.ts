/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 100],
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