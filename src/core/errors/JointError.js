import objectUtils from '../../utils/object-utils'

export default class JointError extends Error {
  constructor (data) {
    super()
    this.name = 'JointError'
    this.module = objectUtils.get(data, 'module', null)
    this.message = objectUtils.get(data, 'message', null)
  }
}
