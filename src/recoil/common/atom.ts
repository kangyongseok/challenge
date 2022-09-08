import type { ReactElement } from 'react';

import { atom } from 'recoil';
import type { CustomStyle } from 'mrcamel-ui';

import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { DEVICE_ID, USER_ON_BOARDING_TRIGGER } from '@constants/localStorage';

import type { DialogType, ShareData, ToastStatus, ToastType } from '@typings/common';

export const userOnBoardingTriggerState = atom({
  key: 'common/userOnBoardingTriggerState',
  default: {
    products: {
      complete: false,
      step: 0
    }
  },
  effects: [
    ({ onSet, setSelf }) => {
      const userOnBoardingTrigger = LocalStorage.get<{
        products: { complete: boolean; step: number };
      }>(USER_ON_BOARDING_TRIGGER);
      if (userOnBoardingTrigger) {
        setSelf(userOnBoardingTrigger);
      }

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(USER_ON_BOARDING_TRIGGER);
        } else {
          LocalStorage.set(USER_ON_BOARDING_TRIGGER, newValue);
        }
      });
    }
  ]
});

export const deviceIdState = atom<string | undefined>({
  key: 'common/deviceIdState',
  default: undefined,
  effects: [
    ({ onSet, setSelf, trigger }) => {
      const deviceId = LocalStorage.get<string>(DEVICE_ID);

      if (deviceId) {
        setSelf(deviceId);
      }

      if (trigger === 'get' && deviceId) {
        setSelf(deviceId);
      }

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(DEVICE_ID);
        } else {
          LocalStorage.set(DEVICE_ID, newValue);
        }
      });
    }
  ]
});

export const showAppDownloadBannerState = atom<boolean>({
  key: 'common/showAppDownloadBannerState',
  default: false
});

export const toastState = atom<{
  type: ToastType | undefined;
  status: ToastStatus | undefined;
  hideDuration?: number;
  action?: () => void;
}>({
  key: 'common/toastState',
  default: {
    type: undefined,
    status: undefined
  }
});

export const dialogState = atom<{
  type: DialogType | undefined;
  firstButtonAction?: () => void;
  secondButtonAction?: () => void;
  content?: string | number | ReactElement;
  product?: Product | undefined;
  shareData?: ShareData;
  customStyleTitle?: CustomStyle;
  disabledOnClose?: boolean;
}>({
  key: 'common/dialogState',
  default: {
    type: undefined
  }
});
