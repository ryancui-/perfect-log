# Changelog

### 0.0.2-beta.2 (2018-04-13)

- Fix issue at previous version

### 0.0.2-beta.1 (2018-04-13)

- Use beta version to prevent incresing version too soon
- `SmartLog.error` can handle `Error` type and extract infomation from it

### 0.0.2 (2018-04-13)

- Provide new method `patchData` to allow you add user data anytime rather than at enable moment
- Provide a `beforeSend` option to reshape the request body be sent to backend 

### 0.0.1 (2018-04-13)

- First release version `0.0.1`. Yeah!
- Provide a set of wrapped method in `SmartLog` to replace `console.log`, `console.info`
- Intercept javascript error with `window.onerror` handler
- Provide a log report service