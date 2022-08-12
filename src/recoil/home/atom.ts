import { atom, atomFamily } from 'recoil';

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
