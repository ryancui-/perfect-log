import puppeteer from 'puppeteer';

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.addScriptTag({path: 'dist/smart-log.js'});
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
      SmartLog.enableConsoleOutput();
      SmartLog.debug('debug info');
    });

    expect(fn).toHaveBeenCalled();
  });

  test('should disable console output', async () => {
    const fn = jest.fn();
    page.on('console', fn);

    await page.evaluate(() => {
      SmartLog.disableConsoleOutput();
      SmartLog.debug('debug info');
    });

    expect(fn).not.toHaveBeenCalled();
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
      expect(json.uri).toBeDefined();
      expect(json.row).toBeDefined();

      req.abort();
    });

    await page.evaluate(() => {
      SmartLog.enableReport({
        url: 'http://localhost/test'
      });
      SmartLog.error(new Error(1));
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
      SmartLog.enableReport({
        url: 'http://localhost/test'
      });
      SmartLog.disableConsoleOutput();
      SmartLog.error(new Error(1));
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
      SmartLog.enableReport({
        url: 'http://localhost/test',
        level: 'INFO'
      });
      SmartLog.info(1);
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
      SmartLog.enableReport({
        url: 'http://localhost/test',
        data: {
          x: 1,
          y: '2'
        }
      });
      SmartLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });

  test('should report later add data', async () => {
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
      SmartLog.enableReport({
        url: 'http://localhost/test',
        data: {
          x: 1,
          y: '2'
        }
      });

      SmartLog.patchData({x: 3, z: '4'});
      SmartLog.error(new Error(1));
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
      SmartLog.enableReport({
        url: 'http://localhost/test',
        data: {x: 1},
        beforeSend: (log) => {
          log.x = log.data.x + 1;
          return log;
        }
      });
      SmartLog.error(new Error(1));
    });
    expect(fn).toHaveBeenCalled();
  });
});

