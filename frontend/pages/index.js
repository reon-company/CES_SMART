import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <h1 className="text-2xl font-bold">CES 스마트팜 시스템</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a 
                href="/setup" 
                className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                설치 가이드
              </a>
              <a 
                href="/login" 
                className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                로그인
              </a>
              <a 
                href="/register" 
                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                회원가입
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">스마트 수조 관리 시스템</h2>
          <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
            5개의 센서를 통해 실시간으로 수조 상태를 모니터링하고, 
            릴레이를 통해 액추에이터를 자동 제어하는 지능형 관리 시스템입니다.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/setup" 
              className="px-8 py-3 bg-yellow-300 text-gray-900 rounded-lg font-semibold hover:bg-yellow-200 transition shadow-lg"
            >
              설치 및 셋업
            </a>
            <a 
              href="/register" 
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              무료로 시작하기
            </a>
            <a 
              href="#features" 
              className="px-8 py-3 bg-white bg-opacity-20 rounded-lg font-semibold hover:bg-opacity-30 transition"
            >
              기능 알아보기
            </a>
          </div>
        </div>
      </section>

      {/* 시스템 아키텍처 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">시스템 아키텍처</h3>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-purple-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-center flex-1 min-w-[150px]">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-2">
                    <div className="text-2xl mb-2">🌐</div>
                    <div className="font-semibold text-gray-700">Vercel</div>
                    <div className="text-sm text-gray-500">프론트엔드</div>
                  </div>
                </div>
                <div className="text-3xl text-purple-500">↔</div>
                <div className="text-center flex-1 min-w-[150px]">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-2">
                    <div className="text-2xl mb-2">☁️</div>
                    <div className="font-semibold text-gray-700">AWS Lightsail</div>
                    <div className="text-sm text-gray-500">백엔드</div>
                  </div>
                </div>
                <div className="text-3xl text-purple-500">↔</div>
                <div className="text-center flex-1 min-w-[150px]">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-2">
                    <div className="text-2xl mb-2">🗄️</div>
                    <div className="font-semibold text-gray-700">AWS RDS</div>
                    <div className="text-sm text-gray-500">데이터베이스</div>
                  </div>
                </div>
                <div className="text-3xl text-purple-500">↔</div>
                <div className="text-center flex-1 min-w-[150px]">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-2">
                    <div className="text-2xl mb-2">🔌</div>
                    <div className="font-semibold text-gray-700">아두이노 R4</div>
                    <div className="text-sm text-gray-500">하드웨어 모듈</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">주요 기능</h3>
          
          {/* 센서 모니터링 */}
          <div className="mb-12">
            <h4 className="text-2xl font-semibold mb-6 text-gray-700">📊 센서 모니터링</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: '💧', title: '워터 레벨', desc: '0-100% 실시간 모니터링', color: 'blue' },
                { icon: '🌡️', title: '온도', desc: 'DS18B20 센서', color: 'red' },
                { icon: '💨', title: '용존산소 (DO)', desc: 'SEN0237-A 센서', color: 'green' },
                { icon: '🧪', title: 'pH', desc: '0-14 범위 측정', color: 'yellow' },
                { icon: '💡', title: '조도', desc: 'Grove Light Sensor', color: 'purple' },
              ].map((sensor, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all shadow-md">
                  <div className={`w-16 h-16 bg-${sensor.color}-100 text-${sensor.color}-600 rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto`}>
                    {sensor.icon}
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2 text-center">{sensor.title}</h5>
                  <p className="text-sm text-gray-600 text-center">{sensor.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 액추에이터 제어 */}
          <div className="mb-12">
            <h4 className="text-2xl font-semibold mb-6 text-gray-700">⚙️ 액추에이터 제어</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: '🚿', title: '워터 펌프', desc: '자동/수동 제어', color: 'cyan' },
                { icon: '💨', title: '에어 펌프', desc: 'DO 조절용', color: 'blue' },
                { icon: '🔧', title: '액추에이터 밸브', desc: 'pH 조절용', color: 'orange' },
                { icon: '🔥', title: '히터', desc: '온도 상승 제어', color: 'red' },
                { icon: '❄️', title: '쿨러', desc: '온도 하강 제어', color: 'indigo' },
              ].map((actuator, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all shadow-md">
                  <div className={`w-16 h-16 bg-${actuator.color}-100 text-${actuator.color}-600 rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto`}>
                    {actuator.icon}
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2 text-center">{actuator.title}</h5>
                  <p className="text-sm text-gray-600 text-center">{actuator.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 시스템 특징 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔄', title: '실시간 업데이트', desc: '30초마다 센서 데이터가 자동으로 업데이트되어 최신 상태를 확인할 수 있습니다.' },
              { icon: '🤖', title: '자동 제어', desc: '설정한 임계값에 따라 액추에이터가 자동으로 작동하여 최적의 환경을 유지합니다.' },
              { icon: '📈', title: '데이터 시각화', desc: 'Highcharts를 이용한 센서 데이터 히스토리 차트로 추이를 한눈에 확인할 수 있습니다.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all shadow-lg">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h5 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h5>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 모듈 관리 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">모듈 관리</h3>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🔌</div>
                <h4 className="text-2xl font-semibold text-gray-800 mb-2">최대 30개 모듈 지원</h4>
                <p className="text-gray-600">
                  각 모듈은 고유한 아두이노 R4 하드웨어와 연결되며, 
                  사용자별로 자신이 등록한 모듈만 접근 및 제어가 가능합니다.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">30개</div>
                  <div className="text-sm text-gray-600">최대 모듈 수</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">30초</div>
                  <div className="text-sm text-gray-600">데이터 업데이트 주기</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">5개</div>
                  <div className="text-sm text-gray-600">센서 종류</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">지금 시작하세요</h3>
          <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
            스마트팜 시스템으로 수조 관리를 자동화하고, 
            실시간 모니터링과 자동 제어의 편리함을 경험해보세요.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/register" 
              className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg text-lg"
            >
              무료 회원가입
            </a>
            <a 
              href="/login" 
              className="px-8 py-4 bg-white bg-opacity-20 rounded-lg font-semibold hover:bg-opacity-30 transition text-lg"
            >
              로그인
            </a>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="mb-2">© 2024 CES 스마트팜 시스템. All rights reserved.</p>
            <p className="text-sm text-gray-500">ISC License</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

