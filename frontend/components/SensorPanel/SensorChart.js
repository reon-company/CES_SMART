import { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { sensorsAPI } from '../../lib/api/sensors';

export default function SensorChart({ moduleId, sensorType, title }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24시간 전

        const response = await sensorsAPI.getHistory(moduleId, startDate, endDate, 100, 0);
        if (response.success) {
          const data = response.data
            .map((item) => [
              new Date(item.created_at).getTime(),
              item[sensorType],
            ])
            .filter((item) => item[1] !== null && item[1] !== undefined)
            .sort((a, b) => a[0] - b[0]);

          setChartData(data);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchHistory();
    }
  }, [moduleId, sensorType]);

  const options = {
    chart: {
      type: 'line',
      height: 300,
    },
    title: {
      text: title,
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: '값',
      },
    },
    series: [
      {
        name: title,
        data: chartData,
      },
    ],
    credits: {
      enabled: false,
    },
  };

  if (loading) {
    return <div className="text-center py-8">차트 데이터 로딩 중...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

