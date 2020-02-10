// Type definitions for VkiQ.Plugin
// Project: VkiQ
// Definitions by: Il Harper <afanyiyu@hotmail.com>

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('vkiq-plugin-name');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from 'vkiq-plugin-name';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.

/* eslint-disable
@typescript-eslint/no-use-before-define,
@typescript-eslint/no-explicit-any */

import { EventEmitter } from 'events';
import { WriteStream } from 'fs';

declare class PluginLogger {
  private name: string;

  private stream: WriteStream;

  // INF: log(), inf(), info(), l(), i(), m(), msg(), message(), blue(), b()
  public log(message: string): void;

  // ERR: err(), error(), e(), fatal(), stop(), red(), r()
  public err(message: string): void;

  // OK: ok(), o(), s(), success(), ready(), green(), g()
  public ok(message: string): void;

  // Alias
  // INF
  public i(message: string): void;
  public l(message: string): void;
  public inf(message: string): void;
  public info(message: string): void;
  public m(message: string): void;
  public msg(message: string): void;
  public message(message: string): void;
  public blue(message: string): void;
  public b(message: string): void;
  // ERR
  public error(message: string): void;
  public e(message: string): void;
  public fatal(message: string): void;
  public stop(message: string): void;
  public red(message: string): void;
  public r(message: string): void;
  // OK
  public o(message: string): void;
  public s(message: string): void;
  public success(message: string): void;
  public ready(message: string): void;
  public green(message: string): void;
  public g(message: string): void;

  constructor(name: string, stream: WriteStream);
}

declare class VkiQPluginOptions {
  channel: string;
  log: PluginLogger;
  debug: boolean;
  dispatch: EventEmitter;
  [K: string]: any;
}

export as namespace VkiQ;

export = plugin;

declare function plugin(options: VkiQPluginOptions): void;
