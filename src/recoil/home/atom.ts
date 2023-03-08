import { atom, atomFamily } from 'recoil';

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

export const homePopularCamelProductListPrevPageState = atom({
  key: 'home/popularCamelProductListPrevPageState',
  default: 0
});

export const personalGuideListCurrentThemeState = atom({
  key: 'home/personalGuideListCurrentThemeState',
  default: 0
});

export const hasHomeTabChangeState = atom({
  key: 'home/hasHomeTabChangeState',
  default: false
});
