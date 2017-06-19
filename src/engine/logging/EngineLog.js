import objectUtils from '../../lib/utils/object-utils';

const namespace = 'ENGINE';

module.exports = class EngineLog {
  constructor(data = {}) {
    this.moduleKey = objectUtils.get(data, 'key', null);
    this.customMessage = objectUtils.get(data, 'message', '');
    this.objectForInspect = objectUtils.get(data, 'object', null);
  }

  set key(key) {
    this.moduleKey = key;
  }

  set message(message) {
    this.customMessage = message;
  }

  set object(object) {
    this.objectForInspect = object;
  }

  log() {
    this.write('log');
  }

  error() {
    this.write('error');
  }

  write(/* logLevel = 'log' */) {
    let logContents = `[${namespace}]`;
    if (this.moduleKey) logContents += ` [${this.moduleKey}]`;
    logContents += ` ${this.customMessage}`;

    if (this.objectForInspect !== null) {
      console.log(logContents, this.objectForInspect);
    } else {
      console.log(logContents);
    }
  }
};
