import SmartLog from './smart-log';

// Wrap the global error handlers
window.onerror = (msg, uri, row, col, err) => {
  if (SmartLog.reportEnabled) {
    const reportObj = SmartLog.buildReportScheme('ERROR', msg, uri, row, err);
    SmartLog.report(reportObj);
  }

  return !SmartLog.consoleOutput;
};

SmartLog.initialize();

export default SmartLog;
