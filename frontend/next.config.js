/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // SWC를 사용한 더 빠른 컴파일
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 프로덕션에서만 console 제거
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}

module.exports = nextConfig

