// -----------------------------------------------------------------------------
// Joint Engine
// -----------------------------------------------------------------------------
const objectUtils = require('../lib/utils/object-utils');
const engineUtils = require('./utils');

module.exports = class JointEngine {
  constructor(options = {}) {
    this.isRunning = false;

    // Load options...
    this.serviceKey = objectUtils.get(options, 'serviceKey', 'default');
    this.service = objectUtils.get(options, 'service', null);
    this.modelConfig = objectUtils.get(options, 'modelConfig', null);
    this.methodConfig = objectUtils.get(options, 'methodConfig', null);
  }

  start() {
    if (!this.isRunning) {
      if (this.service) {
        this.isRunning = true;

        // Build model registry...
        if (this.modelConfig) {
          this.modelRegistry = engineUtils.registerModels(this.service, this.modelConfig);
        }

        // Build method registry...
        if (this.methodConfig) {
          this.methodRegistry = engineUtils.registerMethods(this.methodConfig);
        }
      } else {
        console.info('[ENGINE] A service must be configured before the engine can be started.');
      } // end-if-else (this.service)
    } else {
      console.info('[ENGINE] The engine is already running.');
    } // end-if-else (!this.isRunning)
  }
};
