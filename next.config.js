/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'supabase.matbaohosting.com',
        port: '8000',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http', // hoặc 'https' tùy server của bạn
        hostname: '192.168.13.31', // Thay bằng IP thật của bạn
        port: '3003', // Để trống nếu dùng port mặc định (80/443), hoặc điền '8000' nếu giống cái trên
        pathname: '/**', // Cho phép tất cả đường dẫn từ IP này
      },
    ],
  },
}

module.exports = nextConfig
