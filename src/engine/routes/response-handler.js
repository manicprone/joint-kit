import objectUtils from '../../lib/utils/object-utils';
// import serializer from '../serializers/json';

function handleDataResponse(type, data, res, status = 200) {
  const payload = data;
  // const payload = serializer.toJSON(type, data);
  res.status(status).json(payload);
}

function handleErrorResponse(error, res) {
  const errorClass = error.name;

  if (errorClass === 'JointError') {
    const statusCode = objectUtils.get(error, 'status', 500);
    res.status(statusCode).json(error);
  } else {
    res.status(500).json(error);
  }
}

module.exports = {
  handleDataResponse,
  handleErrorResponse,
};
