import '../styles/globals.css'

// 유지보수 메모:
// 전역 래퍼를 최소화하고, 대시보드와 인증 라우트가 이 진입점을 공유하므로
// 공통 제공자를 신중하게 추가하세요.
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}

