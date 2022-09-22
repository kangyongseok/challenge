import { atom } from 'recoil';
import dayjs from 'dayjs';

import { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import {
  ACCESS_USER,
  PRODUCT_KEYWORD_LATEST_INDUCE_TRIGGER,
  SAVE_SEARCH_BOOSTING_DONE_USERS
} from '@constants/localStorage';

export const productsKeywordState = atom({
  key: 'productsKeywordState',
  default: false
});

export const productsKeywordDialogState = atom({
  key: 'productsKeywordDialogState',
  default: {
    open: false,
    pathname: '/'
  }
});

export const productsSaveSearchPopupState = atom({
  key: 'productsSaveSearchPopupState',
  default: false
});

export const productsKeywordAutoSaveTriggerState = atom({
  key: 'productsKeywordAutoSaveTriggerState',
  default: true,
  effects: [
    ({ setSelf, onSet }) => {
      const saveSearchBoostingDoneUsers = LocalStorage.get<number[]>(
        SAVE_SEARCH_BOOSTING_DONE_USERS
      );
      const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);

      if (accessUser && saveSearchBoostingDoneUsers?.includes(accessUser.userId)) setSelf(false);

      onSet((newValue, _, isReset) => {
        if (isReset) LocalStorage.remove(SAVE_SEARCH_BOOSTING_DONE_USERS);

        if (!newValue && accessUser)
          LocalStorage.set(
            SAVE_SEARCH_BOOSTING_DONE_USERS,
            (saveSearchBoostingDoneUsers || []).concat(accessUser?.userId)
          );
      });
    }
  ]
});

export const productsKeywordInduceTriggerState = atom({
  key: 'productsKeywordInduceTriggerState',
  default: {
    tooltip: true,
    alert: false,
    dialog: false,
    latestTriggerTime: 0
  },
  effects: [
    ({ onSet, setSelf }) => {
      const {
        tooltip = true,
        alert = true,
        dialog = false,
        latestTriggerTime
      } = LocalStorage.get<{
        tooltip: boolean;
        alert: boolean;
        dialog: boolean;
        latestTriggerTime: number;
      }>(PRODUCT_KEYWORD_LATEST_INDUCE_TRIGGER) || {};

      if (latestTriggerTime) {
        const diffDay = dayjs(latestTriggerTime).diff(new Date(), 'day');

        if (diffDay >= 14) {
          setSelf({
            tooltip,
            alert: true,
            dialog: false,
            latestTriggerTime: 0
          });
        } else {
          setSelf({
            tooltip,
            alert,
            dialog,
            latestTriggerTime
          });
        }
      } else {
        setSelf({
          tooltip,
          alert,
          dialog,
          latestTriggerTime: 0
        });
      }

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(PRODUCT_KEYWORD_LATEST_INDUCE_TRIGGER);
        } else {
          LocalStorage.set(PRODUCT_KEYWORD_LATEST_INDUCE_TRIGGER, newValue);
        }
      });
    }
  ]
});

export default productsKeywordState;
