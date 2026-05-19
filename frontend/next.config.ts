const nextConfig = {
  output: 'standalone',
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
    },
  ],
};

module.exports = nextConfig;