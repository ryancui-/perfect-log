# Smart Log

##### English | <a href="#chinese">中文</a><a id="english"></a>

## Overview

Provide a set of log tools and help to get rid of using `console.log` in the source code. Control the output between develop and production environment.

Also, it allows you to upload your log(including bussiness or unhandled error) to your own backend service, which you can analyze them or just push to some log manage system, like ELK.

This package is designed for **browser** end.

## Installation

#### npm

Smart Log can be integrated into many frameworks like Vue, Angular and so on because it just like a global object.

```bash
$ npm i -S @ryancui-/smart-log
```

After installation, import it **at the most beginning** and bind it to `window`.

```javascript
import SmartLog from '@ryancui-/smart-log';

// Do some configurations
SmartLog.enableReport()

// Make it global
window.SmartLog = SmartLog;
```

Then, you can use `SmartLog` anywhere in your code.

```javascript
this.http.post('/url', {id: 1}).then(data => {
   SmartLog.debug(data); 
});
```

#### Script

Directly download `dist/smart-log.js` and include it in your page **before any other scripts**. Everything works.

```html
<script src="smart-log.js"></script>
<script src="other.js"></script>
```

## Usage

#### SmartLog.debug(...arg)

Wrapper for `console.log`, use it like `console.log`.

```javascript
SmartLog.debug(1, 2, 3);
SmartLog.debug(document.body);
SmartLog.debug({x: 1, y: 2});
```

#### SmartLog.info(...arg)

Wrapper for `console.info`, use it like `console.info`.

#### SmartLog.error(...arg)

Wrapper for `console.error`, use it like `console.error`.

#### SmartLog.enableConsoleOut()

Allow log info be printed in devtool console.

#### SmartLog.disableConsoleOut()

Nothing would be printed in devtools console.

#### SmartLog.enableReport(options: object)

Enable the report module. According the options, log info would be sent to a backend service using `POST`.

```javascript
SmartLog.enableReport({
  url: 'http://some.host/received',
  level: 'INFO',
  data: {
    userId: 1
  }
});
```

Details in `options`

| Field | Description                                                  | Default   |
| ----- | ------------------------------------------------------------ | --------- |
| url   | Backend service url, which can handle `POST` HTTP request, is necessary. | `null`    |
| level | The least level should it report. Currently only `'DEBUG'`/`'INFO'`/`'ERROR'` is allowed. For example, if set to `'INFO'`, only INFO and ERROR level would be sent to the backend. | `'ERROR'` |
| data  | Any specified data you want to send to the backend along with the log. | `null`    |

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
  "row": 33,
  "stack": "ReferenceError: ppp is not defined↵    at HTMLButtonElement.document ...",
  "uri": "http://localhost:63343/smart-log/examples/log-in-page.html?_ijt=9osog379isnpgj3tma19scjusk",
  "platform": {
    "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
  }
}
```

- `level` - The log level
- `msg` - Message
- `time` - UTC Time
- `data` - Your own defined data
- `row` - Exist when log level is `ERROR`, indicates the error line number
- `stack` - Exist when log level is `ERROR`, the string of `err.stack`
- `uri` - Exist when log level is `ERROR`, the error file position
- `platform` - An object about platform: `browser` is `navigator.userAgent`

## Lisence

MIT Lisence.

##### 中文 | <a href="#english">English</a><a id="chinese"></a>

亟待完善。