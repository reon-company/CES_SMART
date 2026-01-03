/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  async rewrites() {
    // 프로덕션 환경에서 API 요청을 백엔드로 프록시
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.36.109.155:3000';
    
    // 백엔드 URL에서 프로토콜과 호스트 추출
    const url = new URL(backendUrl);
    const backendHost = `${url.protocol}//${url.host}`;
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendHost}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig

