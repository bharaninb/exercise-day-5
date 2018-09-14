function noop() {}

/* global window */
/* eslint no-undef: ["error", { "typeof": true }] */
if (typeof window !== 'undefined') {
  window.console = {
    warn: noop,
    error: noop,
  };
}

// eslint-disable-next-line
console.info = noop;

let asserted;

function createCompareFn(spy) {
  const hasWarned = (msg) => {
    function containsMsg(arg) {
      return arg.toString().indexOf(msg) > -1;
    }

    let count = spy.calls.count();
    let args;
    while (count) {
      args = spy.calls.argsFor(count);
      if (args.some(containsMsg)) {
        return true;
      }
      count -= 1;
    }
    return false;
  };

  return {
    compare: (msg) => {
      asserted = asserted.concat(msg);
      const warned = Array.isArray(msg)
        ? msg.some(hasWarned)
        : hasWarned(msg);
      return {
        pass: warned,
        message: warned
          ? `Expected message "${msg}" not to have been warned`
          : `Expected message "${msg}" to have been warned`,
      };
    },
  };
}

// define custom matcher for warnings
beforeEach(() => {
  asserted = [];
  /* global spyOn */
  /* eslint no-undef: ["error", { "typeof": true }] */
  if (typeof spyOn !== 'undefined') {
    spyOn(console, 'warn');
    spyOn(console, 'error');
  }
  /* global jasmine */
  /* eslint no-undef: ["error", { "typeof": true }] */
  if (typeof spyOn !== 'undefined') {
    /* eslint no-console: ["error", { allow: ["error", "warn"] }] */
    jasmine.addMatchers({
      toHaveBeenWarned: () => createCompareFn(console.error),
      toHaveBeenTipped: () => createCompareFn(console.warn),
    });
  }
});

afterEach((done) => {
  const warned = msg => asserted.some(assertedMsg => msg.toString().indexOf(assertedMsg) > -1);
  let count = console.error.calls.count();
  let args;
  while (count) {
    args = console.error.calls.argsFor(count);
    if (!warned(args[0])) {
      done.fail(`Unexpected console.error message: ${args[0]}`);
      return;
    }
    count -= 1;
  }
  done();
});