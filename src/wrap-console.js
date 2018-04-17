const wrapConsoleMethod = (method, level, color) =>
  console[method].bind(window.console, `%c[${level}]%c`, `color: ${color}`, 'color:black');

export let wrapConsoleDebug = wrapConsoleMethod('log', 'DEBUG', 'green');
export let wrapConsoleInfo = wrapConsoleMethod('info', 'INFO', 'blue');
export let wrapConsoleError = wrapConsoleMethod('error', 'ERROR', 'red');
export let wrapEmptyFn = () => {
};
