/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Для обратной совместимости
    domains: ['localhost'],
  },
  // Для работы на хостинге
  output: 'standalone',
}

module.exports = nextConfig


