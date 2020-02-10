/* eslint-disable
@typescript-eslint/no-var-requires,
no-empty,
no-process-exit */

import { cosmiconfig } from 'cosmiconfig';
import * as fs from 'fs';
import Plugog from 'plugog';
import envinfo = require('envinfo');
const { version } = require('./package.json');

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

  // Env Info
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

  // Load Config

  const envNullErr = (): void => {
    log.e('没有找到有效的配置文件，程序即将退出。');
    process.exit(1);
  };

  let config;
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

  const debug = config.debug;
  if (debug) log.w('调试模式已开启。这会大幅降低性能。');
})();
