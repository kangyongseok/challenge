import { atom } from 'recoil';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import { ACCESS_USER, SAVE_SEARCH_BOOSTING_DONE_USERS } from '@constants/localStorage';

export const productsKeywordState = atom({
  key: 'products/productsKeywordState',
  default: false
});

export const productsKeywordAutoSaveTriggerState = atom({
  key: 'products/productsKeywordAutoSaveTriggerState',
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

export default productsKeywordState;
