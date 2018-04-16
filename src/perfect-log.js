const wrapLog = (method, level, color) =>
  console[method].bind(window.console, `%c[${level}]%c`, `color: ${color}`, 'color:black');

let wrapDebug, wrapInfo, wrapError;

export default class PerfectLog {
  /**
   * Initialize SmartLog with default behaviour
   */
  static initialize() {
    this.enableConsoleOutput();
    this.disableReport();
    this.reportOptions = {};
  }

  /**
   * Enable report
   *
   * @param options
   */
  static enableReport(options = {}) {
    this.reportOptions = Object.assign({
      level: 'ERROR',
      data: null
    }, options);

    if (!this.reportOptions.url) {
      console.error('You must provide a url when enabling report service.');
      return;
    }

    switch (this.reportOptions.level) {
      case 'ERROR':
        this.reportOptions.levelNumber = 1;
        break;
      case 'INFO':
        this.reportOptions.levelNumber = 2;
        break;
      case 'DEBUG':
        this.reportOptions.levelNumber = 3;
        break;
      default:
        console.error('Invalid level option. Only ERROR/INFO/DEBUG are allowed.');
        return;
    }

    this.reportEnabled = true;

    this.debug = (...arg) => {
      wrapDebug(...arg);
      if (this.reportOptions.levelNumber >= 3) {
        const reportObj = this._buildReportScheme('DEBUG', this._buildReportMsg(arg));
        this._report(reportObj);
      }
    };

    this.info = (...arg) => {
      wrapInfo(...arg);
      if (this.reportOptions.levelNumber >= 2) {
        const reportObj = this._buildReportScheme('INFO', this._buildReportMsg(arg));
        this._report(reportObj);
      }
    };

    this.error = (...arg) => {
      wrapError(...arg);
      if (this.reportOptions.levelNumber >= 1) {
        let reportObj;

        if (arg.length === 1 && arg[0] instanceof Error) {
          reportObj = this._buildReportScheme('ERROR', '', arg[0]);
        } else {
          reportObj = this._buildReportScheme('ERROR', this._buildReportMsg(arg));
        }

        this._report(reportObj);
      }
    };
  }

  /**
   * Disable report
   */
  static disableReport() {
    this.reportEnabled = false;

    this.debug = wrapDebug;
    this.info = wrapInfo;
    this.error = wrapError;
  }

  /**
   * Enable console output
   */
  static enableConsoleOutput() {
    this.consoleOutput = true;

    wrapDebug = wrapLog('log', 'DEBUG', 'green');
    wrapInfo = wrapLog('info', 'INFO', 'blue');
    wrapError = wrapLog('error', 'ERROR', 'red');

    if (!this.reportEnabled) {
      this.debug = wrapDebug;
      this.info = wrapInfo;
      this.error = wrapError;
    }
  }

  /**
   * Disable console output
   */
  static disableConsoleOutput() {
    this.consoleOutput = false;

    wrapDebug = () => {
    };
    wrapInfo = () => {
    };
    wrapError = () => {
    };

    if (!this.reportEnabled) {
      this.debug = wrapDebug;
      this.info = wrapInfo;
      this.error = wrapError;
    }
  }

  /**
   * Patch user defined data
   */
  static patchData(data, value) {
    let merge = {};
    if (data && value && (typeof data === 'string' || data instanceof String)) {
      merge[data] = value;
    } else if (data && data instanceof Object) {
      merge = data;
    }
    this.reportOptions.data = Object.assign({}, this.reportOptions.data, merge);
  }

  static _buildReportScheme(level, msg, error = null) {
    const scheme = {
      level, msg, error,
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
    xhr.onerror = () => {
    };
    xhr.open('POST', this.reportOptions.url, true);

    let requestBody = reportObj;
    if (this.reportOptions.beforeSend &&
      this.reportOptions.beforeSend instanceof Function) {
      requestBody = this.reportOptions.beforeSend.call(null, reportObj);
    }

    xhr.send(JSON.stringify(requestBody));
  }

  static _buildReportMsg(array) {
    return array.map(i => JSON.stringify(i)).join(', ');
  }
}
