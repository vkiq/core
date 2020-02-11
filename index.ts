/* eslint-disable
@typescript-eslint/no-var-requires,
no-empty,
no-process-exit,
import/no-unresolved,
node/no-missing-import */

import { cosmiconfig } from 'cosmiconfig';
import * as fs from 'fs';
import Plugog from 'plugog';
import { cpuStat, formatBytes, formatSecond } from './utils';
import { validateConfig } from './validator';
import envinfo = require('envinfo');
import keypress = require('keypress');
const { version } = require('./package.json');

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
