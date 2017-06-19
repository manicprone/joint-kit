// -----------------------------------------------------------------------------
// Joint Engine
// -----------------------------------------------------------------------------
import objectUtils from '../lib/utils/object-utils';
import * as EngineUtils from './engine-utils';

// TODO: Use "start" for the server, load/init for the engine !!!
// Either =>
//   start() => load / init
//   isRunning => isLoaded / isInitialized
// Or =>
//   just load everything in the constructor !!!

module.exports = class JointEngine {
  constructor(options = {}) {
    this.isRunning = false;

    // Load options...
    this.serviceKey = objectUtils.get(options, 'serviceKey', null);
    this.service = objectUtils.get(options, 'service', null);
    this.modelConfig = objectUtils.get(options, 'modelConfig', null);
    this.methodConfig = objectUtils.get(options, 'methodConfig', null);
    this.routeConfig = objectUtils.get(options, 'routeConfig', null);
  }

  start(options) {
    // Parse options...
    const logStart = objectUtils.get(options, 'logStart', true);
    const logRegister = objectUtils.get(options, 'logRegister', true);

    if (!this.isRunning) {
      if (logStart) {
        console.log('====================================================');
        console.log('Joint Engine');
        console.log('version: 0.0.0'); // TODO: Load from config !!!
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
        this.model = EngineUtils.registerModels(this.service, this.modelConfig, logRegister);
      }

      // Build method registry...
      if (this.methodConfig) {
        this.method = EngineUtils.registerMethods(this.methodConfig, logRegister);
      }
    } // end-if (!this.isRunning)
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
