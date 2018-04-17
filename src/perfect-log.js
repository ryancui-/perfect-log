import {wrapConsoleDebug, wrapConsoleError, wrapConsoleInfo, wrapEmptyFn} from './wrap-console';

import {LEVEL_DEBUG, LEVEL_ERROR, LEVEL_INFO, LogLevel} from './log-level';

let wrapDebug, wrapInfo, wrapError;

export default class PerfectLog {

  static initialize() {
    this.enableConsoleOutput();
    this.disableReport();
    this.reportOptions = {};
  }

  static enableReport(options = {}) {
    this.reportOptions = Object.assign({
      level: 'ERROR',
      data: null
    }, options);

    if (!this.reportOptions.url) {
      console.error('You must provide a url when enabling report service.');
      return;
    }

    let curLevel;
    try {
      curLevel = new LogLevel(this.reportOptions.level);
      this.reportEnabled = true;
    } catch (e) {
      console.error('Invalid level option. Only ERROR/INFO/DEBUG are allowed.');
    }

    // Construct sampling function
    const sampleFn = () => {
      if (!this.reportOptions.sample) {
        return true;
      } else if (typeof this.reportOptions.sample === 'number') {
        return Math.random() > this.reportOptions.sample;
      } else if (typeof this.reportOptions.sample === 'function') {
        return this.reportOptions.sample();
      }
    };

    this.debug = (...arg) => {
      wrapDebug(...arg);
      if (sampleFn() && LEVEL_DEBUG.greaterThan(curLevel)) {
        const reportObj = this._buildReportScheme(LEVEL_DEBUG, this._buildReportMsg(arg));
        this._report(reportObj);
      }
    };

    this.info = (...arg) => {
      wrapInfo(...arg);
      if (sampleFn() && LEVEL_INFO.greaterThan(curLevel)) {
        const reportObj = this._buildReportScheme(LEVEL_INFO, this._buildReportMsg(arg));
        this._report(reportObj);
      }
    };

    this.error = (...arg) => {
      wrapError(...arg);
      if (sampleFn() && LEVEL_ERROR.greaterThan(curLevel)) {
        let reportObj;

        if (arg.length === 1 && arg[0] instanceof Error) {
          reportObj = this._buildReportScheme(LEVEL_ERROR, '', arg[0]);
        } else {
          reportObj = this._buildReportScheme(LEVEL_ERROR, this._buildReportMsg(arg));
        }

        this._report(reportObj);
      }
    };
  }

  static disableReport() {
    this.reportEnabled = false;

    this.debug = wrapDebug;
    this.info = wrapInfo;
    this.error = wrapError;
  }

  static enableConsoleOutput() {
    this.consoleOutput = true;

    wrapDebug = wrapConsoleDebug;
    wrapInfo = wrapConsoleInfo;
    wrapError = wrapConsoleError;

    if (!this.reportEnabled) {
      this._resetWrapper();
    }
  }

  static disableConsoleOutput() {
    this.consoleOutput = false;

    wrapDebug = wrapInfo = wrapError = wrapEmptyFn;

    if (!this.reportEnabled) {
      this._resetWrapper();
    }
  }

  static patchData(data, value) {
    let merge = {};
    if (data && value && (typeof data === 'string' || data instanceof String)) {
      merge[data] = value;
    } else if (data && data instanceof Object) {
      merge = data;
    }
    this.reportOptions.data = Object.assign({}, this.reportOptions.data, merge);
  }

  static _buildReportScheme(logLevel, msg, error = null) {
    const scheme = {
      level: logLevel.levelText,
      msg, error,
      time: new Date().toISOString(),
      data: this.reportOptions.data,
      platform: {
        browser: navigator.userAgent
      }
    };

    return scheme;
  }

  static _report(reportObj) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.reportOptions.url, true);

    let requestBody = reportObj;
    if (this.reportOptions.beforeSend &&
      this.reportOptions.beforeSend instanceof Function) {
      requestBody = this.reportOptions.beforeSend(reportObj);
    }

    xhr.send(JSON.stringify(requestBody));
  }

  static _buildReportMsg(array) {
    return array.map(i => JSON.stringify(i)).join(', ');
  }

  static _resetWrapper() {
    this.debug = wrapDebug;
    this.info = wrapInfo;
    this.error = wrapError;
  }
}
