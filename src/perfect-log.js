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
        const reportObj = this.buildReportScheme('DEBUG', JSON.stringify(arg));
        this.report(reportObj);
      }
    };

    this.info = (...arg) => {
      wrapInfo(...arg);
      if (this.reportOptions.levelNumber >= 2) {
        const reportObj = this.buildReportScheme('INFO', JSON.stringify(arg));
        this.report(reportObj);
      }
    };

    this.error = (...arg) => {
      wrapError(...arg);
      if (this.reportOptions.levelNumber >= 1) {
        let reportObj;

        if (arg.length === 1 && arg[0] instanceof Error) {
          reportObj = this.buildReportScheme('ERROR', '', arg[0]);
        } else {
          reportObj = this.buildReportScheme('ERROR', JSON.stringify(arg));
        }

        this.report(reportObj);
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
   *
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
  static patchData(data) {
    if (data && data instanceof Object) {
      this.reportOptions.data = Object.assign({}, this.reportOptions.data, data);
    }
  }

  /**
   * Build the schema which would be sent to backend
   *
   * @param level Log level
   * @param msg Message
   * @param err Error object
   *
   * @return {{level: *, msg: *, time: Date, data: null|*, platform: {browser: string}}}
   */
  static buildReportScheme(level, msg, error = null) {
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

  /**
   * Send log info to backend service
   *
   * @param reportObj Log info scheme object
   */
  static report(reportObj) {
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
}
