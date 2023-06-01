import { atom } from 'recoil';

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

export const personalGuideListCurrentThemeState = atom({
  key: 'home/personalGuideListCurrentThemeState',
  default: 0
});
