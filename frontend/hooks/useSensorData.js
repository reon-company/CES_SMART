import { useState, useEffect } from 'react';
import { sensorsAPI } from '../lib/api/sensors';

export function useSensorData(moduleId, interval = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await sensorsAPI.getLatest(moduleId);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || '센서 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!moduleId) return;

    fetchData();
    const timer = setInterval(fetchData, interval);

    return () => clearInterval(timer);
  }, [moduleId, interval]);

  return { data, loading, error, refetch: fetchData };
}

