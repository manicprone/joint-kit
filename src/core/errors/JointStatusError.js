import objectUtils from '../../utils/object-utils';

export default class JointStatusError extends Error {
  constructor(data) {
    super();
    this.name = 'JointStatusError';
    this.status = objectUtils.get(data, 'status', null);
    this.message = objectUtils.get(data, 'message', null);
  }
}
