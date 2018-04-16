# Perfect Log

[![Build Status](https://img.shields.io/travis/ryancui-/perfect-log/master.svg?style=flat-square)](https://travis-ci.org/ryancui-/perfect-log.svg?branch=master)
[![npm](https://img.shields.io/npm/v/perfect-log.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/perfect-log)
[![npm download times](https://img.shields.io/npm/dm/perfect-log.svg)](https://www.npmjs.com/package/perfect-log)

## 简介

PerfectLog 提供了一套 Log 工具，用于在源码中替代 `console.log`，使开发环境与生产环境对 `console.log` 进行行为配置。

另外，PerfectLog 提供了上传 Log 信息（包括业务日志与未处理的错误）的到后端服务，在后端可以做相应的日志分析或跟其他系统集成，如 ELK.

这是一个用于**浏览器端**的库。

## 安装

#### npm

```shell
$ npm i -S perfect-log
```

安装完后，在 JavaScript 执行的**最开始**处初始化：

```javascript
import PerfectLog from 'perfect-log';

// 初始化
PerfectLog.enableReport({
  url: 'url'
});
```

在业务代码中使用 `PerfectLog.debug` 替代 `console.log`

```javascript
import PerfectLog from 'perfect-log';

this.http.post('/url', {id: 1}).then(data => {
  PerfectLog.debug(data); 
});
```

#### Script

直接下载 `dist/perfect-log.js` 然后在页面**其他 JavaScript 前**引入，直接使用全局变量 `PerfectLog`

```html
<script src="perfect-log.js"></script>
<script src="other.js"></script>
```

## API

#### PerfectLog.debug(...arg)

`console.log` 的包装方法，用法与 `console.log` 相同。

```javascript
PerfectLog.debug(1, 2, 3);
PerfectLog.debug(document.body);
PerfectLog.debug({x: 1, y: 2});
```

#### PerfectLog.info(...arg)

`console.info` 的包装方法，用法与 `console.info` 相同。

#### PerfectLog.error(...arg)

`console.error` 的包装方法，用法与 `console.error` 相同。

#### PerfectLog.enableConsoleOutput()

包装方法会调用实际的 `console.*` 方法，向控制台打印 Log.

#### PerfectLog.disableConsoleOutput()

包装方法不会调用 `console.*` 方法，不打印 Log.

#### PerfectLog.enableReport(options: object)

启用日志上报服务，包装方法会通过 POST HTTP 请求上报日志到后端。

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

`options` 说明：

| 字段       | 说明                                                         | 默认值    |
| ---------- | ------------------------------------------------------------ | --------- |
| url        | 后端服务地址，**必须提供**。                                 |           |
| level      | 最低日志上报级别。目前由高到低可设 `'ERROR'`/`'INFO'`/`'DEBUG'`，设置后只有高于该级别的日志才会上报到后端。比如，设置为 `'INFO'` 级别后，只有 ERROR 与 INFO 级别日志会上报，DEBUG 级别不会上报。 | `'ERROR'` |
| data       | 自定义数据，随日志进行上报                                   |           |
| beforeSend | 上报前调用，返回新的 JSON 对象作为上报的请求体               |           |

#### PerfectLog.patchData(data: object)

手动添加自定义数据，`data` 会覆盖原来已经定义的属性。

## 日志信息对象

每个 Log 信息是这样一个 JSON 对象：

```javascript
{
  "level": "INFO",
  "msg": "Uncaught ReferenceError: ppp is not defined",
  "time": "2018-04-12T13:00:37.365Z",
  "data": {
    "pluginVersion": "1.1.2",
    "userId": 1
  },
  "error": Error,
  "platform": {
    "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
  }
}
```

- `level` - 日志级别，取值 `'ERROR'`, `'INFO'`, `'DEBUG'`
- `msg` - 日志信息
- `time` - UTC 时间字符串
- `data` - 自定义数据
- `error` - 在 ERROR 级别下，表示 JavaScript 错误对象 
- `platform` - 关于平台信息的对象，`browser` 字段是 `navigator.userAgent`

## 许可

MIT 许可。