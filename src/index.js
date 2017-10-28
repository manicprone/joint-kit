import objectUtils from './utils/object-utils';
import JointError from './errors/JointError';
import defaultSettings from './core/settings';
import * as CoreUtils from './core/core-utils';
import * as JointGenerate from './core/generate';
import * as AuthUtils from './authorization/auth-utils';
import * as ActionsBookshelf from './actions/bookshelf';

export default class Joint {
  constructor(options = {}) {
    // Load options...
    this.service = objectUtils.get(options, 'service', null);
    this.serviceKey = CoreUtils.determineServiceKeyFromService(this.service);
    this.server = objectUtils.get(options, 'server', null);
    this.serverKey = CoreUtils.determineServerKeyFromServer(this.server);
    this.output = objectUtils.get(options, 'output', 'native');
    this.settings = (options.settings) ? Object.assign(defaultSettings, options.settings) : defaultSettings;

    // Exit if a service is not loaded or is not recognized/supported...
    if (!this.service) {
      const message = 'A service must be configured to use Joint.';
      throw new JointError({ message });
    }
    if (!this.serviceKey) {
      const message = 'The provided service is either not recognized or not supported by Joint.';
      throw new JointError({ message });
    }

    // --------------------------------
    // Load buildAuthBundle function...
    // --------------------------------
    this.buildAuthBundle = function (req, rules) { return AuthUtils.buildAuthBundle(this.settings, req, rules); };

    // TODO: Load existing models from service to this.model !!!

    // -------------------------------------
    // Load actions for specified service...
    // -------------------------------------
    // Actions are loaded as => this.<action>
    let actions = null;
    switch (this.serviceKey) {
      case 'bookshelf': {
        actions = ActionsBookshelf;
      }
    }
    if (!actions) {
      const message = `Could not find actions for service: ${this.serviceKey}`;
      throw new JointError({ message });
    }
    if (actions) {
      Object.keys(actions).forEach((actionName) => {
        this[actionName] = function (spec, input, ouput = `${this.output}`) { return actions[actionName](this.service, spec, input, ouput); };
      });
    }
  } // END - constructor

  setOutput(format) {
    this.output = format;
  }

  setServer(server) {
    this.server = server;
    this.serverKey = CoreUtils.determineServerKeyFromServer(this.server);
  }

  updateSettings(settings) {
    Object.assign(this.settings, settings);
  }

  generate(options) {
    // Parse options...
    this.modelConfig = objectUtils.get(options, 'modelConfig', null);
    this.methodConfig = objectUtils.get(options, 'methodConfig', null);
    this.routeConfig = objectUtils.get(options, 'routeConfig', null);
    const log = objectUtils.get(options, 'log', true);

    if (!this.service) {
      const message = 'A service must be configured to use: Joint.generate';
      throw new JointError({ message });
    }

    // -----------------------
    // Build model registry...
    // -----------------------
    // Models are loaded as => this.model.<modelName>
    if (this.modelConfig) JointGenerate.registerModels(this, log);

    // -----------------------
    // Build method registry...
    // -----------------------
    // Methods are loaded as => this.method.<modelName>.<methodName>
    if (this.methodConfig) JointGenerate.registerMethods(this, log);

    // --------------------------
    // Build router middleware...
    // --------------------------
    // The router is loaded as => this.router
    if (this.routeConfig) JointGenerate.buildRouter(this, log);
  } // END - generate

  info() {
    const modelNames = (this.model) ? Object.keys(this.model) : null;
    const isApiEnabled = (this.router) ? true : false; // eslint-disable-line no-unneeded-ternary

    const info = {
      service: this.serviceKey,
      server: this.serverKey,
      output: this.output,
      settings: this.settings,
      api: isApiEnabled,
      models: modelNames,
      methods: this.method,
      configs: {
        model: this.modelConfig,
        method: this.methodConfig,
        route: this.routeConfig,
      },
    };

    return info;
  } // END - info
}
