import { InvalidReason } from '@dto/user';

export const GENDER = {
  male: '남성',
  female: '여성'
};
export const GENDER_BY_VALUE = {
  M: 'male',
  F: 'female',
  W: 'female'
};

export const SELLER_STATUS = {
  0: '진열',
  1: '미진열',
  2: '신용판매자',
  3: '카멜판매자',
  4: '일반판매자'
};

export const USER_DEFAULT_SIZE = {
  female: {
    tops: [
      { categorySizeId: 12, viewSize: 'XS' },
      { categorySizeId: 13, viewSize: 'S' },
      { categorySizeId: 14, viewSize: 'M' },
      { categorySizeId: 15, viewSize: 'L' },
      { categorySizeId: 16, viewSize: 'XL' },
      { categorySizeId: 17, viewSize: 'XXL' }
    ],
    bottoms: [
      { categorySizeId: 457, viewSize: '26' },
      { categorySizeId: 458, viewSize: '27' },
      { categorySizeId: 348, viewSize: '28' },
      { categorySizeId: 349, viewSize: '29' },
      { categorySizeId: 350, viewSize: '30' },
      { categorySizeId: 351, viewSize: '31' },
      { categorySizeId: 352, viewSize: '32' },
      { categorySizeId: 354, viewSize: '34' },
      { categorySizeId: 356, viewSize: '36' }
    ],
    shoes: [
      { categorySizeId: 88, viewSize: '225' },
      { categorySizeId: 89, viewSize: '230' },
      { categorySizeId: 90, viewSize: '235' },
      { categorySizeId: 91, viewSize: '240' },
      { categorySizeId: 92, viewSize: '245' },
      { categorySizeId: 93, viewSize: '250' },
      { categorySizeId: 94, viewSize: '255' },
      { categorySizeId: 95, viewSize: '260' },
      { categorySizeId: 96, viewSize: '265' }
    ]
  },
  male: {
    tops: [
      { categorySizeId: 12, viewSize: 'XS' },
      { categorySizeId: 13, viewSize: 'S' },
      { categorySizeId: 14, viewSize: 'M' },
      { categorySizeId: 15, viewSize: 'L' },
      { categorySizeId: 16, viewSize: 'XL' },
      { categorySizeId: 17, viewSize: 'XXL' }
    ],
    bottoms: [
      { categorySizeId: 349, viewSize: '29' },
      { categorySizeId: 350, viewSize: '30' },
      { categorySizeId: 351, viewSize: '31' },
      { categorySizeId: 352, viewSize: '32' },
      { categorySizeId: 354, viewSize: '34' },
      { categorySizeId: 356, viewSize: '36' },
      { categorySizeId: 784, viewSize: '38' }
    ],
    shoes: [
      { categorySizeId: 94, viewSize: '255' },
      { categorySizeId: 95, viewSize: '260' },
      { categorySizeId: 96, viewSize: '265' },
      { categorySizeId: 97, viewSize: '270' },
      { categorySizeId: 98, viewSize: '275' },
      { categorySizeId: 99, viewSize: '280' },
      { categorySizeId: 100, viewSize: '285' },
      { categorySizeId: 101, viewSize: '290' },
      { categorySizeId: 102, viewSize: '295' }
    ]
  }
};

// bottom 104 shoes 14 top 97 아우터 119 원피스 282 기타의류 283
export const ALL_CLOTHING_IDS = [97, 104, 14, 119, 282, 283];

export const viewClothingIdsData = {
  top: [119, 97, 283],
  bottom: [104, 282, 283],
  shoes: [14]
};

export const userReportType = {
  10: '거래/환불 분쟁이 있어요',
  20: '사기/가품이에요',
  30: '비매너/욕설 사용자에요',
  40: '성희롱 사용자에요',
  50: '기타'
};

export const userReportTypeAtt = {
  10: 'TRADE_DISPUTE',
  20: 'FRAUD',
  30: 'BAD_MANNER',
  40: 'SEXUAL_PROBLEM',
  50: 'OTHER'
};

export const channelUserType = {
  0: '구매자',
  1: '판매자'
} as const;
type channelUserType = (typeof channelUserType)[keyof typeof channelUserType];

export const PROFILE_EDIT_ERROR_MESSAGE: Record<
  Exclude<InvalidReason['type'], 'DUPLICATE'>,
  string
> = {
  BAN: '욕설 및 비속어는 사용할 수 없어요!',
  ADMIN: '관리자로 오해할 수 있는 단어는 쓸 수 없어요.'
};

// 2301 신규로 추가 및 정리된 타입 항목
export const productSellerType = {
  collection: 0,
  normal: 1,
  certification: 2,
  legit: 3
};
