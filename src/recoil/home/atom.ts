import { atom, atomFamily } from 'recoil';

import type { GuideProductsParams } from '@dto/personal';

export const homeCamelProductCurationPrevScrollState = atom({
  key: 'home/camelProductCurationPrevScrollState',
  default: 0
});

export const homePersonalProductCurationPrevScrollState = atom({
  key: 'home/personalProductCurationPrevScrollState',
  default: 0
});

export const homeSelectedTabStateFamily = atomFamily<
  {
    selectedIndex: number;
    prevScroll: number;
  },
  'productKeyword' | 'recentSearch'
>({
  key: 'home/selectedTabStateFamily',
  default: {
    selectedIndex: 0,
    prevScroll: 0
  }
});

export const homeLegitResultTooltipCloseState = atom({
  key: 'home/legitResultTooltipCloseState',
  default: false
});

export const homeGuideProductsParamsState = atom<GuideProductsParams>({
  key: 'home/guideProductsParamsState',
  default: {}
});

export const homePersonalCurationBannersState = atom<
  {
    src: string;
    pathname: string;
    backgroundColor: string;
  }[]
>({
  key: 'home/personalCurationBannersState',
  default: []
});

export const personalGuideListCurrentThemeState = atom({
  key: 'home/personalGuideListCurrentThemeState',
  default: 0
});
