import type { ReactElement } from 'react';

import { atom } from 'recoil';
import type { CustomStyle } from 'mrcamel-ui';

import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';

import {
  ACCESS_USER_SETTING_VALUES,
  DEVICE_ID,
  THEME,
  USER_ON_BOARDING_TRIGGER
} from '@constants/localStorage';

import type {
  AccessUserSettingValue,
  DialogType,
  ShareData,
  ThemeMode,
  ToastStatus,
  ToastType
} from '@typings/common';

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
  theme?: Exclude<ThemeMode, 'system'>;
  params?: Record<string, string | number>;
  hideDuration?: number;
  customStyle?: CustomStyle;
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
  theme?: Exclude<ThemeMode, 'system'>;
  firstButtonAction?: () => void;
  secondButtonAction?: () => void;
  onClose?: () => void;
  content?: string | number | ReactElement;
  product?: Product | undefined;
  shareData?: ShareData;
  customStyle?: CustomStyle;
  customStyleTitle?: CustomStyle;
  disabledOnClose?: boolean;
}>({
  key: 'common/dialogState',
  default: {
    type: undefined
  }
});

export const themeState = atom<ThemeMode>({
  key: 'common/themeState',
  default: 'system',
  effects: [
    ({ onSet, setSelf }) => {
      const theme = LocalStorage.get<ThemeMode>(THEME);

      setSelf(theme || 'system');

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(THEME);
        } else {
          LocalStorage.set(THEME, newValue);
        }
      });
    }
  ]
});

export const loginBottomSheetState = atom({
  key: 'common/loginBottomSheetState',
  default: false
});

export const historyState = atom<{
  index: number;
  pathNames: string[];
  asPaths: string[];
}>({
  key: 'common/historyState',
  default: {
    index: 0,
    pathNames: ['/'],
    asPaths: ['/']
  }
});

export const isGoBackState = atom({
  key: 'common/isGoBackState',
  default: false
});

export const accessUserSettingValuesState = atom<AccessUserSettingValue[]>({
  key: 'common/accessUserSettingValuesState',
  default: [],
  effects: [
    ({ onSet, setSelf }) => {
      const accessUserSettingValues =
        LocalStorage.get<AccessUserSettingValue[]>(ACCESS_USER_SETTING_VALUES) || [];

      setSelf(accessUserSettingValues);

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(ACCESS_USER_SETTING_VALUES);
        } else {
          LocalStorage.set(ACCESS_USER_SETTING_VALUES, newValue);
        }
      });
    }
  ]
});
