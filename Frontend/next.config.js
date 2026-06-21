/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiURL = process.env.VITE_API_URL || 'http://localhost:5001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiURL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;