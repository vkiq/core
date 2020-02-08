/* eslint-disable @typescript-eslint/no-var-requires, no-empty */

import * as fs from 'fs';
import Plugog from 'plugog';
const { version } = require('./package.json');

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
