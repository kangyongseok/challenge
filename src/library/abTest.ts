import type { AmplitudeClient } from 'amplitude-js';

import { convertHashCode, setCookie } from '@utils/common';

import type { ABTestTask } from '@typings/common';

let identifier: Record<string, number> = {};
const tasks: ABTestTask[] = [];

const ABTest = {
  init(amplitudeClient: AmplitudeClient) {
    tasks.forEach((task) => {
      const { name, slot, postfix, running } = task;
      identifier[name] =
        convertHashCode(amplitudeClient.getDeviceId() + JSON.stringify(task)) % 100;

      const testBelong = ABTest.getBelong(name);
      const testPostfix = testBelong && postfix[testBelong] ? `_${postfix[testBelong]}` : '';

      const identify = new amplitudeClient.Identify().set(
        slot,
        running ? `${name}_${testBelong}${testPostfix}` : 'NONE'
      );
      amplitudeClient.identify(identify);
    });

    const hasRunningTask = !!tasks.filter(({ running }) => running).length;

    setCookie('abTestIdentifier', JSON.stringify(identifier), hasRunningTask ? 365 : 0);
  },
  getIdentifier() {
    return identifier;
  },
  setIdentifier(newIdentifier: Record<string, number>) {
    identifier = newIdentifier;
  },
  getBelong(name: string) {
    const findTask = tasks.find((task) => task.name === name);

    if (!identifier[name] || !findTask) return null;

    const {
      ratio: { A, B },
      defaultBelong
    } = findTask;

    if (identifier[name] < A) {
      return 'A';
    }
    if (identifier[name] < A + B) {
      return 'B';
    }

    return defaultBelong;
  },
  getTasks() {
    return tasks;
  }
};

export default ABTest;
