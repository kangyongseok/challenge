import { ProductDynamicOptionCodeType, ProductOrder } from '@dto/product';

import attrProperty from '@constants/attrProperty';

export const filterCodeIds = {
  price: 0,
  line: 1,
  size: 2,
  color: 3,
  material: 4,
  gender: 5,
  season: 11,
  id: 12,
  map: 13,
  order: 14,
  platform: 99,
  brand: 100,
  category: 101,
  detailOption: 102
};

export const filterGenders = {
  male: {
    id: 994,
    name: '남성'
  },
  female: {
    id: 995,
    name: '여성'
  },
  common: {
    id: 997,
    name: '남여공용'
  }
};

export const filterColors = {
  black: '#000000',
  navy: '#002061',
  blue: '#2320fd',
  red: '#e70718',
  gray: '#999999',
  orange: '#fe7b03',
  yellow: '#fbe92d',
  pink: '#f6109f',
  green: '#2daa16',
  purple: '#7f0ea6',
  charcoal: '#324550',
  olive: '#a8a330',
  brown: '#653102',
  mustard: '#eeb323',
  lime: '#daf30e',
  beige: '#e4c27f',
  khaki: '#5b593a',
  burgundy: '#74212e',
  sky: '#5cc0e8',
  lemon: '#f5ff00',
  lavender: '#a77bca',
  caramel: '#d6992c',
  camel: '#a27400',
  chocolate: '#56410b',
  cobalt: '#4b00ff'
};

export const filterColorImagePositions = {
  white: [-21, -18],
  gold: [-11, -62],
  ivory: [-53, -18],
  silver: [-53, -62],
  metal: [-101, -16],
  neon: [-99, -20],
  'gold-deco': [-99, -62],
  'silver-deco': [-131, -62]
};

export const filterColorImagesInfo = {
  white: {
    size: 175,
    position: [-18, -20]
  },
  gold: {
    size: 175,
    position: [-12, -62]
  },
  ivory: {
    size: 175,
    position: [-53, -18]
  },
  silver: {
    size: 175,
    position: [-53, -62]
  },
  metal: {
    size: 135,
    position: [-101, -16]
  },
  neon: {
    size: 175,
    position: [-96, -20]
  },
  'gold-deco': {
    size: 175,
    position: [-99, -62]
  },
  'silver-deco': {
    size: 175,
    position: [-131, -62]
  }
};

export const filterColorImagesInfoLarge = {
  white: {
    size: 203,
    position: [-15, -22]
  },
  gold: {
    size: 203,
    position: [-15, -67]
  },
  ivory: {
    size: 203,
    position: [-59, -22]
  },
  silver: {
    size: 203,
    position: [-58, -68]
  },
  metal: {
    size: 203,
    position: [-150, -22]
  },
  neon: {
    size: 203,
    position: [-106, -22]
  },
  'gold-deco': {
    size: 203,
    position: [-105, -67]
  },
  'silver-deco': {
    size: 203,
    position: [-150, -67]
  }
};

export const idFilterIds = {
  auth: 5,
  new: 10,
  lowPrice: 30,
  legitAll: 100
};

export const idFilterOptions = [
  {
    id: idFilterIds.auth,
    name: '인증판매자'
  },
  {
    id: idFilterIds.new,
    name: '새상품급'
  },
  {
    id: idFilterIds.lowPrice,
    name: '시세이하'
  },
  {
    id: idFilterIds.legitAll,
    name: '감정완료',
    viewName: '감정완료-전체'
  },
  {
    id: 101,
    name: '감정가능',
    viewName: '감정가능'
  },
  {
    id: 102,
    name: '정품의견',
    viewName: '감정완료-정품의견'
  },
  {
    id: 103,
    name: '가품의심',
    viewName: '감정완료-가품의심'
  }
];

export const defaultIdFilterOptionIds = [5, 10];

export const legitIdFilterOptionIds = [100, 101, 102, 103];

export const mapFilterOptions = [
  {
    index: 1,
    name: '20분',
    distance: 2,
    viewName: '2km'
  },
  {
    index: 2,
    name: '3정거장',
    distance: 6,
    viewName: '6km'
  },
  {
    index: 3,
    name: '10분',
    distance: 10,
    viewName: '10km'
  },
  {
    index: 4,
    name: '30분',
    distance: 20,
    viewName: '20km'
  },
  {
    index: 5,
    name: '모든 위치',
    distance: 0,
    viewName: '모든 위치'
  }
];

export const orderFilterOptions: { name: string; order: ProductOrder; viewName: string }[] = [
  {
    name: '추천순',
    order: 'recommDesc',
    viewName: '추천순'
  },
  {
    name: '최신순-신규등록',
    order: 'postedDesc',
    viewName: '최신순'
  },
  {
    name: '최신순-끌올포함',
    order: 'postedAllDesc',
    viewName: '최신순(끌올포함)'
  },
  {
    name: '최저가순',
    order: 'priceAsc',
    viewName: '최저가순'
  },
  {
    name: '높은가격순',
    order: 'priceDesc',
    viewName: '높은가격순'
  }
];

export const myFilterRelatedParentCategoryIds = {
  97: {
    genders: {
      M: [97, 119, 283],
      F: [97, 119, 282, 283],
      N: [97, 119, 283]
    }
  },
  104: {
    genders: {
      M: [104, 283],
      F: [104, 282],
      N: [104, 283]
    }
  },
  14: {
    genders: {
      M: [14],
      F: [14],
      N: [14]
    }
  }
};

export const camelSellerfilterColorImagePositions = {
  white: [-21, -18],
  gold: [-11, -62],
  ivory: [-53, -18],
  silver: [-53, -62],
  metal: [-101, -16],
  neon: [-99, -20],
  'gold-deco': [-99, -62],
  'silver-deco': [-131, -62]
};

export const camelSellerfilterColorImagesInfo = {
  white: {
    size: 175,
    position: [-19, -27]
  },
  gold: {
    size: 175,
    position: [-19, -87]
  },
  ivory: {
    size: 175,
    position: [-77, -27]
  },
  silver: {
    size: 175,
    position: [-76, -86]
  },
  metal: {
    size: 175,
    position: [-196, -28]
  },
  neon: {
    size: 175,
    position: [-138, -28]
  },
  'gold-deco': {
    size: 175,
    position: [-138, -88]
  },
  'silver-deco': {
    size: 175,
    position: [-196, -87]
  }
};

export const generalFilterOptions = {
  brands: [
    { codeId: filterCodeIds.map, name: '내주변' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.gender, name: '성별' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ],
  categories: [
    { codeId: filterCodeIds.map, name: '내주변' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.brand, name: '브랜드' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ],
  search: [
    { codeId: filterCodeIds.map, name: '내주변' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.brand, name: '브랜드' },
    { codeId: filterCodeIds.category, name: '카테고리' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ],
  camel: [
    { codeId: filterCodeIds.map, name: '내주변' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.brand, name: '브랜드' },
    { codeId: filterCodeIds.category, name: '카테고리' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ]
};

export const filterCodes = {
  brands: generalFilterOptions.brands.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id].includes(codeId)
  ),
  categories: generalFilterOptions.categories.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id].includes(codeId)
  ),
  search: generalFilterOptions.search.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id].includes(codeId)
  ),
  camel: generalFilterOptions.camel.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id].includes(codeId)
  )
};

export const productDynamicOptionCodeType: Record<
  'line' | 'size' | 'price' | 'color' | 'brand' | 'category',
  ProductDynamicOptionCodeType
> = {
  line: 0,
  size: 1,
  price: 2,
  color: 3,
  brand: 4,
  category: 5
};

export const productFilterEventPropertyTitle = {
  [filterCodeIds.category]: attrProperty.title.category,
  [filterCodeIds.brand]: attrProperty.title.brand,
  [filterCodeIds.size]: attrProperty.title.size,
  [filterCodeIds.platform]: attrProperty.title.site,
  [filterCodeIds.line]: attrProperty.title.line,
  [filterCodeIds.season]: attrProperty.title.season,
  [filterCodeIds.color]: attrProperty.title.colorMaterial,
  [filterCodeIds.price]: attrProperty.title.price,
  [filterCodeIds.detailOption]: attrProperty.title.colorMaterial,
  [filterCodeIds.gender]: attrProperty.title.gender
};

export const productEventPropertyOrder = {
  postedDesc: 'RECENT',
  postedAllDesc: 'RECENT_ALL',
  priceDesc: 'HIGHP',
  priceAsc: 'LOWP',
  recommDesc: 'RECOMM'
};

export const productDynamicFilterEventPropertyTitle = {
  0: attrProperty.title.line,
  1: attrProperty.title.size,
  2: attrProperty.title.price,
  3: attrProperty.title.color,
  4: attrProperty.title.brand,
  5: attrProperty.title.category
};
