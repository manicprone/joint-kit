// -----------------------------------------------------------------------------
// Joint Roller
// -----------------------------------------------------------------------------
import objectUtils from './utils/object-utils';

const defaultService = 'bookshelf';
const log = false;

module.exports = class JointRoller {
  constructor(options = {}) {
    // Load options...
    this.serviceKey = objectUtils.get(options, 'serviceKey', defaultService);

    // Load actions...
    let actions = null;
    try {
      actions = require(`./actions/${this.serviceKey}`); // eslint-disable-line global-require, import/no-dynamic-require
    } catch (error) {
      if (log) console.error(`[JOINT-ROLLER] ERROR => Could not find actions for service: ${this.serviceKey}`);
    }
    if (actions) Object.assign(this, actions);
  }
};
