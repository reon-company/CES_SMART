import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { modulesAPI } from '../../lib/api/modules';
import ModuleCard from './ModuleCard';
import AddModuleModal from './AddModuleModal';

export default function ModuleList() {
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await modulesAPI.getAll();
      if (response.success) {
        setModules(response.modules);
      }
    } catch (error) {
      setError('모듈 목록을 불러오는데 실패했습니다.');
      console.error('Fetch modules error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (name, moduleId, wifiSsid, wifiPassword) => {
    try {
      const response = await modulesAPI.create(name, moduleId, wifiSsid, wifiPassword);
      if (response.success) {
        setShowAddModal(false);
        fetchModules();
      }
    } catch (error) {
      setError(error.response?.data?.message || '모듈 추가에 실패했습니다.');
    }
  };

  const handleDeleteModule = async (id) => {
    if (!confirm('정말 이 모듈을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await modulesAPI.delete(id);
      if (response.success) {
        fetchModules();
      }
    } catch (error) {
      setError(error.response?.data?.message || '모듈 삭제에 실패했습니다.');
    }
  };

  const handleModuleClick = (moduleId) => {
    router.push(`/dashboard/modules/${moduleId}`);
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          총 {modules.length}개의 모듈 (최대 30개)
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={modules.length >= 30}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          모듈 추가
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">등록된 모듈이 없습니다.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            첫 모듈 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onDelete={handleDeleteModule}
              onClick={handleModuleClick}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddModuleModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddModule}
        />
      )}
    </div>
  );
}

