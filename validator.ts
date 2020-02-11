class VkiqPluginConfig {
  name: string;
  channel: string;
}

class VkiqConfig {
  public port: number;
  public host: string;
  public debug: boolean;
  public plugins: Array<VkiqConfig>;
}

const defaultConfig: VkiqConfig = {
  port: 3000,
  host: 'localhost',
  debug: false,
  plugins: []
};

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
  for (const plugin of config.plugins) {
    if (!('name' in plugin && 'channel' in plugin)) return '插件配置不完整。';
  }
  return 'OK';
};

export { VkiqConfig, VkiqPluginConfig, defaultConfig, validateConfig };
