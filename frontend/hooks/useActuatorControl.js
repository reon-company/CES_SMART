import { useState, useEffect } from 'react';
import { actuatorsAPI } from '../lib/api/actuators';

// 유지보수 메모:
// UI 반응성을 위해 제어 요청 후 즉시 로컬 상태를 업데이트합니다.
export function useActuatorControl(moduleId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      const response = await actuatorsAPI.getStatus(moduleId);
      if (response.success) {
        setStatus(response.status);
      }
    } catch (err) {
      setError(err.response?.data?.message || '액추에이터 상태를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const controlActuator = async (actuator, newStatus) => {
    try {
      setError(null);
      const response = await actuatorsAPI.control(moduleId, actuator, newStatus);
      if (response.success) {
        setStatus(response.status);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || '액추에이터 제어에 실패했습니다.');
      return false;
    }
    return false;
  };

  useEffect(() => {
    if (!moduleId) return;
    fetchStatus();
  }, [moduleId]);

  return { status, loading, error, controlActuator, refetch: fetchStatus };
}

