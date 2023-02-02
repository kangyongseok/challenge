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
  detailOption: 102,
  my: 103
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
  white: '#FFFFFF',
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

export const filterImageColorNames = [
  'gold',
  'ivory',
  'silver',
  'metal',
  'neon',
  'gold-deco',
  'silver-deco',
  'transparent',
  'pattern',
  'multicolor'
];

export const needReverseCheckFilterColorNames = [
  'ivory',
  'white',
  'transparent',
  'pattern',
  'EMPTY'
];

export const idFilterIds = {
  auth: 5,
  new: 10,
  lowPrice: 30,
  quickSale: 31,
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
    id: idFilterIds.quickSale,
    name: '급처분 매물'
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

export const defaultIdFilterOptionIds = [5, 10, 31];

export const legitIdFilterOptionIds = [100, 101, 102, 103];

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

export const generalFilterOptions = {
  brands: [
    { codeId: filterCodeIds.map, name: '내 주변' },
    { codeId: filterCodeIds.my, name: '내 사이즈' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.gender, name: '성별' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.color, name: '색상' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ],
  categories: [
    { codeId: filterCodeIds.map, name: '내 주변' },
    { codeId: filterCodeIds.my, name: '내 사이즈' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.brand, name: '브랜드' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.color, name: '색상' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ],
  search: [
    { codeId: filterCodeIds.map, name: '내 주변' },
    { codeId: filterCodeIds.my, name: '내 사이즈' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.brand, name: '브랜드' },
    { codeId: filterCodeIds.category, name: '카테고리' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.color, name: '색상' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ],
  camel: [
    { codeId: filterCodeIds.map, name: '내 주변' },
    { codeId: filterCodeIds.my, name: '내 사이즈' },
    { codeId: filterCodeIds.id, id: idFilterIds.lowPrice, name: '시세이하' },
    { codeId: filterCodeIds.size, name: '사이즈' },
    { codeId: filterCodeIds.price, name: '가격' },
    { codeId: filterCodeIds.brand, name: '브랜드' },
    { codeId: filterCodeIds.category, name: '카테고리' },
    { codeId: filterCodeIds.line, name: '라인' },
    { codeId: filterCodeIds.color, name: '색상' },
    { codeId: filterCodeIds.platform, name: '플랫폼' },
    { codeId: filterCodeIds.detailOption, name: '상세옵션' }
  ]
};

export const filterCodes = {
  brands: generalFilterOptions.brands.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id, filterCodeIds.my].includes(codeId)
  ),
  categories: generalFilterOptions.categories.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id, filterCodeIds.my].includes(codeId)
  ),
  search: generalFilterOptions.search.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id, filterCodeIds.my].includes(codeId)
  ),
  camel: generalFilterOptions.camel.filter(
    ({ codeId }) => ![filterCodeIds.map, filterCodeIds.id, filterCodeIds.my].includes(codeId)
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
  [filterCodeIds.color]: attrProperty.title.color,
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
