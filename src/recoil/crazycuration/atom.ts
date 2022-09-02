import { atom } from 'recoil';

export const creazycurationSelectedTabState = atom<{
  selectedIndex: number;
  prevScroll: number;
}>({
  key: 'crazycuration/selectedTabState',
  default: {
    selectedIndex: 0,
    prevScroll: 0
  }
});

export const creazycurationProductsEventBottomBannerOpenState = atom({
  key: 'creazycuration/productsEventBottomBannerOpenState',
  default: false
});
