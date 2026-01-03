// API 기본 설정
// 로컬 개발: http://localhost:3000
// 프로덕션: HTTPS 백엔드 필요 (Mixed Content 오류 방지)
const getApiBaseUrl = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocal) {
        return 'http://localhost:3000';
    }

    // 프로덕션: HTTP 사용 (HTTPS는 도메인 설정 후 적용)
    return 'http://43.203.141.2';
};

const API_BASE_URL = getApiBaseUrl();

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
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('API Request:', url, options);

        const response = await fetch(url, {
            ...options,
            ...config,
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`서버 응답 오류: ${text || response.statusText}`);
        }

        if (!response.ok) {
            throw { response: { status: response.status, data } };
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);

        // 네트워크 오류 처리
        if (error instanceof TypeError && (
            error.message.includes('fetch') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('network')
        )) {
            // SSL 인증서 오류 감지
            if (error.message.includes('CERT') || error.message.includes('certificate')) {
                throw {
                    response: {
                        status: 0,
                        data: { 
                            message: 'SSL 인증서 오류: 브라우저에서 "고급" → "54.180.237.225(으)로 이동"을 클릭하여 인증서를 허용해주세요.',
                            sslError: true
                        }
                    }
                };
            }
            
            // HTTPS 페이지에서 HTTP API 호출 시도 감지
            if (window.location.protocol === 'https:' && API_BASE_URL.startsWith('http:')) {
                throw {
                    response: {
                        status: 0,
                        data: { 
                            message: 'HTTPS 보안 정책으로 인해 HTTP API를 호출할 수 없습니다. 백엔드 서버에 HTTPS 설정이 필요합니다.' 
                        }
                    }
                };
            }
            
            throw {
                response: {
                    status: 0,
                    data: { message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.' }
                }
            };
        }

        // 기존 에러 형식 유지
        if (error.response) {
            throw error;
        }

        // 기타 오류
        throw {
            response: {
                status: 500,
                data: { message: error.message || '알 수 없는 오류가 발생했습니다.' }
            }
        };
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

