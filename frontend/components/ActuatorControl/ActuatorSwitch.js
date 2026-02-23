import { useState, useEffect } from 'react';

// 유지보수 메모:
// 즉각 반응성을 유지하기 위해 롤백 기능이 있는 낙관적 UI 토글이 적용됩니다.
export default function ActuatorSwitch({ label, value, onChange, loading, icon }) {
  const [isOn, setIsOn] = useState(value || false);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    setIsOn(value || false);
  }, [value]);

  const handleToggle = async () => {
    if (loading || isChanging) return;
    
    const newValue = !isOn;
    setIsOn(newValue);
    setIsChanging(true);
    
    const success = await onChange(newValue);
    if (!success) {
      setIsOn(!newValue); // Revert on error
    }
    
    setIsChanging(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    const iconMap = {
      '워터 펌프': '🚿',
      '에어 펌프': '💨',
      '밸브 (pH 조절)': '🔧',
      '히터': '🔥',
      '쿨러': '❄️',
    };
    return iconMap[label] || '⚙️';
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-5 flex items-center justify-between border-2 transition-all ${
      isOn ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
    } ${loading || isChanging ? 'opacity-60' : 'hover:shadow-lg'}`}>
      <div className="flex items-center space-x-4 flex-1">
        <div className={`text-3xl ${isOn ? 'opacity-100' : 'opacity-50'}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <span className={`text-gray-900 font-semibold block ${isOn ? 'text-blue-700' : ''}`}>
            {label}
          </span>
          <span className={`text-xs mt-1 block ${isOn ? 'text-blue-600' : 'text-gray-500'}`}>
            {isOn ? '작동 중' : '대기 중'}
          </span>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading || isChanging}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
          isOn ? 'bg-blue-500' : 'bg-gray-300'
        } ${loading || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
            isOn ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
      {(loading || isChanging) && (
        <div className="ml-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

