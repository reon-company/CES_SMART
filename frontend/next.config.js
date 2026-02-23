/** @type {import('next').NextConfig} */
// 유지보수 메모:
// NEXT_PUBLIC_API_BASE_URL 노출을 최소화하고, 공개해도 안전한 값만 전달하세요.
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}

module.exports = nextConfig

