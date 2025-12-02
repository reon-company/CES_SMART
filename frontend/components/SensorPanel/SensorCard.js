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
    };
    return iconMap[title] || '📊';
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'number') {
      if (unit === '%' || unit === '°C' || unit === 'mg/L') {
        return `${val.toFixed(1)}${unit || ''}`;
      }
      return `${val.toFixed(2)}${unit || ''}`;
    }
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

