import { useActuatorControl } from '../../hooks/useActuatorControl';
import ActuatorSwitch from './ActuatorSwitch';

const actuatorLabels = {
  water_pump: { label: '워터 펌프', icon: '🚿', description: '수조에 물을 공급합니다' },
  air_pump: { label: '에어 펌프', icon: '💨', description: '용존산소(DO) 수준을 높입니다' },
  valve: { label: '밸브 (pH 조절)', icon: '🔧', description: 'pH 값을 조절합니다' },
  heater: { label: '히터', icon: '🔥', description: '수조 온도를 상승시킵니다' },
  cooler: { label: '쿨러', icon: '❄️', description: '수조 온도를 하강시킵니다' },
};

export default function ActuatorControl({ moduleId }) {
  const { status, loading, error, controlActuator } = useActuatorControl(moduleId);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">액추에이터 상태 로딩 중...</p>
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

  if (!status) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-4xl mb-4">⚙️</div>
        <p className="text-gray-600 font-medium">액추에이터 상태를 불러올 수 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">모듈 연결을 확인해주세요.</p>
      </div>
    );
  }

  const activeCount = Object.values(status).filter((v) => v === true).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">액추에이터 제어</h3>
          <p className="text-sm text-gray-600">
            현재 {activeCount}개의 액추에이터가 작동 중입니다
          </p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
          {activeCount} / {Object.keys(actuatorLabels).length}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
        <div className="space-y-4">
          {Object.keys(actuatorLabels).map((actuator) => (
            <ActuatorSwitch
              key={actuator}
              label={actuatorLabels[actuator].label}
              icon={actuatorLabels[actuator].icon}
              value={status[actuator]}
              onChange={(newValue) => controlActuator(actuator, newValue)}
              loading={loading}
            />
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-xl">ℹ️</span>
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">주의사항</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>액추에이터를 제어하기 전에 센서 데이터를 확인하세요.</li>
              <li>자동 제어 모드가 활성화되어 있으면 수동 제어가 제한될 수 있습니다.</li>
              <li>변경 사항은 즉시 아두이노 모듈에 전송됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

