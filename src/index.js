// -----------------------------------------------------------------------------
// Joint Lib
// -----------------------------------------------------------------------------
import objectUtils from './utils/object-utils';
import JointError from './errors/JointError';
import * as JointGenerate from './core/generate';
import * as ActionsBookshelf from './actions/bookshelf';

const defaultService = 'bookshelf';

export default class Joint {
  constructor(options = {}) {
    // Load options...
    this.serviceKey = objectUtils.get(options, 'serviceKey', defaultService);
    this.service = objectUtils.get(options, 'service', null);
    this.payloadFormat = objectUtils.get(options, 'payloadFormat', 'native');

    // Exit if a service is not loaded...
    if (!this.service) {
      const message = '[JOINT] ERROR - A service must be configured to use Joint.';
      throw new JointError({ message });
    }

    // TODO: Load existing models from service to this.model !!!

    // Load actions...
    let actions = null;
    switch (this.serviceKey) {
      case 'bookshelf': {
        actions = ActionsBookshelf;
      }
    }
    if (!actions) {
      const message = `[JOINT] ERROR - Could not find actions for service: ${this.serviceKey}`;
      throw new JointError({ message });
    }
    // try {
    //   actions = require(`./actions/${this.serviceKey}`); // eslint-disable-line global-require, import/no-dynamic-require
    // } catch (err) {
    //   const message = `[JOINT] ERROR - Could not find actions for service: ${this.serviceKey}`;
    //   throw new JointError({ message });
    // }
    if (actions) {
      Object.keys(actions).forEach((actionName) => {
        this[actionName] = function (spec, input, ouput = `${this.payloadFormat}`) { return actions[actionName](this.service, spec, input, ouput); }; // eslint-disable-line func-names
      });
    }
  } // END - constructor

  setPayloadFormat(format) {
    this.payloadFormat = format;
  }

  generate(options) {
    // Parse options...
    const log = objectUtils.get(options, 'log', true);
    this.modelConfig = objectUtils.get(options, 'modelConfig', null);
    this.methodConfig = objectUtils.get(options, 'methodConfig', null);

    if (!this.service) {
      const message = '[JOINT] ERROR - A service must be configured to use generate.';
      throw new JointError({ message });
    }

    // Build model registry...
    if (this.modelConfig) JointGenerate.registerModels(this, log);

    // Build method registry...
    if (this.methodConfig) JointGenerate.registerMethods(this, log);
  } // END - generate

  info() {
    const modelNames = (this.model) ? Object.keys(this.model) : null;

    const info = {
      service: this.serviceKey,
      configs: {
        model: this.modelConfig,
        method: this.methodConfig,
      },
      models: modelNames,
      methods: this.method,
      payloadFormat: this.payloadFormat,
    };

    return info;
  } // END - info
}
