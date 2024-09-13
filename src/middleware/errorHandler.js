const errorHandler = (err, req, res, next) => {
//   console.error('错误:', err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    details: err.details || {},
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;