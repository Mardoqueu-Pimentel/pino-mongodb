'use strict'

const EOL = require('os').EOL
const util = require('util')
const dateformat = require('dateformat')
const options = {
  forceServerObjectId: true
}

const chalk = require('chalk')
const ctx = new chalk.constructor({ enabled: true, level: 3 })
const colored = {
  default: ctx.white,
  60: ctx.bgRed,
  50: ctx.red,
  40: ctx.yellow,
  30: ctx.green,
  20: ctx.blue,
  10: ctx.grey,
  message: ctx.cyan
}

const LEVELS = {
    default: 'USERLVL',
    '60': 'FATAL',
    '50': 'ERROR',
    '40': 'WARN ',
    '30': 'INFO ',
    '20': 'DEBUG',
    '10': 'TRACE'
}

module.exports = function makeInsert (showErrors, showStdout) {
  let callback

  if (showErrors && showStdout) {
    callback = function (e, result) {
      if (e) {
        console.error(e)
      } else {
        const {level, time, ...rest} = result.ops[0];
        const formatedTime = time ? dateformat(time, 'UTC:yyyy-mm-dd HH:MM:ss.l') : 'NO_TIME';
        const levelStr = LEVELS[level] || LEVELS.default;
        const coloredLevel = (colored[level] || colored.default)(levelStr);

        process.stdout.write(`${formatedTime} - ${coloredLevel}${EOL}`);
        process.stdout.write(`${util.inspect(rest, false, null, true)}${EOL} ${EOL}`);
      }
    }
  } else if (showErrors && !showStdout) {
    callback = function (e) {
      if (e) {
        console.error(e)
      }
    }
  } else if (!showErrors && showStdout) {
    callback = function (e, result) {
      if (!e) {
        process.stdout.write(JSON.stringify(result.ops[0]) + EOL)
      }
    }
  }

  return function insert (collection, log) {
    collection.insertOne(log, options, callback)
  }
}
