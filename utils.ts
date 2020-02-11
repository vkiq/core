import * as os from 'os';

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

export { formatBytes, formatSecond, cpuStat };
