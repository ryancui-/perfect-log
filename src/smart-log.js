const wrapLog = (method, level, color) =>
  console[method].bind(window.console, `%c[${level}]%c`, `color: ${color}`, 'color:black');

let wrapDebug, wrapInfo, wrapError;

export default class SmartLog {

  /**
   * Initialize SmartLog with default behaviour
   *
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
        const reportObj = this.buildReportScheme('ERROR', JSON.stringify(arg));
        this.report(reportObj);
      }
    };
  }

  /**
   * Disable report
   *
   */
  static disableReport() {
    this.reportEnabled = false;

    this.debug = wrapDebug;
    this.info = wrapInfo;
    this.error = wrapError;
  }

  /**
   * Enable console output
   *
   */
  static enableConsoleOutput() {
    this.consoleOutput = true;

    wrapDebug = wrapLog('log', 'DEBUG', 'green');
    wrapInfo = wrapLog('info', 'INFO', 'blue');
    wrapError = wrapLog('error', 'ERROR', 'red');
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
   * Build the scheme object which would be sent to backend
   *
   * @param level Log level
   * @param msg Message
   * @param uri Error file
   * @param row Line number of the error file
   * @param err Error object
   *
   * @return {{level: *, msg: *, time: Date, data: null|*, platform: {browser: string}}}
   */
  static buildReportScheme(level, msg, uri = '', row = 0, err = null) {
    const scheme = {
      level, msg,
      time: new Date().toISOString(),
      data: this.reportOptions.data,
      platform: {
        browser: navigator.userAgent
      }
    };

    if (err) {
      scheme.uri = uri;
      scheme.row = row;
      scheme.stack = err.stack || err.stacktree;
    }

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
    xhr.send(JSON.stringify(reportObj));
  }
}
