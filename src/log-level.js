const LEVEL_DEFINITION = {
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

export class LogLevel {
  constructor(levelText, level, color) {
    if (!LEVEL_DEFINITION[levelText]) {
      throw new Error();
    }

    this.levelText = levelText;
    this.level = level || LEVEL_DEFINITION[levelText].level;
    this.color = color || LEVEL_DEFINITION[levelText].color;
  }

  greaterThan(logLevel) {
    return this.level >= logLevel.level;
  }
}

export const LEVEL_DEBUG = new LogLevel(
  'DEBUG',
  LEVEL_DEFINITION.DEBUG.level,
  LEVEL_DEFINITION.DEBUG.color
);
export const LEVEL_INFO = new LogLevel(
  'INFO',
  LEVEL_DEFINITION.INFO.level,
  LEVEL_DEFINITION.INFO.color
);
export const LEVEL_ERROR = new LogLevel(
  'ERROR',
  LEVEL_DEFINITION.ERROR.level,
  LEVEL_DEFINITION.ERROR.color
);
