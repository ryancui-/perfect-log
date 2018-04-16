import puppeteer from 'puppeteer';

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({args: ['--no-sandbox']});
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.addScriptTag({path: 'dist/perfect-log.js'});
});

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await browser.close();
});

describe('Console output enable/disable', () => {
  test('should enable console output', async () => {
    const fn = jest.fn();
    page.on('console', msg => {
      fn();
      expect(msg.type()).toBe('log');
    });

    await page.evaluate(() => {
      PerfectLog.enableConsoleOutput();
      PerfectLog.debug('debug info');
    });

    expect(fn).toHaveBeenCalled();
  });

  test('should disable console output', async () => {
    const fn = jest.fn();
    page.on('console', fn);

    await page.evaluate(() => {
      PerfectLog.disableConsoleOutput();
      PerfectLog.debug('debug info');
    });

    expect(fn).not.toHaveBeenCalled();
  });

  test('should enable console output after disable report', async () => {
    const fn = jest.fn();
    page.on('console', msg => {
      fn();
      expect(msg.type()).toBe('log');
    });

    await page.evaluate(() => {
      PerfectLog.disableConsoleOutput();
      PerfectLog.disableReport();
      PerfectLog.enableConsoleOutput();
      PerfectLog.debug('debug info');
    });

    expect(fn).toHaveBeenCalled();
  });
});

describe('Report service', () => {
  test('should enable report service', async () => {
    const fn = jest.fn();
    await page.setRequestInterception(true);
    page.on('request', req => {
      fn();
      expect(req.url()).toBe('http://localhost/test');
      expect(req.method()).toBe('POST');

      const json = JSON.parse(req.postData());
      expect(json.level).toBe('ERROR');
      expect(json.msg).toBeDefined();
      expect(json.time).toBeDefined();
      expect(json.error).toBeDefined();

      req.abort();
    });

    await page.evaluate(() => {
      PerfectLog.enableReport({
        url: 'http://localhost/test'
      });
      PerfectLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });

  test('should enable report service without console out', async () => {
    const fn = jest.fn();
    await page.setRequestInterception(true);
    page.on('request', req => {
      fn();
      expect(req.url()).toBe('http://localhost/test');
      expect(req.method()).toBe('POST');

      req.abort();
    });

    await page.evaluate(() => {
      PerfectLog.enableReport({
        url: 'http://localhost/test'
      });
      PerfectLog.disableConsoleOutput();
      PerfectLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });

  test('should report info level log', async () => {
    const fn = jest.fn();
    await page.setRequestInterception(true);
    page.on('request', req => {
      fn();
      const json = JSON.parse(req.postData());
      expect(json.level).toBe('INFO');

      req.abort();
    });

    await page.evaluate(() => {
      PerfectLog.enableReport({
        url: 'http://localhost/test',
        level: 'INFO'
      });
      PerfectLog.info(1);
    });
    expect(fn).toHaveBeenCalled();
  });

  test('should report user data', async () => {
    const fn = jest.fn();
    await page.setRequestInterception(true);
    page.on('request', req => {
      fn();
      const json = JSON.parse(req.postData());
      expect(json.data).toBeDefined();
      expect(json.data.x).toBe(1);
      expect(json.data.y).toBe('2');

      req.abort();
    });

    await page.evaluate(() => {
      PerfectLog.enableReport({
        url: 'http://localhost/test',
        data: {
          x: 1,
          y: '2'
        }
      });
      PerfectLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });

  test('should patch data in one parameter call', async () => {
    const fn = jest.fn();
    await page.setRequestInterception(true);
    page.on('request', req => {
      fn();
      const json = JSON.parse(req.postData());
      expect(json.data).toBeDefined();
      expect(json.data.x).toBe(3);
      expect(json.data.y).toBe('2');
      expect(json.data.z).toBe('4');

      req.abort();
    });

    await page.evaluate(() => {
      PerfectLog.enableReport({
        url: 'http://localhost/test',
        data: {
          x: 1,
          y: '2'
        }
      });

      PerfectLog.patchData({x: 3, z: '4'});
      PerfectLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });

  test('should patch data in two parameter call', async () => {
    const fn = jest.fn();
    await page.setRequestInterception(true);
    page.on('request', req => {
      fn();
      const json = JSON.parse(req.postData());
      expect(json.data).toBeDefined();
      expect(json.data.x).toBe(3);
      expect(json.data.y).toBe('2');
      expect(json.data.z).toBe('4');

      req.abort();
    });

    await page.evaluate(() => {
      PerfectLog.enableReport({
        url: 'http://localhost/test',
        data: {
          x: 1,
          y: '2'
        }
      });

      PerfectLog.patchData('x', 3);
      PerfectLog.patchData('z', '4');

      PerfectLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });

  test('should update request body before send', async () => {
    const fn = jest.fn();
    await page.setRequestInterception(true);
    page.on('request', req => {
      fn();
      const json = JSON.parse(req.postData());
      expect(json.x).toBe(2);

      req.abort();
    });

    await page.evaluate(() => {
      PerfectLog.enableReport({
        url: 'http://localhost/test',
        data: {x: 1},
        beforeSend: (log) => {
          log.x = log.data.x + 1;
          return log;
        }
      });
      PerfectLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });
});

