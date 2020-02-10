/* eslint-disable
@typescript-eslint/no-var-requires,
no-empty,
no-process-exit */

import { cosmiconfig } from 'cosmiconfig';
import * as fs from 'fs';
import * as os from 'os';
import Plugog from 'plugog';
import keypress = require('keypress');
import envinfo = require('envinfo');
const { version } = require('./package.json');

// Utils
function formatSecond(s: number): string {
  const day = Math.floor(s / (24 * 3600));
  const hour = Math.floor((s - day * 24 * 3600) / 3600);
  const minute = Math.floor((s - day * 24 * 3600 - hour * 3600) / 60);
  const second = s - day * 24 * 3600 - hour * 3600 - minute * 60;
  return day + '天' + hour + '时' + minute + '分' + second + '秒';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1000,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

const cpuStat = (): Promise<number> =>
  new Promise<number>((resolve) => {
    let timeUsed;
    let timeUsed0 = 0;
    let timeUsed1 = 0;
    let timeIdle;
    let timeIdle0 = 0;
    let timeIdle1 = 0;
    let cpu1;
    const cpu0 = os.cpus();
    setTimeout(function() {
      cpu1 = os.cpus();
      for (let i = 0; i < cpu1.length; i++) {
        timeUsed1 += cpu1[i].times.user;
        timeUsed1 += cpu1[i].times.nice;
        timeUsed1 += cpu1[i].times.sys;
        timeIdle1 += cpu1[i].times.idle;
      }

      for (let i = 0; i < cpu0.length; i++) {
        timeUsed0 += cpu0[i].times.user;
        timeUsed0 += cpu0[i].times.nice;
        timeUsed0 += cpu0[i].times.sys;
        timeIdle0 += cpu0[i].times.idle;
      }

      timeUsed = timeUsed1 - timeUsed0;
      timeIdle = timeIdle1 - timeIdle0;

      const percent = (timeUsed / (timeUsed + timeIdle)) * 100;

      resolve(percent);
    }, 1000);
  });

// Config Validator
/* eslint-disable-next-line */
const validateConfig = (config: any): string => {
  if (!('port' in config)) return '配置中缺少端口。';
  if (!Number.isSafeInteger(config.port)) return '端口并非整数。';
  if (config.port > 65535 || config.port < 1000)
    return '端口需位于 1000-65535 范围内。';
  if (
    !(
      'plugins' in config &&
      Array.isArray(config.plugins) &&
      config.plugins.length > 0
    )
  )
    return '配置中缺少插件。';
  return 'OK';
};

// Main Processor
(async (): Promise<void> => {
  // Log Init
  try {
    fs.mkdirSync('./logs');
  } catch (error) {}
  const logFile = `./logs/${new Date()
    .toLocaleString()
    .replace(/( |\/|:)/g, '-')}.log`;
  fs.writeFileSync(logFile, '');
  const plugog = new Plugog(fs.createWriteStream(logFile));
  const log = plugog.addPlugin('Core');
  log.i(`VkiQ v${version}`);
  process.title = `VkiQ v${version}`;

  // Pre-Init Method
  let cleanup = (): void => {
    process.exit(0);
  };
  /* eslint-disable-next-line */
  let keypressProc = (ch: any, key: any): void => {
    if (!key || !('name' in key) || key.meta || key.ctrl || key.shift) return;
    switch (key.name) {
      case 'u': {
        log.i('正在统计使用情况。');
        cpuStat().then((percent) => {
          log.i(`${new Date().toLocaleString()} 时的使用情况：`);
          log.i(`持续时间：${formatSecond(process.uptime())}`);
          log.i(`CPU 使用：${percent}%`);
          log.i(`内存使用：${formatBytes(process.memoryUsage().rss)}`);
        });
        break;
      }
      case 'h': {
        log.i('VkiQ 控制台帮助');
        log.i('[u] - 查看使用情况。');
        log.i('[h] - 显示此帮助。');
        break;
      }
      default:
        break;
    }
  };

  // Exception Catcher
  {
    process.on('uncaughtException', (error) => {
      log.e('异常：');
      for (const e of JSON.stringify(error).split('\n')) log.e(e);
    });
    process.on('exit', (code) => {
      log.i('VkiQ 进程结束。');
      if (code === 0) log.i('结束码：0');
      else log.e('结束码：' + code);
    });
    let processExit = false;
    process.on('SIGINT', () => {
      if (processExit) {
        log.w('VkiQ 即将退出。');
        cleanup();
      } else {
        log.w('再次按下 Control-C 以退出。');
        processExit = true;
        setTimeout(() => {
          processExit = false;
        }, 5000);
      }
    });
    process.on('SIGHUP', () => {
      log.e('下次请使用 Control-C 退出。');
      cleanup();
    });
    process.on('warning', (warning) => {
      log.w('警告：');
      log.w(warning.name);
      log.w(warning.message);
    });
    keypress(process.stdin);
    process.stdin.on('keypress', keypressProc);
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }

  // Env Info
  {
    const envResult = await envinfo.run(
      {
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'npm'],
        npmPackages: ['@allquire/core']
      },
      { showNotFound: true }
    );
    log.i('环境信息：');
    for (const i of envResult.split('\n')) log.i(i);
  }

  // Load Config

  const envNullErr = (): void => {
    log.e('没有找到有效的配置文件，程序即将退出。');
    process.exit(1);
  };

  let config;
  {
    const confResult = await cosmiconfig('vkiq', {
      searchPlaces: [
        'vkiq.config.json',
        'vkiq.config.yaml',
        'vkiq.config.yml',
        'vkiq.config.js'
      ]
    }).search();
    if (confResult) {
      if (confResult.config) {
        const validateResult = validateConfig(confResult.config);
        if (validateResult === 'OK') config = confResult.config;
        else {
          log.e(validateResult);
          envNullErr();
        }
      } else envNullErr();
    } else envNullErr();
  }

  const debug = config.debug;
  if (debug) log.w('调试模式已开启。这会大幅降低性能。');

  // Complete
  log.success('VkiQ 启动完成。');
  log.success('使用 [u] 查看使用情况，[h] 查看帮助。');
  log.success('使用 Control-C 退出 VkiQ。');

  // Methods Update
  cleanup = (): void => {
    process.exit(0);
  };
  // keypressProc = (ch: any, key: any): void => {};
})();
