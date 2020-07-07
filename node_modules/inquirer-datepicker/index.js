/**
 * @module index
 * @license MIT
 */

'use strict';

const chalk = require('chalk');
const moment = require('moment');
const cursor = require('cli-cursor');
const Base = require('inquirer/lib/prompts/base');
const observe = require('inquirer/lib/utils/events');
const { take, takeUntil } = require('rxjs/operators');
const { findIndex, findLastIndex } = require('lodash');

const PROPS = ['year', 'month', 'day', 'hour', 'minute', 'second'];

/**
 * @function normalizeRange
 * @param {Array} range
 * @param {string} key
 */
function normalizeRange(range, key) {
  if (range && range.hasOwnProperty(key)) {
    let value = range[key] >>> 0;

    if (key === 'month') {
      range[key] = Math.max(0, value - 1);
    } else {
      range[key] = value;
    }
  }
}

/**
 * @function normalizeStep
 * @param {number} steps
 * @param {string} key
 */
function normalizeStep(steps, key) {
  key += 's';
  steps[key] = Math.max(steps[key] >>> 0, 1);
}

/**
 * @function resolveRange
 * @param {Moment} date
 * @param {Array} range
 * @returns {Moment|null}
 */
function resolveRange(date, range) {
  if (!range) return null;

  let count = 0;
  const meta = {};

  PROPS.forEach(key => {
    if (range.hasOwnProperty(key)) {
      count++;
      meta[key] = range[key];
    } else {
      meta[key] = date.get(key);
    }
  });

  return count ? moment(meta) : null;
}

/**
 * @function isValidDate
 * @param {Moment} date
 * @param {Array} min
 * @param {Array} max
 * @returns {boolean}
 */
function isValidDate(date, min, max) {
  min = resolveRange(date, min);
  max = resolveRange(date, max);

  if ((min && date.isBefore(min)) || (max && date.isAfter(max))) {
    return false;
  }

  return true;
}

/**
 * @function isSelectable
 * @param {any} value
 * @returns {boolean}
 */
function isSelectable(value) {
  return value !== null;
}

/**
 * @class Datepicker
 * @extends Base
 */
module.exports = class Datepicker extends Base {
  /**
   * @constructor
   * @param {question} question
   * @param {rl} rl
   * @param {answers} answers
   */
  constructor(question, rl, answers) {
    super(question, rl, answers);

    const options = this.opt;
    let format = options.format;
    const min = options.min || null;
    const max = options.max || null;
    const steps = options.steps || {};

    PROPS.forEach(key => {
      normalizeRange(min, key);
      normalizeRange(max, key);
      normalizeStep(steps, key);
    });

    if (!Array.isArray(format)) {
      format = ['Y', '/', 'MM', '/', 'DD', ' ', 'HH', ':', 'mm', ':', 'ss'];
    }

    let initial = moment(options.default);

    if (min) {
      initial = moment.max(moment(min), initial);
    }

    if (max) {
      initial = moment.min(moment(max), initial);
    }

    const selection = { value: 0, cursor: 0, date: initial, elements: [] };

    function saveSelectionDate(date) {
      if (isValidDate(date, min, max)) {
        selection.date = date;

        return true;
      }

      return false;
    }

    format.forEach(key => {
      const elements = selection.elements;

      switch (key) {
        case 'Y':
        case 'YY':
        case 'YYYY':
          elements.push({
            add(value) {
              return saveSelectionDate(selection.date.clone().add(value * steps.years, 'years'));
            },
            set(value) {
              if (value >= 1000) {
                selection.value = 0;
              }

              if (value <= 9999) {
                saveSelectionDate(selection.date.clone().set('year', value));
              }
            }
          });
          break;
        case 'M':
        case 'Mo':
        case 'MM':
        case 'MMM':
        case 'MMMM':
          elements.push({
            add(value) {
              return saveSelectionDate(selection.date.clone().add(value * steps.months, 'months'));
            },
            set(value) {
              if (value >= 10 || parseInt(value % 10) > 1) {
                selection.value = 0;
              }

              if (value >= 1 && value <= 12) {
                saveSelectionDate(selection.date.clone().set('month', value - 1));
              }
            }
          });
          break;
        case 'D':
        case 'Do':
        case 'DD':
          elements.push({
            add(value) {
              return saveSelectionDate(selection.date.clone().add(value * steps.days, 'days'));
            },
            set(value) {
              if (value >= 10 || parseInt(value % 10) > 3) {
                selection.value = 0;
              }

              if (value >= 1 && value <= 31) {
                saveSelectionDate(selection.date.clone().set('date', value));
              }
            }
          });
          break;
        case 'H':
        case 'HH':
        case 'h':
        case 'hh':
          elements.push({
            add(value) {
              return saveSelectionDate(selection.date.clone().add(value * steps.hours, 'hours'));
            },
            set(value) {
              if (value >= 10 || parseInt(value % 10) > 2) {
                selection.value = 0;
              }

              if (value >= 0 && value <= 24) {
                saveSelectionDate(selection.date.clone().set('hour', value));
              }
            }
          });
          break;
        case 'm':
        case 'mm':
          elements.push({
            add(value) {
              return saveSelectionDate(selection.date.clone().add(value * steps.minutes, 'minutes'));
            },
            set(value) {
              if (value >= 10 || parseInt(value % 10) > 5) {
                selection.value = 0;
              }

              if (value >= 0 && value <= 59) {
                saveSelectionDate(selection.date.clone().set('minute', value));
              }
            }
          });
          break;
        case 's':
        case 'ss':
          elements.push({
            add(value) {
              return saveSelectionDate(selection.date.clone().add(value * steps.seconds, 'seconds'));
            },
            set(value) {
              if (value >= 10 || parseInt(value % 10) > 5) {
                selection.value = 0;
              }

              if (value >= 0 && value <= 59) {
                saveSelectionDate(selection.date.clone().set('second', value));
              }
            }
          });
          break;
        case 'A':
        case 'a':
          elements.push({
            add() {
              const hour = selection.date.get('hour');

              return saveSelectionDate(selection.date.clone().add(hour >= 12 ? -12 : 12, 'hours'));
            },
            set() {
              return true;
            }
          });
          break;
        default:
          elements.push(null);
      }
    });

    options.steps = steps;
    options.default = null;
    options.format = format;
    options.min = min || null;
    options.max = max || null;

    this.selection = selection;

    // Hide cursor
    cursor.hide();
  }

  /**
   * @method _run
   * @description Start the Inquiry session
   * @param {Function} done   Callback when prompt is done
   * @return {Datepicker}
   */
  _run(done) {
    this.done = done;

    // Once user confirm (enter key)
    const events = observe(this.rl);
    const line = events.line;
    const keypress = events.keypress;
    const onEnd = this.onEnd.bind(this);
    const onKeypress = this.onKeypress.bind(this);

    line.pipe(take(1)).forEach(onEnd);
    keypress.pipe(takeUntil(line)).forEach(onKeypress);
    this.render();

    return this;
  }

  /**
   * @method render
   * @description Render the prompt to screen
   * @return {Datepicker}
   */
  render() {
    let unselected = '';
    let message = this.getQuestion();
    const format = this.opt.format;
    const selection = this.selection;

    function outputUnselected() {
      if (unselected) {
        message += chalk.reset.yellow(selection.date.format(unselected));
        unselected = '';
      }
    }

    format.forEach((key, index) => {
      if (selection.cursor === index) {
        outputUnselected();

        message += chalk.reset.yellow.inverse(` ${selection.date.format(key)} `);
      } else {
        unselected += key;
      }
    });

    outputUnselected();
    this.screen.render(message);

    return this;
  }

  /**
   * @method onKeypress
   * @param {Events} e
   * @description When user press a key
   */
  onKeypress(e) {
    let index;
    const options = this.opt;
    const selection = this.selection;
    const cursor = selection.cursor;
    const elements = selection.elements;

    // Arrow Keys
    if (e.key.name === 'right') {
      index = findIndex(elements, isSelectable, cursor + 1);
      selection.cursor = index >= 0 ? index : cursor;
    } else if (e.key.name === 'left') {
      index = findLastIndex(elements, isSelectable, cursor > 0 ? cursor - 1 : cursor);
      selection.cursor = index >= 0 ? index : cursor;
    } else if (e.key.name === 'up') {
      if (!elements[cursor].add(1) && options.max) {
        selection.date = resolveRange(selection.date, options.max);
      }
    } else if (e.key.name === 'down') {
      if (!elements[cursor].add(-1) && options.min) {
        selection.date = resolveRange(selection.date, options.min);
      }
    }

    // Numerical Entry
    const input = parseInt(e.value, 10);

    if (Number.isSafeInteger(input)) {
      selection.value = selection.value * 10 + input;
      elements[cursor].set(selection.value);
    } else {
      selection.value = 0;
    }

    this.render();
  }

  /**
   * @method onEnd
   * @description When user press `enter` key
   */
  onEnd() {
    const screen = this.screen;
    const selection = this.selection;
    const format = this.opt.format;
    let message = this.getQuestion();

    this.status = 'answered';

    message += chalk.reset.cyan(selection.date.format(format.join('')));

    screen.render(message);
    screen.done();
    this.done(selection.date.toDate());

    // Show cursor
    cursor.show();
  }
};
