const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ message });
};

module.exports = errorHandler;
