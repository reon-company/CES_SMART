// API 기본 설정
// 로컬 개발: http://localhost:3000
// 프로덕션: http://54.180.160.232:3000
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'http://54.180.160.232:3000';

// API 요청 헬퍼 함수
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      ...config,
    });

    const data = await response.json();

    if (!response.ok) {
      throw { response: { status: response.status, data } };
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
const authAPI = {
  register: async (email, password, name) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return apiRequest('/api/auth/me');
  },

  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
};

// Modules API
const modulesAPI = {
  getAll: async () => {
    return apiRequest('/api/modules');
  },

  getById: async (id) => {
    return apiRequest(`/api/modules/${id}`);
  },

  create: async (name, macAddress) => {
    return apiRequest('/api/modules', {
      method: 'POST',
      body: JSON.stringify({ name, macAddress }),
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/modules/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sensors API
const sensorsAPI = {
  getData: async (moduleId) => {
    return apiRequest(`/api/sensors/${moduleId}`);
  },
};

// Actuators API
const actuatorsAPI = {
  getStatus: async (moduleId) => {
    return apiRequest(`/api/actuators/${moduleId}`);
  },

  control: async (moduleId, actuatorType, action) => {
    return apiRequest(`/api/actuators/${moduleId}/${actuatorType}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },
};

