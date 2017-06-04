import objectUtils from '../../utils/object-utils';

export default class JointError extends Error {
  constructor(data) {
    super();
    this.name = 'JointError';
    this.status = objectUtils.get(data, 'status', null);
    this.message = objectUtils.get(data, 'message', null);
  }
}
