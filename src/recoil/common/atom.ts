import { atom, atomFamily } from 'recoil';

import LocalStorage from '@library/localStorage';

import {
  ACCESS_USER_SETTING_VALUES,
  DEVICE_ID,
  THEME,
  USER_ON_BOARDING_TRIGGER
} from '@constants/localStorage';

import type { AccessUserSettingValue, LoginMode, ThemeMode } from '@typings/common';

export const userOnBoardingTriggerDefaultState = {
  products: {
    complete: false,
    step: 0
  },
  productWish: {
    complete: false,
    step: 0
  },
  productPriceOffer: {
    complete: false,
    step: 0
  }
};

export const userOnBoardingTriggerState = atom<typeof userOnBoardingTriggerDefaultState>({
  key: 'common/userOnBoardingTriggerState',
  default: userOnBoardingTriggerDefaultState,
  effects: [
    ({ onSet, setSelf }) => {
      const userOnBoardingTrigger =
        LocalStorage.get<typeof userOnBoardingTriggerDefaultState>(USER_ON_BOARDING_TRIGGER);
      if (userOnBoardingTrigger) {
        setSelf({ ...userOnBoardingTriggerDefaultState, ...userOnBoardingTrigger });
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

export const loginBottomSheetState = atom<{
  open: boolean;
  returnUrl: string;
  mode?: LoginMode;
}>({
  key: 'common/loginBottomSheetState',
  default: {
    open: false,
    returnUrl: '',
    mode: 'normal'
  }
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

export const camelSellerAppUpdateDialogOpenState = atom({
  key: 'common/camelSellerAppUpdateDialogOpenState',
  default: false
});

export const exitUserViewBottomSheetState = atom({
  key: 'common/exitUserViewBottomSheetState',
  default: false
});

export const exitUserNextStepState = atom({
  key: 'common/exitUserNextStepState',
  default: {
    text: '',
    logType: '',
    currentView: '',
    content: ''
  }
});

export const exitNextStepBottomSheetState = atom({
  key: 'common/exitNextStepBottomSheetState',
  default: false
});

export const prevChannelAlarmPopup = atom({
  key: 'common/prevChannelAlarmPopup',
  default: false
});

export const activeViewportTrickState = atom({
  key: 'common/activeViewportTrickState',
  default: false
});

export const inputFocusState = atom({
  key: 'common/inputFocusState',
  default: false
});

export const decryptPendingState = atom({
  key: 'common/decryptPendingState',
  default: false
});

export const productOrderTypeState = atom<0 | 1 | 2>({
  key: 'common/productOrderTypeState',
  default: 0
});

export const popupBottomSheetState = atomFamily({
  key: 'common/popupBottomSheetStateFamily',
  default: (type) => ({
    type,
    open: false,
    isOnceaDay: false, // 하루 한번만 노출
    isNeverShowAgain: false, // 다시보지않기
    isTodayShowAgain: false // 오늘 하루 보지않기
  })
});
