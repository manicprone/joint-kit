// -----------------------------------------------------------------------------
// Joint Engine
// -----------------------------------------------------------------------------
const objectUtils = require('../lib/utils/object-utils');
const engineUtils = require('./engine-utils');

module.exports = class JointEngine {
  constructor(options = {}) {
    this.isRunning = false;

    // Load options...
    this.serviceKey = objectUtils.get(options, 'serviceKey', 'default');
    this.service = objectUtils.get(options, 'service', null);
    this.modelConfig = objectUtils.get(options, 'modelConfig', null);
    this.methodConfig = objectUtils.get(options, 'methodConfig', null);
    this.routeConfig = objectUtils.get(options, 'routeConfig', null);
  }

  start() {
    if (!this.isRunning) {
      if (this.service) {
        this.isRunning = true;

        // Build model registry...
        if (this.modelConfig) {
          this.model = engineUtils.registerModels(this.service, this.modelConfig);
        }

        // Build method registry...
        if (this.methodConfig) {
          this.method = engineUtils.registerMethods(this.methodConfig);
        }
      } else {
        console.info('[ENGINE] A service must be configured before the engine can be started.');
      } // end-if-else (this.service)
    } else {
      console.info('[ENGINE] The engine is already running.');
    } // end-if-else (!this.isRunning)
  } // END - start

  info() {
    const info = {
      isRunning: this.isRunning,
      service: this.serviceKey,
      configs: {
        model: this.modelConfig,
        method: this.methodConfig,
        route: this.routeConfig,
      },
      methods: this.method,
    };

    return info;
  } // END - info
};
