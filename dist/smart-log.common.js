/*!
 * Smart log v0.0.2-beta
 *
 * Copyright (c) 2018-2018 ryancui-
 * Released under the MIT license
 *
 * Date: 2018-04-13T07:55:13.573Z
 */

'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var wrapLog = function wrapLog(method, level, color) {
  return console[method].bind(window.console, '%c[' + level + ']%c', 'color: ' + color, 'color:black');
};

var wrapDebug = void 0,
  wrapInfo = void 0,
  wrapError = void 0;

var SmartLog = function () {
  function SmartLog() {
    classCallCheck(this, SmartLog);
  }

  createClass(SmartLog, null, [{
    key: 'initialize',


    /**
     * Initialize SmartLog with default behaviour
     *
     */
    value: function initialize() {
      this.enableConsoleOutput();
      this.disableReport();
      this.reportOptions = {};
    }

    /**
     * Enable report
     *
     * @param options
     */

  }, {
    key: 'enableReport',
    value: function enableReport() {
      var _this = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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

      this.debug = function () {
        for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        wrapDebug.apply(undefined, arg);
        if (_this.reportOptions.levelNumber >= 3) {
          var reportObj = _this.buildReportScheme('DEBUG', JSON.stringify(arg));
          _this.report(reportObj);
        }
      };

      this.info = function () {
        for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          arg[_key2] = arguments[_key2];
        }

        wrapInfo.apply(undefined, arg);
        if (_this.reportOptions.levelNumber >= 2) {
          var reportObj = _this.buildReportScheme('INFO', JSON.stringify(arg));
          _this.report(reportObj);
        }
      };

      this.error = function () {
        for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          arg[_key3] = arguments[_key3];
        }

        wrapError.apply(undefined, arg);
        if (_this.reportOptions.levelNumber >= 1) {
          var reportObj = void 0;

          if (arg.length === 1 && arg instanceof Error) {
            reportObj = _this.buildReportScheme('ERROR', null, null, null, arg[0]);
          } else {
            reportObj = _this.buildReportScheme('ERROR', JSON.stringify(arg));
          }

          _this.report(reportObj);
        }
      };
    }

    /**
     * Disable report
     *
     */

  }, {
    key: 'disableReport',
    value: function disableReport() {
      this.reportEnabled = false;

      this.debug = wrapDebug;
      this.info = wrapInfo;
      this.error = wrapError;
    }

    /**
     * Enable console output
     *
     */

  }, {
    key: 'enableConsoleOutput',
    value: function enableConsoleOutput() {
      this.consoleOutput = true;

      wrapDebug = wrapLog('log', 'DEBUG', 'green');
      wrapInfo = wrapLog('info', 'INFO', 'blue');
      wrapError = wrapLog('error', 'ERROR', 'red');
    }

    /**
     * Disable console output
     *
     */

  }, {
    key: 'disableConsoleOutput',
    value: function disableConsoleOutput() {
      this.consoleOutput = false;

      wrapDebug = function wrapDebug() {
      };
      wrapInfo = function wrapInfo() {
      };
      wrapError = function wrapError() {
      };

      if (!this.reportEnabled) {
        this.debug = wrapDebug;
        this.info = wrapInfo;
        this.error = wrapError;
      }
    }

    /**
     * Patch user defined data
     *
     */

  }, {
    key: 'patchData',
    value: function patchData(data) {
      if (data && data instanceof Object) {
        this.reportOptions.data = Object.assign({}, this.reportOptions.data, data);
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

  }, {
    key: 'buildReportScheme',
    value: function buildReportScheme(level, msg) {
      var uri = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      var row = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var err = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

      var scheme = {
        level: level, msg: msg,
        time: new Date().toISOString(),
        data: this.reportOptions.data,
        platform: {
          browser: navigator.userAgent
        }
      };

      if (err) {
        var originStack = err.stack || err.stacktree || '';
        scheme.stack = originStack;

        if (msg === null) {
          scheme.msg = error.stack.split('\n')[0];
        }

        if (uri === null) {
          var match = error.stack.match(/\((.*):\d+:\d+\)/);
          scheme.uri = match[1];
        } else {
          scheme.uri = uri;
        }

        if (row === null) {
          var _match = error.stack.match(/(\d+):\d+\)/);
          scheme.row = _match[1];
        } else {
          scheme.row = row;
        }
      }

      return scheme;
    }

    /**
     * Send log info to backend service
     *
     * @param reportObj Log info scheme object
     */

  }, {
    key: 'report',
    value: function report(reportObj) {
      var xhr = new XMLHttpRequest();
      xhr.onerror = function () {
      };
      xhr.open('POST', this.reportOptions.url, true);

      var requestBody = reportObj;
      if (this.reportOptions.beforeSend && this.reportOptions.beforeSend instanceof Function) {
        requestBody = this.reportOptions.beforeSend.call(null, reportObj);
      }

      xhr.send(JSON.stringify(requestBody));
    }
  }]);
  return SmartLog;
}();

// Wrap the global error handlers
window.onerror = function (msg, uri, row, col, err) {
  if (SmartLog.reportEnabled) {
    var reportObj = SmartLog.buildReportScheme('ERROR', msg, uri, row, err);
    SmartLog.report(reportObj);
  }

  return !SmartLog.consoleOutput;
};

SmartLog.initialize();

module.exports = SmartLog;
