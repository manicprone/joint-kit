// ------------------------------
// Methods for scenario: app-mgmt
// (method-config)
// ------------------------------
import appRegistry from './resources/app-registry';
import appContent from './resources/app-content';
import appSettings from './resources/app-settings';

module.exports = {
  resources: [
    appRegistry,
    appContent,
    appSettings,
  ],
};
