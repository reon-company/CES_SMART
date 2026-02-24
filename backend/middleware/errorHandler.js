// 유지보수 메모:
// 중앙화된 오류 매핑으로 API 오류 페이로드가 클라이언트에 예측 가능하게 유지됩니다.
// 라우트별 로직 중복을 피하려면 새 DB/네트워크 오류 매핑을 여기에 추가하세요.
const errorHandler = (err, req, res, next) => {
  // 이미 응답이 전송된 경우
  if (res.headersSent) {
    return next(err);
  }

  console.error('Error:', {
    message: err.message,
    code: err.code,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Default error
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // MySQL 오류 처리
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry found';
    error.statusCode = 400;
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.message = 'Referenced record not found';
    error.statusCode = 400;
  }

  if (err.code === 'ER_WRONG_ARGUMENTS') {
    error.message = 'Database query error';
    error.statusCode = 500;
  }

  // 데이터베이스 연결 오류
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    error.message = 'Database connection error';
    error.statusCode = 503;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      code: err.code 
    })
  });
};

module.exports = errorHandler;

