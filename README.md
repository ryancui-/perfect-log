# Perfect Log

[![Build Status](https://img.shields.io/travis/ryancui-/perfect-log/master.svg?style=flat-square)](https://travis-ci.org/ryancui-/perfect-log.svg?branch=master)
[![npm](https://img.shields.io/npm/v/perfect-log.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/perfect-log)
[![npm download times](https://img.shields.io/npm/dm/perfect-log.svg)](https://www.npmjs.com/package/perfect-log)

[中文](README-zh.md)

## Overview

Provide a set of log tools and help to get rid of using `console.log` in the source code. Control the output between develop and production environment.

Also, it allows you to upload your log(including bussiness or unhandled error) to your own backend service, which you can analyze them or just push to some log manage system, like ELK.

This package is designed for **browser** end.

## Installation

#### npm

```bash
$ npm i -S perfect-log
```

After installation, import it **at the most beginning**.

```javascript
import PerfectLog from 'perfect-log';

// Do some configurations
PerfectLog.enableReport({
  url: 'url'
});
```

Then, you can use `PerfectLog` anywhere in your code.

```javascript
import PerfectLog from 'perfect-log';

this.http.post('/url', {id: 1}).then(data => {
  PerfectLog.debug(data); 
});
```

#### Script

Directly download `dist/perfect-log.js` and include it in your page **before any other scripts**. Everything works.

```html
<script src="perfect-log.js"></script>
<script src="other.js"></script>
```

## API

#### PerfectLog.debug(...arg)

Wrapper for `console.log`, use it like `console.log`.

```javascript
PerfectLog.debug(1, 2, 3);
PerfectLog.debug(document.body);
PerfectLog.debug({x: 1, y: 2});
```

#### PerfectLog.info(...arg)

Wrapper for `console.info`, use it like `console.info`.

#### PerfectLog.error(...arg)

Wrapper for `console.error`, use it like `console.error`.

#### PerfectLog.enableConsoleOutput()

Allow log info be printed in devtool console.

#### PerfectLog.disableConsoleOutput()

Nothing would be printed in devtools console.

#### PerfectLog.enableReport(options: object)

Enable the report module. According the options, log info would be sent to a backend service using `POST`.

```javascript
PerfectLog.enableReport({
  url: 'http://some.host/received',
  level: 'INFO',
  data: {
    userId: 1
  },
  beforeSend: (log) => {
    log.version = log.data.version;
   	return log;     
  }
});
```

Details in `options`

| Field | Description                                                  | Default   |
| ----- | ------------------------------------------------------------ | --------- |
| url   | Backend service url, which can handle `POST` HTTP request, is **necessary**. |     |
| level | The least level should it report. Currently only `'DEBUG'`/`'INFO'`/`'ERROR'` is allowed. For example, if set to `'INFO'`, only INFO and ERROR level would be sent to the backend. | `'ERROR'` |
| data  | Any specified data you want to send to the backend along with the log. |     |
| beforeSend | Provide a function to transform log info schema into anything you want before sneding to backend. | |
| sample | Expect a number between 0 and 1 or function. `Math.random` will be called and compare to sample number(greater than) to determine whether to report when you give a number. Or just call the sample function that return a boolean representing report or not. | |

#### PerfectLog.patchData(data: object)

Add user defined data anywhere before report the log.

#### PerfectLog.patchData(key: string, value: object)

Add user defined data, another function signature.

## Log Info Schema

The data sent to backend is a JSON format defined below:

```javascript
{
  "level": "INFO",
  "msg": "Uncaught ReferenceError: ppp is not defined",
  "time": "2018-04-12T13:00:37.365Z",
  "data": {
    "pluginVersion": "1.1.2",
    "userId": 1
  },
  "error": Error
  "platform": {
    "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
  }
}
```

- `level` - The log level
- `msg` - Message
- `time` - UTC Time
- `data` - Your own defined data
- `error` - Exist on level ERROR, representing the JavaScript Error object
- `platform` - An object about platform: `browser` is `navigator.userAgent`

## Lisence

MIT Lisence.

