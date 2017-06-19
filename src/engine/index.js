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

  start(options) {
    const logStart = objectUtils.get(options, 'logStart', true);

    if (!this.isRunning) {
      if (logStart) {
        console.log('====================================================');
        console.log('Joint Engine');
        console.log('version: 0.0.0'); // TODO: Load from config !!!
        console.log('----------------------------------------------------');
      }

      // Abort if a service is not loaded...
      if (!this.service) {
        if (logStart) console.log('ERROR: A service must be configured to start the engine.');
      }

      this.isRunning = true;

      if (logStart) {
        console.log(`service: ${this.serviceKey}`);
        console.log('====================================================\n');
      }

      // Build model registry...
      if (this.modelConfig) {
        this.model = engineUtils.registerModels(this.service, this.modelConfig);
      }

      // Build method registry...
      if (this.methodConfig) {
        this.method = engineUtils.registerMethods(this.methodConfig);
      }

      // if (this.service) {
      //   this.isRunning = true;
      //
      //   if (logStart) {
      //     console.log(`service: ${this.serviceKey}`);
      //     console.log('======================================================');
      //   }
      //
      //   // Build model registry...
      //   if (this.modelConfig) {
      //     this.model = engineUtils.registerModels(this.service, this.modelConfig);
      //   }
      //
      //   // Build method registry...
      //   if (this.methodConfig) {
      //     this.method = engineUtils.registerMethods(this.methodConfig);
      //   }
      // } else if (logStart) {
      //   console.info('ERROR: A service must be configured to use the engine.');
      // } // end-if-else (this.service)
    }
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
