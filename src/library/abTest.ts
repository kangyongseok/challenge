import type { AmplitudeClient } from 'amplitude-js';

import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { convertHashCode, setCookie } from '@utils/common';

import type { ABTestTask } from '@typings/common';

let identifier: Record<string, number> = {};

const tasks: ABTestTask[] = [
  {
    name: abTestTaskNameKeys.WELCOME3_2211,
    slot: 'test_type_01',
    postfix: {
      A: '2212_RECOMMEND_A',
      B: '2212_RECOMMEND_B'
    },
    ratio: {
      A: 50,
      B: 50
    },
    running: false,
    defaultBelong: 'A'
  },
  {
    name: abTestTaskNameKeys.BETTER_CARD_2301,
    slot: 'test_type_02',
    postfix: {
      A: '2301_RECOMMEND_A',
      B: '2301_RECOMMEND_B',
      C: '2301_RECOMMEND_C'
    },
    ratio: {
      A: 50,
      B: 0,
      C: 50
    },
    running: false,
    defaultBelong: 'A'
  },
  {
    name: abTestTaskNameKeys.BETTER_CARD_2302,
    slot: 'test_type_01',
    postfix: {
      A: '2302_RECOMMEND_A',
      B: '2302_RECOMMEND_B'
    },
    ratio: {
      A: 50,
      B: 50
    },
    running: true,
    defaultBelong: 'A'
  }
];

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
  getPostfix(name: string) {
    const findTask = tasks.find((task) => task.name === name);
    return findTask?.postfix;
  },
  getIdentifier() {
    return identifier;
  },
  setIdentifier(newIdentifier: Record<string, number>) {
    identifier = newIdentifier;
  },
  getBelong(name: string) {
    const findTask = tasks.find((task) => task.name === name);

    if (!identifier[name] || !findTask) return 'A';

    const {
      ratio: { A, B, C },
      defaultBelong
    } = findTask;

    if (identifier[name] < A) {
      return 'A';
    }
    if (identifier[name] < A + B) {
      return 'B';
    }
    if (C && identifier[name] < A + B + C) {
      return 'C';
    }

    return defaultBelong;
  },
  getTasks() {
    return tasks;
  }
};

export default ABTest;
