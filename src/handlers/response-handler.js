import objectUtils from '../utils/object-utils';
// import serializer from '../serializers/json';

function handleAuthResponse(type, data, res, status = 200) {
  const payload = data;
  res.status(status).json(payload);
}

function handleDataResponse(type, data, res, status = 200) {
  const payload = data;
  // const payload = serializer.toJSON(type, data);
  res.status(status).json(payload);
}

function handleErrorResponse(error, res) {
  const errorClass = error.name;

  // Log errors that do not come from Bookshelf or API...
  if (errorClass !== 'ErrorCtor' && errorClass !== 'JointError') console.error(error);

  if (errorClass === 'JointError') {
    const statusCode = objectUtils.get(error, 'status', 500);
    res.status(statusCode).json(error);
  } else {
    res.status(500).json(error);
  }
}

module.exports = {
  handleAuthResponse,
  handleDataResponse,
  handleErrorResponse,
};
