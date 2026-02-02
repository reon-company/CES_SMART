export default function ModuleCard({ module, onDelete, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'inactive':
        return '⏸️';
      case 'error':
        return '⚠️';
      default:
        return '❓';
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
      onClick={() => onClick(module.module_id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-4xl">🔌</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{module.name}</h3>
            <p className="text-sm text-gray-500 font-mono">ID: {module.module_id}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border-2 flex items-center space-x-1 ${getStatusColor(
            module.status
          )}`}
        >
          <span>{getStatusIcon(module.status)}</span>
          <span>
            {module.status === 'active' ? '활성' : module.status === 'inactive' ? '비활성' : '오류'}
          </span>
        </span>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(module.module_id);
          }}
          className="text-blue-500 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
        >
          <span>상세 보기</span>
          <span>→</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`정말 "${module.name}" 모듈을 삭제하시겠습니까?`)) {
              onDelete(module.id);
            }
          }}
          className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

