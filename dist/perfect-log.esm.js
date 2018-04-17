/*!
 * perfect-log v0.0.1
 *
 * Copyright (c) 2018-2018 ryancui-
 * Released under the MIT license
 *
 * Date: 2018-04-17T06:39:05.171Z
 */

var wrapConsoleMethod = function wrapConsoleMethod(method, level, color) {
  return console[method].bind(window.console, '%c[' + level + ']%c', 'color: ' + color, 'color:black');
};

var wrapConsoleDebug = wrapConsoleMethod('log', 'DEBUG', 'green');
var wrapConsoleInfo = wrapConsoleMethod('info', 'INFO', 'blue');
var wrapConsoleError = wrapConsoleMethod('error', 'ERROR', 'red');
var wrapEmptyFn = function wrapEmptyFn() {};

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

var LEVEL_DEFINITION = {
  'DEBUG': {
    level: 1,
    color: 'green'
  },
  'INFO': {
    level: 2,
    color: 'blue'
  },
  'ERROR': {
    level: 3,
    color: 'red'
  }
};

var LogLevel = function () {
  function LogLevel(levelText, level, color) {
    classCallCheck(this, LogLevel);

    if (!LEVEL_DEFINITION[levelText]) {
      throw new Error();
    }

    this.levelText = levelText;
    this.level = level || LEVEL_DEFINITION[levelText].level;
    this.color = color || LEVEL_DEFINITION[levelText].color;
  }

  createClass(LogLevel, [{
    key: 'greaterThan',
    value: function greaterThan(logLevel) {
      return this.level >= logLevel.level;
    }
  }]);
  return LogLevel;
}();

var LEVEL_DEBUG = new LogLevel('DEBUG', LEVEL_DEFINITION.DEBUG.level, LEVEL_DEFINITION.DEBUG.color);
var LEVEL_INFO = new LogLevel('INFO', LEVEL_DEFINITION.INFO.level, LEVEL_DEFINITION.INFO.color);
var LEVEL_ERROR = new LogLevel('ERROR', LEVEL_DEFINITION.ERROR.level, LEVEL_DEFINITION.ERROR.color);

var wrapDebug = void 0,
    wrapInfo = void 0,
    wrapError = void 0;

var PerfectLog = function () {
  function PerfectLog() {
    classCallCheck(this, PerfectLog);
  }

  createClass(PerfectLog, null, [{
    key: 'initialize',
    value: function initialize() {
      this.enableConsoleOutput();
      this.disableReport();
      this.reportOptions = {};
    }
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

      var curLevel = void 0;
      try {
        curLevel = new LogLevel(this.reportOptions.level);
        this.reportEnabled = true;
      } catch (e) {
        console.error('Invalid level option. Only ERROR/INFO/DEBUG are allowed.');
      }

      // Construct sampling function
      var sampleFn = function sampleFn() {
        if (!_this.reportOptions.sample) {
          return true;
        } else if (typeof _this.reportOptions.sample === 'number') {
          return Math.random() > _this.reportOptions.sample;
        } else if (typeof _this.reportOptions.sample === 'function') {
          return _this.reportOptions.sample();
        }
      };

      this.debug = function () {
        for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        wrapDebug.apply(undefined, arg);
        if (sampleFn() && LEVEL_DEBUG.greaterThan(curLevel)) {
          var reportObj = _this._buildReportScheme(LEVEL_DEBUG, _this._buildReportMsg(arg));
          _this._report(reportObj);
        }
      };

      this.info = function () {
        for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          arg[_key2] = arguments[_key2];
        }

        wrapInfo.apply(undefined, arg);
        if (sampleFn() && LEVEL_INFO.greaterThan(curLevel)) {
          var reportObj = _this._buildReportScheme(LEVEL_INFO, _this._buildReportMsg(arg));
          _this._report(reportObj);
        }
      };

      this.error = function () {
        for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          arg[_key3] = arguments[_key3];
        }

        wrapError.apply(undefined, arg);
        if (sampleFn() && LEVEL_ERROR.greaterThan(curLevel)) {
          var reportObj = void 0;

          if (arg.length === 1 && arg[0] instanceof Error) {
            reportObj = _this._buildReportScheme(LEVEL_ERROR, '', arg[0]);
          } else {
            reportObj = _this._buildReportScheme(LEVEL_ERROR, _this._buildReportMsg(arg));
          }

          _this._report(reportObj);
        }
      };
    }
  }, {
    key: 'disableReport',
    value: function disableReport() {
      this.reportEnabled = false;

      this.debug = wrapDebug;
      this.info = wrapInfo;
      this.error = wrapError;
    }
  }, {
    key: 'enableConsoleOutput',
    value: function enableConsoleOutput() {
      this.consoleOutput = true;

      wrapDebug = wrapConsoleDebug;
      wrapInfo = wrapConsoleInfo;
      wrapError = wrapConsoleError;

      if (!this.reportEnabled) {
        this._resetWrapper();
      }
    }
  }, {
    key: 'disableConsoleOutput',
    value: function disableConsoleOutput() {
      this.consoleOutput = false;

      wrapDebug = wrapInfo = wrapError = wrapEmptyFn;

      if (!this.reportEnabled) {
        this._resetWrapper();
      }
    }
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
    value: function _buildReportScheme(logLevel, msg) {
      var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var scheme = {
        level: logLevel.levelText,
        msg: msg, error: error,
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
      xhr.open('POST', this.reportOptions.url, true);

      var requestBody = reportObj;
      if (this.reportOptions.beforeSend && this.reportOptions.beforeSend instanceof Function) {
        requestBody = this.reportOptions.beforeSend(reportObj);
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
  }, {
    key: '_resetWrapper',
    value: function _resetWrapper() {
      this.debug = wrapDebug;
      this.info = wrapInfo;
      this.error = wrapError;
    }
  }]);
  return PerfectLog;
}();

PerfectLog.initialize();

export default PerfectLog;
