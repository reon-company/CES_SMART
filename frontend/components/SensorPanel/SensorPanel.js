import { useSensorData } from '../../hooks/useSensorData';
import SensorCard from './SensorCard';

// 유지보수 메모:
// 로컬 임계값 기본값은 UI 힌트일 뿐이며, 서버 측 임계값 설정이 최종 적용됩니다.
export default function SensorPanel({ moduleId }) {
  const { data, loading, error } = useSensorData(moduleId);

  const getSensorStatus = (sensorType, value) => {
    if (value === null || value === undefined) return null;
    
    // 기본 임계값 (실제로는 API에서 가져와야 함)
    const thresholds = {
      water_level: { min: 20, max: 80 },
      temperature: { min: 20, max: 28 },
      do_level: { min: 5, max: 10 },
      ph_level: { min: 6.5, max: 8.5 },
      light_level: { min: 30, max: 70 },
    };

    const threshold = thresholds[sensorType];
    if (!threshold) return null;

    if (value < threshold.min || value > threshold.max) {
      return 'danger';
    }
    if (
      value < threshold.min * 1.1 ||
      value > threshold.max * 0.9
    ) {
      return 'warning';
    }
    return 'good';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">센서 데이터 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl">
        <div className="flex items-center space-x-2">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-gray-600 font-medium">센서 데이터가 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">아두이노 모듈이 데이터를 전송할 때까지 기다려주세요.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SensorCard
          title="워터 레벨"
          value={data.water_level}
          unit="%"
          status={getSensorStatus('water_level', data.water_level)}
          threshold={{ min: 20, max: 80 }}
        />
        <SensorCard
          title="온도"
          value={data.temperature}
          unit="°C"
          status={getSensorStatus('temperature', data.temperature)}
          threshold={{ min: 20, max: 28 }}
        />
        <SensorCard
          title="용존산소 (DO)"
          value={data.do_level}
          unit="mg/L"
          status={getSensorStatus('do_level', data.do_level)}
          threshold={{ min: 5, max: 10 }}
        />
        <SensorCard
          title="pH"
          value={data.ph_level}
          unit=""
          status={getSensorStatus('ph_level', data.ph_level)}
          threshold={{ min: 6.5, max: 8.5 }}
        />
        <SensorCard
          title="조도"
          value={data.light_level}
          unit="%"
          status={getSensorStatus('light_level', data.light_level)}
          threshold={{ min: 30, max: 70 }}
        />
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">🕐</span>
            <p className="text-sm font-semibold text-gray-700">마지막 업데이트</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {new Date(data.created_at).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            다음 업데이트: 약 30초 후
          </p>
        </div>
      </div>
    </div>
  );
}

