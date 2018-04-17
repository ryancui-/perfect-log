/*!
 * perfect-log v0.0.1-beta.5
 *
 * Copyright (c) 2018-2018 ryancui-
 * Released under the MIT license
 *
 * Date: 2018-04-17T02:24:21.226Z
 */

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
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

var PerfectLog = function () {
  function PerfectLog() {
    classCallCheck(this, PerfectLog);
  }

  createClass(PerfectLog, null, [{
    key: 'initialize',

    /**
     * Initialize SmartLog with default behaviour
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
          var reportObj = _this._buildReportScheme('DEBUG', _this._buildReportMsg(arg));
          _this._report(reportObj);
        }
      };

      this.info = function () {
        for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          arg[_key2] = arguments[_key2];
        }

        wrapInfo.apply(undefined, arg);
        if (_this.reportOptions.levelNumber >= 2) {
          var reportObj = _this._buildReportScheme('INFO', _this._buildReportMsg(arg));
          _this._report(reportObj);
        }
      };

      this.error = function () {
        for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          arg[_key3] = arguments[_key3];
        }

        wrapError.apply(undefined, arg);
        if (_this.reportOptions.levelNumber >= 1) {
          var reportObj = void 0;

          if (arg.length === 1 && arg[0] instanceof Error) {
            reportObj = _this._buildReportScheme('ERROR', '', arg[0]);
          } else {
            reportObj = _this._buildReportScheme('ERROR', _this._buildReportMsg(arg));
          }

          _this._report(reportObj);
        }
      };
    }

    /**
     * Disable report
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
     */

  }, {
    key: 'enableConsoleOutput',
    value: function enableConsoleOutput() {
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

  }, {
    key: 'disableConsoleOutput',
    value: function disableConsoleOutput() {
      this.consoleOutput = false;

      wrapDebug = function wrapDebug() {};
      wrapInfo = function wrapInfo() {};
      wrapError = function wrapError() {};

      if (!this.reportEnabled) {
        this.debug = wrapDebug;
        this.info = wrapInfo;
        this.error = wrapError;
      }
    }

    /**
     * Patch user defined data
     */

  }, {
    key: 'patchData',
    value: function patchData(data, value) {
      var merge = {};
      if (data && value && (typeof data === 'string' || data instanceof String)) {
        merge[data] = value;
      } else if (data && data instanceof Object) {
        merge = data;
      }
      this.reportOptions.data = Object.assign({}, this.reportOptions.data, merge);
    }
  }, {
    key: '_buildReportScheme',
    value: function _buildReportScheme(level, msg) {
      var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var scheme = {
        level: level, msg: msg, error: error,
        time: new Date().toISOString(),
        data: this.reportOptions.data,
        platform: {
          browser: navigator.userAgent
        }
      };

      return scheme;
    }
  }, {
    key: '_report',
    value: function _report(reportObj) {
      var xhr = new XMLHttpRequest();
      xhr.onerror = function () {};
      xhr.open('POST', this.reportOptions.url, true);

      var requestBody = reportObj;
      if (this.reportOptions.beforeSend && this.reportOptions.beforeSend instanceof Function) {
        requestBody = this.reportOptions.beforeSend.call(null, reportObj);
      }

      xhr.send(JSON.stringify(requestBody));
    }
  }, {
    key: '_buildReportMsg',
    value: function _buildReportMsg(array) {
      return array.map(function (i) {
        return JSON.stringify(i);
      }).join(', ');
    }
  }]);
  return PerfectLog;
}();

PerfectLog.initialize();

export default PerfectLog;
