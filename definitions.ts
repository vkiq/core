/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from 'events';
import { WriteStream } from 'fs';

declare class PluginLogger {
  log(message: string): void;
  err(message: string): void;
  ok(message: string): void;
  warn(message: string): void;
  i(message: string): void;
  l(message: string): void;
  inf(message: string): void;
  info(message: string): void;
  m(message: string): void;
  msg(message: string): void;
  message(message: string): void;
  blue(message: string): void;
  b(message: string): void;
  error(message: string): void;
  e(message: string): void;
  fatal(message: string): void;
  stop(message: string): void;
  red(message: string): void;
  r(message: string): void;
  o(message: string): void;
  s(message: string): void;
  success(message: string): void;
  ready(message: string): void;
  green(message: string): void;
  g(message: string): void;
  wrn(message: string): void;
  w(message: string): void;
  warning(message: string): void;
  orange(message: string): void;
  yellow(message: string): void;
  constructor(name: string, stream: WriteStream);
}

class VkiQPluginOptions {
  channel: string;
  log: PluginLogger;
  debug: boolean;
  dispatch: EventEmitter;
  address: string;
  [K: string]: any;
}

class VkiqPluginConfig {
  name: string;
  channel: string;
}

class VkiqConfig {
  public port: number;
  public host: string;
  public debug: boolean;
  public plugins: Array<VkiqPluginConfig>;
}

const defaultConfig: VkiqConfig = {
  port: 3000,
  host: 'localhost',
  debug: false,
  plugins: []
};

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
  for (const plugin of config.plugins) {
    if (!('name' in plugin && 'channel' in plugin)) return '插件配置不完整。';
  }
  return 'OK';
};

export {
  VkiqConfig,
  VkiqPluginConfig,
  defaultConfig,
  VkiQPluginOptions,
  validateConfig,
  PluginLogger
};
