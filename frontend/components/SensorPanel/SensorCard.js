export default function SensorCard({ title, value, unit, icon, threshold, status }) {
  const getStatusColor = () => {
    if (status === 'warning') return 'border-yellow-400 bg-yellow-50';
    if (status === 'danger') return 'border-red-400 bg-red-50';
    if (status === 'good') return 'border-green-400 bg-green-50';
    return 'border-gray-200 bg-white';
  };

  const getIcon = () => {
    if (icon) return icon;
    const iconMap = {
      '워터 레벨': '💧',
      '온도': '🌡️',
      '용존산소 (DO)': '💨',
      'pH': '🧪',
      '조도': '💡',
      'WiFi 신호 강도': '📶',
    };
    return iconMap[title] || '📊';
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    
    // 숫자로 변환 시도
    const numVal = Number(val);
    if (!isNaN(numVal)) {
      // 숫자로 변환 성공
      if (unit === '%' || unit === '°C' || unit === 'mg/L') {
        return `${numVal.toFixed(1)}${unit || ''}`;
      }
      if (unit === 'dBm') {
        // WiFi RSSI는 소수점 없이 표시
        return `${Math.round(numVal)}${unit || ''}`;
      }
      return `${numVal.toFixed(2)}${unit || ''}`;
    }
    
    // 숫자로 변환 실패 시 원본 값 반환
    return `${val} ${unit || ''}`;
  };

  return (
    <div className={`rounded-xl shadow-md p-6 border-2 transition-all hover:shadow-lg ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{getIcon()}</span>
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className={`text-3xl font-bold ${status === 'danger' ? 'text-red-600' : status === 'warning' ? 'text-yellow-600' : 'text-gray-900'}`}>
            {formatValue(value)}
          </p>
          {threshold && (
            <p className="text-xs text-gray-500 mt-1">
              임계값: {threshold.min !== undefined ? `${threshold.min}~` : ''}
              {threshold.max !== undefined ? threshold.max : ''}
            </p>
          )}
        </div>
        {status && (
          <div className="ml-4">
            {status === 'danger' && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
            {status === 'warning' && (
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            )}
            {status === 'good' && (
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

