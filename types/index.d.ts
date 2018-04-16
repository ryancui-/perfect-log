declare namespace PerfectLog {
  export enum LogLevel {
    Debug = 'DEBUG',
    Info = 'INFO',
    Error = 'ERROR'
  }

  export interface LogInfo {
    level: LogLevel;
    msg?: string;
    time: string;
    data?: object;
    error?: Error;
    platform: {
      browser: string
    }
  }

  export interface ReportOptions {
    url: string;
    level?: LogLevel;
    data?: object;

    beforeSend?(logInfo: LogInfo): LogInfo;
  }
}

declare class PerfectLog {
  initialize(): void;

  enableReport(options: PerfectLog.ReportOptions): void;

  disableReport(): void;

  patchData(data: object): void;
  patchData(key: string, value: object): void;

  debug(...log: any[]): void;

  info(...log: any[]): void;

  error(...log: any[]): void;
  error(err: Error): void;
}

declare module 'perfect-log' {
  export default PerfectLog;
}
