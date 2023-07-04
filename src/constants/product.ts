export const PLATFORMS = {
  comprehensive: [
    { name: '중고나라', filename: '11.png', importance: true },
    { name: '당근마켓', filename: '3.png', importance: true },
    { name: '번개장터', filename: '2.png', importance: true },
    { name: '헬로마켓', filename: '4.png', importance: false },
    { name: '필웨이', filename: '7.png', importance: false },
    { name: '보나파이드', filename: '12.png', importance: false }
  ],
  shoes: [
    { name: '나이키매니아', filename: '6.png', importance: true },
    { name: '크림', filename: '16.png', importance: false }
  ],
  womanBag: [
    { name: '시크먼트', filename: '14.png', importance: false },
    { name: '트렌비', filename: '17.png', importance: false },
    { name: '구구스', filename: '8.png', importance: false }
  ]
};

export const PRODUCT_STATES = {
  comprehensive: ['새상품급', '풀구성', '상태S', '극미', '미사용'],
  shoes: ['새상품급', '풀구성', '풀박', '민트급', '상태S', '극미', '미시착', '미착용'],
  womanBag: ['새상품급', '풀구성', '풀박', '민트급', '상태S', '미사용']
};

export const PRODUCT_DEAL_INFO = {
  comprehensive: [
    { name: '구찌 반지갑', price: 18 },
    { name: '스톤 맨투맨', price: 12 },
    { name: '덩크 범고래', price: 28 },
    { name: '아크네 맨투맨', price: 11 },
    { name: '톰브 가디건', price: 20 },
    { name: '키츠네 가디건', price: 13 },
    { name: '아미 니트', price: 20 },
    { name: '이지 브레드', price: 20 },
    { name: '나이키 피마원', price: 42 },
    { name: '꼼데 가디건', price: 6 },
    { name: '키츠네 반팔', price: 4 },
    { name: '톰브 맨투맨', price: 22 },
    { name: '무스너클 버니', price: 15 },
    { name: '맥케이지 딕슨', price: 55 },
    { name: '조던1 다크모카', price: 37 },
    { name: '아미 반팔티', price: 6 },
    { name: '서브마리너', price: 1300 },
    { name: '까레라', price: 360 },
    { name: '데이저스트', price: 1090 },
    { name: '아이패드 에어3', price: 38 },
    { name: '애플워치6', price: 60 },
    { name: '샤넬 반지갑', price: 72 },
    { name: '에어팟 프로', price: 20 }
  ],
  shoes: [
    { name: '조던 다크모카', price: 35 },
    { name: 'WD 와플', price: 55 },
    { name: '뉴발 992', price: 12 },
    { name: '덩크 범고래', price: 30 },
    { name: '스캇 프라그먼트', price: 135 },
    { name: '파라노이즈', price: 43 },
    { name: '포그 그레이', price: 27 },
    { name: '이지 벨루가', price: 63 },
    { name: '골구 실버탭', price: 28 },
    { name: '뉴발 993', price: 23 },
    { name: '이지 믹스오트', price: 27 }
  ],
  womanBag: [
    { name: '샤넬 클미', price: 800 },
    { name: '루이비통 포쉐트', price: 200 },
    { name: '루이비통 스피디', price: 168 },
    { name: '샤넬 코코핸들', price: 410 },
    { name: '루이비통 쁘띠삭', price: 168 },
    { name: '샤넬 보이백', price: 489 },
    { name: '샤넬 클러치', price: 100 },
    { name: '가브리엘 호보', price: 430 },
    { name: '구찌 마틀라세', price: 135 }
  ]
};

export const PRODUCT_SITE = {
  NCAFE: { id: 1, name: '카페(네이버)' },
  BUNJANG: { id: 2, name: '번개장터' },
  DAANGN: { id: 3, name: '당근마켓' },
  HELLO: { id: 4, name: '헬로마켓' },
  NSHOPPING: { id: 5, name: '쇼핑(네이버)' },
  NIKEMANIA: { id: 6, name: '나이키매니아' },
  FEELWAY: { id: 7, name: '필웨이' },
  GUGUS: { id: 8, name: '구구스' },
  SGKO: { id: 9, name: '슈겜코' },
  KOIBITO: { id: 10, name: '고이비토' },
  JOONGNA: { id: 11, name: '중고나라' },
  BONAFIDE: { id: 12, name: '보나파이드' },
  KRRT: { id: 13, name: 'KRTT' },
  CHICMENT: { id: 14, name: '시크먼트' },
  KOODON: { id: 15, name: '쿠돈' },
  KREAM: { id: 16, name: '크림' },
  TRENBE: { id: 17, name: '트렌비' },
  XXBLUE: { id: 18, name: 'XXBLUE' },
  KANGKAS: { id: 19, name: '캉카스' },
  REEBONZ: { id: 20, name: '리본즈' },
  FROG: { id: 21, name: '프로그' },
  FRUITSFAMILY: { id: 22, name: '후루츠패밀리' },
  DIESELMANIA: { id: 23, name: '디젤매니아' },
  CAMEL: { id: 24, name: '카멜' },
  CAMELSELLER: { id: 34, name: '카멜판매자' },
  MJOONGNA: { id: 25, name: '중나앱' },
  CAMELNCAFE: { id: 26, name: '카멜-N카페' },
  CAMELNBLOG: { id: 27, name: '카멜-N블로그' },
  COLLECTIV: { id: 28, name: '콜렉티브' },
  MUSTIT: { id: 166, name: '머스트잇' }
};

export const PRODUCT_SITE_NAVER = Object.entries(PRODUCT_SITE)
  .filter(([key]) =>
    ['NCAFE', 'NSHOPPING', 'NIKEMANIA', 'JOONGNA', 'BONAFIDE', 'KRRT', 'CHICMENT'].includes(key)
  )
  .map(([_, { id }]) => id);

export const ID_FILTER = 12;
export const DISTANCE = 13;

export const LABELS = {
  [ID_FILTER]: [
    { name: '5', description: '카멜인증' },
    { name: '10', description: '새상품급' },
    { name: '20', description: '신용판매자' },
    { name: '30', description: '시세이하' },
    { name: '40', description: '풀구성' },
    { name: '50', description: '정품 중고 사이트' },
    { name: '60', description: '구매처 기재' },
    { name: '70', description: '직거래' },
    { name: '80', description: '영수증 인보이스 보유' },
    { name: '90', description: '안전' }
  ],
  [DISTANCE]: [
    { name: '2', description: '20분' },
    { name: '6', description: '3정거장' },
    { name: '10', description: '10분' },
    { name: '20', description: '30분' },
    { name: '0', description: '모든위치' }
  ]
};

// 제거 대상 productStatusCode 로 대체 예정
export const PRODUCT_STATUS = {
  0: '진열',
  1: '미진열',
  2: '중복글',
  3: '삭제글',
  4: '예약',
  // 5: '가격하락',
  // 6: '지난글',
  // 7: '감정중',
  8: '숨김'
};

export const VIEW_PRODUCT_STATUS = {
  0: '판매중',
  1: '판매완료',
  2: '판매완료',
  3: '판매완료',
  4: '예약중',
  7: '판매중',
  8: '숨김',
  20: '등록 대기',
  21: '갱신 대기'
};

type ProductStatusCodeProps = {
  forSale: 0;
  soldOut: 1;
  duplicate: 2;
  deleted: 3;
  reservation: 4;
  underPrice: 5;
  oldProductSixMonth: 6;
  hidden: 8;
};

export const productStatusCode: ProductStatusCodeProps = {
  forSale: 0,
  soldOut: 1,
  duplicate: 2,
  deleted: 3,
  reservation: 4,
  underPrice: 5,
  oldProductSixMonth: 6,
  hidden: 8
};

export const REPORT_TYPE_FAKE_PRODUCT = 1;
export const REPORT_TYPE_COUNTERFEITER = 2;
export const REPORT_TYPE_FAKE = 3;
export const REPORT_TYPE_SWINDLER = 4;
export const REPORT_TYPE_ETC = 5;
export const REPORT_TYPE_PRICE = 6;

export const INITIAL_REPORT_OPTIONS = {
  [REPORT_TYPE_FAKE_PRODUCT]: {
    label: '가품 같아요',
    type: REPORT_TYPE_FAKE_PRODUCT,
    checked: false,
    reported: false,
    count: 0
  },
  [REPORT_TYPE_COUNTERFEITER]: {
    label: '전문 가품업자 같아요',
    type: REPORT_TYPE_COUNTERFEITER,
    checked: false,
    reported: false,
    count: 0
  },
  [REPORT_TYPE_SWINDLER]: {
    label: '사기꾼 같아요',
    type: REPORT_TYPE_SWINDLER,
    checked: false,
    reported: false,
    count: 0
  },
  [REPORT_TYPE_PRICE]: {
    label: '가격이 이상해요',
    type: REPORT_TYPE_PRICE,
    checked: false,
    reported: false,
    count: 0
  }
};

export const REPORT_STATUS = {
  0: '정상리뷰',
  1: '리뷰신고',
  2: '판매자차단'
};

export const PRODUCT_SOURCE = {
  PRODUCT_LIST: 'PRODUCT_LIST',
  PRODUCT_RELATED_LIST: 'PRODUCT_RELATED_LIST',
  LIST_RELATED: 'LIST_RELATED',
  MAIN_WISH: 'MAIN_WISH',
  MAIN_PERSONAL: 'MAIN_PERSONAL',
  MAIN_CAMEL: 'MAIN_CAMEL',
  MAIN_AI_RECOMM: 'MAIN_AI_RECOMM',
  DIRECT: 'DIRECT',
  WISH_LIST: 'WISH_LIST',
  RECENT_LIST: 'RECENT_LIST',
  SELLER_PRODUCT: 'SELLER_PRODUCT',
  HONEYNOTI_LIST: 'HONEYNOTI_LIST',
  API: 'API'
};

export const productInfoLabels = ['카멜인증', '새상품급', '시세이하'];

export const PROMOTION_ATT = {
  PRICE: 'PRICE',
  LEGIT: 'LEGIT',
  INFO: 'INFO',
  UPDATE: 'UPDATE',
  LEGIT_EDIT: 'LEGIT_EDIT',
  LEGIT_SAVED: 'LEGIT_SAVED'
};
