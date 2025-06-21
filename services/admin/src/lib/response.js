const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

const success = (data, statusCode = 200) => ({
  statusCode,
  headers,
  body: JSON.stringify({
    success: true,
    data,
  }),
});

const error = (message, statusCode = 400) => ({
  statusCode,
  headers,
  body: JSON.stringify({
    success: false,
    error: message,
  }),
});

module.exports = {
  success,
  error,
}; 