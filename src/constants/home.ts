export const defaultBanners = [
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/season-banner.png`,
    pathname: '/products/search/파라점퍼스 고비',
    backgroundColor: '#1C2433'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/my-portfolio-main-banner.png`,
    pathname: '/myPortfolio',
    backgroundColor: '#402877'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/event-1-banner.png`,
    pathname: '/events/급처-매물-13',
    backgroundColor: '#134B3B'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/announce-banner.png`,
    pathname: '/announces/5',
    backgroundColor: '#095B84'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/event-2-banner.png`,
    pathname: '/events/명품-14',
    backgroundColor: '#9F2240'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/event-3-banner.png`,
    pathname: '/events/인기-특가-매물-16',
    backgroundColor: '#5A2B08'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/event-interfere-in-king-banner.png`,
    pathname: '/events/interfereInKing',
    backgroundColor: '#0B123E'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/camel-seller-banner.png`,
    pathname: '/camelSeller/registerConfirm',
    backgroundColor: '#4836B6'
  }
];

export const maleBanners = [
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/male_season_banner01.png`,
    pathname: '/products/search/파라점퍼스 고비 패딩',
    backgroundColor: '#8D2606'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/male_season_banner02.png`,
    pathname: '/products/search/스톤아일랜드 맨투맨',
    backgroundColor: '#068D54'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/male_season_banner03.png`,
    pathname: '/products/search/프라이탁 라씨',
    backgroundColor: '#AE5C20'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/male_season_banner04.png`,
    pathname: '/products/search/톰브라운 가디건',
    backgroundColor: '#2262AD'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/male_season_banner05.png`,
    pathname: '/products/search/아이앱 후드티',
    backgroundColor: '#187E95'
  }
];

export const femaleBanners = [
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/female_season_banner01.png`,
    pathname: '/products/search/샤넬 카드지갑',
    backgroundColor: '#D2A13D'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/female_season_banner03.png`,
    pathname: '/products/search/프라이탁 라씨',
    backgroundColor: '#AE5C20'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/female_season_banner02.png`,
    pathname: '/products/search/루이비통 가방',
    backgroundColor: '#64504B'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/female_season_banner04.png`,
    pathname: '/products/search/샤넬 가브리엘 백팩',
    backgroundColor: '#696D7B'
  },
  {
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/home/female_season_banner05.png`,
    pathname: '/products/search/디올 오블리크 카드지갑',
    backgroundColor: '#AFA382'
  }
];

// 스니커즈, 시계, 맨투맨, 패딩/점퍼, 카드지갑, 자켓/바람막이
// 조던 구찌 스톤아일랜드 프라이탁, 루이비통, 톰브라운, 샤넬, 애플
export const defaultNonMemberPersonalGuideList = [
  {
    id: 383,
    name: '스니커즈',
    parentId: 14,
    type: 'category',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_383_m.png`
  },
  {
    id: 409,
    name: '시계',
    parentId: 96,
    type: 'category',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_409_m.png`
  },
  {
    id: 366,
    name: '맨투맨',
    parentId: 97,
    type: 'category',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_366_m.png`
  },
  {
    id: 356,
    name: '패딩/점퍼',
    parentId: 119,
    type: 'category',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_356_m.png`
  },
  {
    id: 393,
    name: '카드지갑',
    parentId: 98,
    type: 'category',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_393_m.png`
  },
  {
    id: 286,
    name: '자켓/바람막이',
    parentId: 119,
    type: 'category',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/category/ico_cate_286_m.png`
  },
  {
    id: 216,
    name: '조던',
    parentId: 0,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/airjordan.jpg`
  },
  {
    id: 6,
    name: '구찌',
    parentId: 0,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/gucci.jpg`
  },
  {
    id: 25,
    name: '스톤아일랜드',
    parentId: 0,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/stoneisland.jpg`
  },
  {
    id: 125,
    name: '프라이탁',
    parentId: 98,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/freitag.jpg`
  },
  {
    id: 11,
    name: '루이비통',
    parentId: 0,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/louisvuitton.jpg`
  },
  {
    id: 32,
    name: '톰브라운',
    parentId: 0,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/thombrowne.jpg`
  },
  {
    id: 44,
    name: '샤넬',
    parentId: 0,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/chanel.jpg`
  },
  {
    id: 51,
    name: '애플',
    parentId: 0,
    type: 'brand',
    src: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/apple.jpg`
  }
];
