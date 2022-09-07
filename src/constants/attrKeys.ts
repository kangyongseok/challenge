const sendLogApiEvent = ['CLICK_SEND_MESSAGE', 'CLICK_PURCHASE'];

const appsFlyerEvent = {
  LOAD_LOGIN_SNS: 'LOAD_LOGIN_SNS',
  SUBMIT_SEARCH: 'SUBMIT_SEARCH',
  VIEW_PRODUCT_LIST: 'VIEW_PRODUCT_LIST',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  CLICK_PURCHASE: 'CLICK_PURCHASE',
  CLICK_WISH: 'CLICK_WISH'
};

const naverEvent = {
  CLICK_PURCHASE: 'CLICK_PURCHASE',
  CLICK_WISH: 'CLICK_WISH',
  VIEW_PRODUCT_LIST: 'VIEW_PRODUCT_LIST',
  VIEW_PRODUCT_DETAIL: 'VIEW_PRODUCT_DETAIL',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL'
};

const commonEvent = {
  viewAll: 'VIEW_ALL',
  viewMain: 'VIEW_MAIN',
  viewSearchModal: 'VIEW_SEARCH_MODAL',
  viewProductList: 'VIEW_PRODUCT_LIST',
  viewWishList: 'VIEW_WISH_LIST',
  clickWish: 'CLICK_WISH',
  clickWishCancel: 'CLICK_WISH_CANCEL',
  clickTabSearch: 'CLICK_TAB_SEARCH',
  clickLoginSns: 'CLICK_LOGIN_SNS',
  loadLoginSns: 'LOAD_LOGIN_SNS',
  selectItem: 'SELECT_ITEM',
  clickNextStep1: 'CLICK_NEXT_STEP1',
  clickNextStep2: 'CLICK_NEXT_STEP2',
  selectMarketingPopup: 'SELECT_MARKETING_POPUP',
  clickSearchmodal: 'CLICK_SEARCHMODAL',
  clickRecent: 'CLICK_RECENT',
  clickProductDetail: 'CLICK_PRODUCT_DETAIL',
  clickPersonalTag: 'CLICK_PERSONAL_TAG',
  clickPersonalMore: 'CLICK_PERSONAL_MORE',
  clickRecommtag: 'CLICK_RECOMMTAG',
  clickPopc: 'CLICK_POPC',
  clickRank: 'CLICK_RANK',
  clickAuto: 'CLICK_AUTO',
  clickRanktag: 'CLICK_RANKTAG',
  submitSearch: 'SUBMIT_SEARCH',
  clickAiOn: 'CLICK_AI_ON',
  clickReport: 'CLICK_REPORT',
  clickReportsubmit: 'CLICK_REPORTSUBMIT',
  clickPurchase: 'CLICK_PURCHASE',
  clickPersonalinput: 'CLICK_PERSONALINPUT',
  cluckPushOn: 'CLICK_PUSH_ON',
  cluckPushOff: 'CLICK_PUSH_OFF',
  selectLogout: 'SELECT_LOGOUT',
  selectWithdraw: 'SELECT_WITHDRAW',
  clickLogin: 'CLICK_LOGIN',
  clickKeywordRequest: 'CLICK_KEYWORD_REQUEST',
  scriptError: 'SCRIPT_ERROR',
  requestError: 'REQUEST_ERROR',
  clickHoneynoti: 'CLICK_HONEYNOTI',
  viewHoneynotiSearch: 'VIEW_HONEYNOTI_SEARCH',
  viewHot: 'VIEW_HOT',
  clickTabHot: 'CLICK_TAB_HOT',
  clickTabCategory: 'CLICK_TAB_CATEGORY',
  viewHoneynotiList: 'VIEW_HONEYNOTI_LIST',
  viewBehaviorList: 'VIEW_BEHAVIOR_LIST',
  viewHoneynotiManage: 'VIEW_HONEYNOTI_MANAGE',
  viewHoneynotiFilter: 'VIEW_HONEYNOTI_FILTER',
  viewCategory: 'VIEW_CATEGORY',
  clickCategory: 'CLICK_CATEGORY',
  clickApplyIdfilter: 'CLICK_APPLY_IDFILTER',
  clickBehaviorList: 'CLICK_BEHAVIOR_LIST',
  clickHoneynotiManage: 'CLICK_HONEYNOTI_MANAGE',
  clickNightAlarm: 'CLICK_NIGHT_ALARM',
  clickPersonalAll: 'CLICK_PERSONAL_ALL',
  clickPersonalInput: 'CLICK_PERSONAL_INPUT',
  clickPersonalNext: 'CLICK_PERSONAL_NEXT',
  clickTabMain: 'CLICK_TAB_MAIN',
  clickTabMy: 'CLICK_TAB_MY',
  clickTabWish: 'CLICK_TAB_WISH',
  loadPersonalList: 'LOAD_PERSONAL_LIST',
  selectIdFilter: 'SELECT_ID_FILTER',
  selectMapFilter: 'SELECT_MAP_FILTER',
  submitPersonalInput: 'SUBMIT_PERSONAL_INPUT',
  submitSurvey: 'SUBMIT_SURVEY',
  viewFilter: 'VIEW_FILTER',
  viewHoneynoti: 'VIEW_HONEINOTI_FILTER',
  viewIdFilter: 'VIEW_ID_FILTER',
  viewMapFilter: 'VIEW_MAP_FILTER',
  viewPersonalInput: 'VIEW_PERSONAL_INPUT',
  viewProductDetail: 'VIEW_PRODUCT_DETAIL',
  viewRecentList: 'VIEW_RECENT_LIST',
  viewSurvey: 'VIEW_SURVEY',
  viewWelcom: 'VIEW_WELCOME',
  viewAnnounceDetail: 'VIEW_ANNOUNCE_DETAIL',
  clickClose: 'CLICK_CLOSE',
  clickBack: 'CLICK_BACK',
  viewHotproductTooltip: 'VIEW_HOTPRODUCT_TOOLTIP',
  clickLegitBanner: 'CLICK_LEGIT_BANNER',
  clickLegitModal: 'CLICK_LEGIT_MODAL',
  viewLegitInfo: 'VIEW_LEGIT_INFO',
  viewLegitSurvey: 'VIEW_LEGIT_SURVEY',
  submitLegitSurvey: 'SUBMIT_LEGIT_SURVEY',
  clickMylistFloating: 'CLICK_MYLIST_FLOATING',
  clickMylistAuto: 'CLICK_MYLIST_AUTO',
  viewCrazyWeek: 'VIEW_CRAZYWEEK'
};

const login = {
  LOAD_LOGIN_SNS: 'LOAD_LOGIN_SNS',
  CLICK_LOGIN_SNS: 'CLICK_LOGIN_SNS',
  CLICK_NONLOGIN: 'CLICK_NONLOGIN',
  VIEW_LOGIN: 'VIEW_LOGIN',
  SUBMIT_LOGIN_SNS: 'SUBMIT_LOGIN_SNS',
  CLICK_TAB: 'CLICK_TAB',
  CLICK_RECENT: 'CLICK_RECENT'
};

const brand = {
  VIEW_BRAND_LIST: 'VIEW_BRAND_LIST',
  CLICK_BRAND_SEARCH: 'CLICK_BRAND_SEARCH',
  CLICK_AUTO: 'CLICK_AUTO',
  CLICK_BRAND_NAME: 'CLICK_BRAND_NAME',
  CLICK_NAVIGATION_LETTER: 'CLICK_NAVIGATION_LETTER'
};

const search = {
  VIEW_SEARCH_MODAL: 'VIEW_SEARCH_MODAL',
  CLICK_BACK: 'CLICK_BACK',
  CLICK_RECOMMTAG: 'CLICK_RECOMMTAG',
  CLICK_KEYWORD_INPUT: 'CLICK_KEYWORD_INPUT',
  CLICK_SCOPE: 'CLICK_SCOPE',
  CLICK_RECENT_DELETE: 'CLICK_RECENT_DELETE',
  CLICK_RECENT: 'CLICK_RECENT',
  CLICK_BANNERB: 'CLICK_BANNERB',
  CLICK_AUTO: 'CLICK_AUTO',
  SUBMIT_SEARCH: 'SUBMIT_SEARCH',
  LOAD_KEYWORD_AUTO: 'LOAD_KEYWORD_AUTO',
  NOT_KEYWORD: 'NOT_KEYWORD',
  CLICK_MAIN_BUTTON: 'CLICK_MAIN_BUTTON',
  LOAD_MYLIST: 'LOAD_MYLIST',
  VIEW_RECOMMFILTER: 'VIEW_RECOMMFILTER',
  CLICK_RECOMMFILTER: 'CLICK_RECOMMFILTER'
};

const userInput = {
  VIEW_PERSONAL_INPUT: 'VIEW_PERSONAL_INPUT',
  SELECT_ITEM: 'SELECT_ITEM',
  SUBMIT_PERSONAL_INPUT: 'SUBMIT_PERSONAL_INPUT',
  CLICK_PERSONAL_INPUT: 'CLICK_PERSONAL_INPUT',
  CLICK_BACK: 'CLICK_BACK',
  CLICK_VIEW_ALL: 'CLICK_VIEW_ALL',
  CLICK_BRAND_DELETE: 'CLICK_BRAND_DELETE',
  VIEW_ANNOUNCE_DETAIL: 'VIEW_ANNOUNCE_DETAIL'
};

const mypage = {
  VIEW_MY: 'VIEW_MY',
  SELECT_LOGOUT: 'SELECT_LOGOUT',
  SELECT_WITHDRAW: 'SELECT_WITHDRAW',
  CLICK_LOGOUT: 'CLICK_LOGOUT',
  CLICK_WITHDRAW: 'CLICK_WITHDRAW',
  CLICK_PUSH_ON: 'CLICK_PUSH_ON',
  CLICK_PUSH_OFF: 'CLICK_PUSH_OFF',
  CLICK_NIGHT_ALARM: 'CLICK_NIGHT_ALARM',
  CLICK_LOGIN: 'CLICK_LOGIN',
  CLICK_KAKAOCH: 'CLICK_KAKAOCH',
  CLICK_ANNOUNCE_DETAIL: 'CLICK_ANNOUNCE_DETAIL',
  CLICK_PERSONAL_INPUT: 'CLICK_PERSONAL_INPUT'
};

const header = {
  CLICK_LOGO: 'CLICK_LOGO',
  CLICK_BACK: 'CLICK_BACK',
  CLICK_SCOPE: 'CLICK_SCOPE',
  CLICK_SEARCHMODAL: 'CLICK_SEARCHMODAL',
  CLICK_CLOSE: 'CLICK_CLOSE'
};

const wishes = {
  VIEW_WISH_LIST: 'VIEW_WISH_LIST',
  CLICK_SORT: 'CLICK_SORT',
  CLICK_CATEGORY: 'CLICK_CATEGORY',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  CLICK_WISH_CANCEL: 'CLICK_WISH_CANCEL',
  VIEW_RECENT_LIST: 'VIEW_RECENT_LIST',
  CLICK_SEARCHMODAL: 'CLICK_SEARCHMODAL',
  SELECT_SORT: 'SELECT_SORT',
  CLICK_LOGIN: 'CLICK_LOGIN',
  CLICK_RECENT: 'CLICK_RECENT',
  VIEW_HOTPRODUCT_TOOLTIP: 'VIEW_HOTPRODUCT_TOOLTIP',
  VIEW_PRODUCT_DETAIL_TOOLTIP: 'VIEW_PRODUCT_DETAIL_TOOLTIP',
  VIEW_WISHLEGIT: 'VIEW_WISHLEGIT',
  CLICK_WISHLEGIT: 'CLICK_WISHLEGIT',
  CLICK_WISHLEGIT_TAB: 'CLICK_WISHLEGIT_TAB',
  CLICK_WISHLEGIT_POPUP: 'CLICK_WISHLEGIT_POPUP'
};

const noti = {
  VIEW_BEHAVIOR_LIST: 'VIEW_BEHAVIOR_LIST',
  CLICK_BEHAVIOR: 'CLICK_BEHAVIOR',
  VIEW_HONEYNOTI_LIST: 'VIEW_HONEYNOTI_LIST',
  CLICK_HONEYNOTI_MANAGE: 'CLICK_HONEYNOTI_MANAGE',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL'
};

const sellerInfo = {
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  VIEW_SELLER_PRODUCT: 'VIEW_SELLER_PRODUCT',
  VIEW_SELLER_REVIEW: 'VIEW_SELLER_REVIEW',
  LOAD_MOREAUTO: 'LOAD_MOREAUTO',
  CLICK_SELLER_PRODUCT: 'CLICK_SELLER_PRODUCT',
  CLICK_SELLER_REVIEW: 'CLICK_SELLER_REVIEW'
};

const productsKeyword = {
  CLICK_PRODUCT_LIST: 'CLICK_PRODUCT_LIST',
  CLICK_MYLIST: 'CLICK_MYLIST',
  CLICK_UNDO: 'CLICK_UNDO',
  VIEW_MYLIST: 'VIEW_MYLIST'
};

const category = {
  CLICK_CATEGORY_GENDER: 'CLICK_CATEGORY_GENDER',
  CLICK_CATEGORY: 'CLICK_CATEGORY',
  VIEW_CATEGORY: 'VIEW_CATEGORY',
  CLICK_BRAND_NAME: 'CLICK_BRAND_NAME',
  CLICK_BRAND_LIST: 'CLICK_BRAND_LIST'
};

const home = {
  VIEW_MAIN: 'VIEW_MAIN',
  VIEW_MAIN_PC: 'VIEW_MAIN_PC',
  CLICK_SEARCHMODAL: 'CLICK_SEARCHMODAL',
  CLICK_BEHAVIOR_LIST: 'CLICK_BEHAVIOR_LIST',
  CLICK_RECENT: 'CLICK_RECENT',
  CLICK_MAIN: 'CLICK_MAIN',
  CLICK_MAIN_BRAND: 'CLICK_MAIN_BRAND',
  CLICK_MAIN_CATEGORY: 'CLICK_MAIN_CATEGORY',
  VIEW_ALL: 'VIEW_ALL',
  CLICK_WISH_CANCEL: 'CLICK_WISH_CANCEL',
  CLICK_WISH: 'CLICK_WISH',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  CLICK_PRODUCT_LIST: 'CLICK_PRODUCT_LIST',
  SWIPE_X_TAG: 'SWIPE_X_TAG',
  SWIPE_X_BRAND: 'SWIPE_X_BRAND',
  CLICK_PERSONAL_ALL: 'CLICK_PERSONAL_ALL',
  VIEW_WISHPRICE_TOOLTIP: 'VIEW_WISHPRICE_TOOLTIP',
  CLICK_LEGIT_ROLLING: 'CLICK_LEGIT_ROLLING',
  CLICK_RECENT_BUTTON: 'CLICK_RECENT_BUTTON',
  CLICK_MYLIST_BUTTON: 'CLICK_MYLIST_BUTTON',
  VIEW_WISHPRODUCT: 'VIEW_WISHPRODUCT',
  VIEW_MYLIST: 'VIEW_MYLIST',
  LOAD_MYLIST: 'LOAD_MYLIST',
  SWIPE_X_BUTTON: 'SWIPE_X_BUTTON',
  SWIP_X_CARD: 'SWIP_X_CARD',
  CLICK_MAIN_BUTTON: 'CLICK_MAIN_BUTTON',
  VIEW_LEGITRESULT_TOOLTIP: 'VIEW_LEGITRESULT_TOOLTIP',
  CLICK_CLOSE: 'CLICK_CLOSE'
};

const products = {
  VIEW_PRODUCT_LIST: 'VIEW_PRODUCT_LIST',
  LOAD_PRODUCT_LIST: 'LOAD_PRODUCT_LIST',
  LOAD_MOREAUTO: 'LOAD_MOREAUTO',
  VIEW_FILTER: 'VIEW_FILTER',
  SWIPE_X_FILTER: 'SWIPE_X_FILTER',
  CLICK_APPLYFILTER: 'CLICK_APPLYFILTER',
  CLICK_RESETALL: 'CLICK_RESETALL',
  SELECT_FILTER: 'SELECT_FILTER',
  CLICK_FILTER_DELETE: 'CLICK_FILTER_DELETE',
  CLICK_FILTER: 'CLICK_FILTER',
  SELECT_FILTERTAB: 'SELECT_FILTERTAB',
  CLICK_APPLY_IDFILTER: 'CLICK_APPLY_IDFILTER',
  SELECT_ID_FILTER: 'SELECT_ID_FILTER',
  VIEW_MAP_FILTER: 'VIEW_MAP_FILTER',
  CLICK_PERSONAL_INPUT: 'CLICK_PERSONAL_INPUT',
  SELECT_MAP_FILTER: 'SELECT_MAP_FILTER',
  CLICK_SORT: 'CLICK_SORT',
  SELECT_SORT: 'SELECT_SORT',
  CLICK_BRAND_REQUEST: 'CLICK_BRAND_REQUEST',
  CLICK_KEYWORD_REQUEST: 'CLICK_KEYWORD_REQUEST',
  CLICK_LOGIN: 'CLICK_LOGIN',
  CLICK_APPLY_MAPFILTER: 'CLICK_APPLY_MAPFILTER',
  VIEW_MYFILTER_TOOLTIP: 'VIEW_MYFILTER_TOOLTIP',
  CLICK_MYFILTER: 'CLICK_MYFILTER',
  VIEW_MYLIST_MODAL: 'VIEW_MYLIST_MODAL',
  VIEW_MYLIST_POPUP: 'VIEW_MYLIST_POPUP',
  CLICK_MYLIST_MODAL: 'CLICK_MYLIST_MODAL',
  CLICK_MYLIST: 'CLICK_MYLIST',
  CLICK_BACK: 'CLICK_BACK',
  VIEW_MYLIST: 'VIEW_MYLIST',
  VIEW_MYFILTER: 'VIEW_MYFILTER',
  VIEW_RECOMMPRICE: 'VIEW_RECOMMPRICE',
  CLICK_RECOMMPRICE: 'CLICK_RECOMMPRICE',
  CLICK_BRAND_SEARCH: 'CLICK_BRAND_SEARCH',
  CLICK_UNDO: 'CLICK_UNDO',
  VIEW_PRODUCT_DETAIL: 'VIEW_PRODUCT_DETAIL',
  CLICK_PURCHASE: 'CLICK_PURCHASE',
  CLICK_SELLER_REVIEW: 'CLICK_SELLER_REVIEW',
  CLICK_SHARE: 'CLICK_SHARE',
  CLICK_REPORT: 'CLICK_REPORT',
  SELECT_REPORT: 'SELECT_REPORT',
  CLICK_REPORTSUBMIT: 'CLICK_REPORTSUBMIT',
  CLICK_SELLER_PRODUCT: 'CLICK_SELLER_PRODUCT',
  CLICK_RECENT: 'CLICK_RECENT',
  CLICK_PIC: 'CLICK_PIC',
  VIEW_PICGALLERY: 'VIEW_PICGALLERY',
  SWIPE_X_PIC: 'SWIPE_X_PIC',
  CLICK_PICGALLERY_CLOSE: 'CLICK_PICGALLERY_CLOSE',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  CLICK_EXPAND: 'CLICK_EXPAND',
  CLICK_WISH: 'CLICK_WISH',
  CLICK_WISH_CANCEL: 'CLICK_WISH_CANCEL',
  CLICK_WISHMOAL_CLOSE: 'CLICK_WISHMOAL_CLOSE',
  VIEW_WISH_MODAL: 'VIEW_WISH_MODAL',
  CLICK_SEARCHMODAL: 'CLICK_SEARCHMODAL',
  CLICK_WISH_LIST: 'CLICK_WISH_LIST',
  SELLER_PRODUCT: 'SELLER_PRODUCT',
  SWIP_X_CARD: 'SWIP_X_CARD',
  VIEW_PRODUCT_DETAIL_TOAST: 'VIEW_PRODUCT_DETAIL_TOAST',
  VIEW_PURCHASE_TOOLTIP: 'VIEW_PURCHASE_TOOLTIP',
  VIEW_WISHPRICE_TOOLTIP: 'VIEW_WISHPRICE_TOOLTIP',
  CLICK_CLOSE: 'CLICK_CLOSE',
  VIEW_APPREVIEW_PROMPT: 'VIEW_APPREVIEW_PROMPT',
  CLICK_MYLIST_FLOATING: 'CLICK_MYLIST_FLOATING',
  CLICK_MYLIST_AUTO: 'CLICK_MYLIST_AUTO',
  CLICK_LEGIT_FILTER: 'CLICK_LEGIT_FILTER',
  SELECT_LEGIT_FILTER: 'SELECT_LEGIT_FILTER',
  CLICK_SEND_MESSAGE: 'CLICK_SEND_MESSAGE'
};

const welcome = {
  VIEW_WELCOME: 'VIEW_WELCOME',
  CLICK_PERSONAL_INPUT: 'CLICK_PERSONAL_INPUT',
  VIEW_PERSONAL_INPUT: 'VIEW_PERSONAL_INPUT',
  SELECT_ITEM: 'SELECT_ITEM',
  SUBMIT_PERSONAL_INPUT: 'SUBMIT_PERSONAL_INPUT'
};

const searchHelper = {
  VIEW_SEARCHHELPER: 'VIEW_SEARCHHELPER',
  CLICK_SEARCHHELPER: 'CLICK_SEARCHHELPER',
  SELECT_SEARCHHELPER: 'SELECT_SEARCHHELPER',
  SUBMIT_SEARCHHELPER: 'SUBMIT_SEARCHHELPER',
  SELECT_ITEM: 'SELECT_ITEM',
  SELECT_OPTIONTAB: 'SELECT_OPTIONTAB',
  VIEW_SEARCHHELPER_POPUP: 'VIEW_SEARCHHELPER_POPUP',
  CLICK_SEARCHHELPER_POPUP: 'CLICK_SEARCHHELPER_POPUP',
  VIEW_LOGIN_POPUP: 'VIEW_LOGIN_POPUP',
  CLICK_LOGIN_POPUP: 'CLICK_LOGIN_POPUP',
  VIEW_SEARCHHELPER_STEP1: 'VIEW_SEARCHHELPER_STEP1',
  VIEW_SEARCHHELPER_STEP2: 'VIEW_SEARCHHELPER_STEP2',
  LOAD_MYLIST_SAVE: 'LOAD_MYLIST_SAVE'
};

const myPortfolio = {
  CLICK_MYPORTFOLIO_BANNER: 'CLICK_MYPORTFOLIO_BANNER',
  VIEW_MYPORTFOLIO: 'VIEW_MYPORTFOLIO',
  CLICK_RESERVATION: 'CLICK_RESERVATION',
  CLICK_APPDOWNLOAD: 'CLICK_APPDOWNLOAD',
  CLICK_BACK: 'CLICK_BACK',
  CLICK_LOGO: 'CLICK_LOGO',
  VIEW_MYPORTFOLIO_MODAL: 'VIEW_MYPORTFOLIO_MODAL',
  CLICK_RESERVATION_LOGIN: 'CLICK_RESERVATION_LOGIN',
  VIEW_RESERVATION_COMPLETE_DIALOG: 'VIEW_RESERVATION_COMPLETE_DIALOG'
};

const legit = {
  VIEW_LEGIT_MAIN: 'VIEW_LEGIT_MAIN',
  CLICK_LEGIT_TAB: 'CLICK_LEGIT_TAB',
  CLICK_LEGIT_WISH: 'CLICK_LEGIT_WISH',
  CLICK_LEGIT_MODAL: 'CLICK_LEGIT_MODAL',
  CLICK_LEGIT_BRAND: 'CLICK_LEGIT_BRAND',
  CLICK_LEGIT_RESULT: 'CLICK_LEGIT_RESULT',
  CLICK_LOADMORE: 'CLICK_LOADMORE',
  CLICK_LEGIT_BANNER: 'CLICK_LEGIT_BANNER',
  VIEW_LEGIT_MY: 'VIEW_LEGIT_MY',
  CLICK_LEGIT_LIST: 'CLICK_LEGIT_LIST',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  VIEW_LEGIT_POPUP: 'VIEW_LEGIT_POPUP',
  VIEW_LEGIT_MODAL: 'VIEW_LEGIT_MODAL',
  VIEW_LEGIT_INFO: 'VIEW_LEGIT_INFO',
  CLICK_LEGIT_INFO: 'CLICK_LEGIT_INFO',
  VIEW_LEGIT_TOOLTIP: 'VIEW_LEGIT_TOOLTIP',
  CLICK_LEGIT_TOOLTIP: 'CLICK_LEGIT_TOOLTIP',
  VIEW_LEGIT_WISH: 'VIEW_LEGIT_WISH',
  CLICK_LEGIT_POPUP: 'CLICK_LEGIT_POPUP',
  VIEW_LEGIT_FLOATING: 'VIEW_LEGIT_FLOATING',
  CLICK_LEGIT_FLOATING: 'CLICK_LEGIT_FLOATING',
  CLICK_LEGIT_FILTER: 'CLICK_LEGIT_FILTER',
  WIPE_X_LEGITCARD: 'WIPE_X_LEGITCARD',
  CLICK_LEGITCARD: 'CLICK_LEGITCARD'
};

const legitResult = {
  VIEW_LEGIT_SURVEY: 'VIEW_LEGIT_SURVEY',
  SUBMIT_LEGIT_SURVEY: 'SUBMIT_LEGIT_SURVEY',
  SWIPE_X_THUMBPIC: 'SWIPE_X_THUMBPIC',
  CLICK_THUMBPIC: 'CLICK_THUMBPIC',
  CLICK_SHARE: 'CLICK_SHARE'
};

const legitGuide = {
  VIEW_LEGIT_POPUP: 'VIEW_LEGIT_POPUP',
  CLICK_LEGIT_BRAND: 'CLICK_LEGIT_BRAND'
};

const crazycuration = {
  viewCrazyWeek: 'VIEW_CRAZYWEEK',
  clickShare: 'CLICK_SHARE',
  clickTag: 'CLICK_TAG',
  swipeXTag: 'SWIPE_X_TAG',
  clickProductDetail: 'CLICK_PRODUCT_DETAIL',
  clickWishList: 'CLICK_WISH_LIST',
  swipeXCard: 'SWIPE_X_CARD',
  clickCurationCard: 'CLICK_CURATION_CARD',
  clickPushNoti: 'CLICK_PUSHNOTI',
  clickProductList: 'CLICK_PRODUCT_LIST',
  viewCrazyWeekPopup: 'VIEW_CRAZYWEEK_POPUP',
  clickCrazyWeek: 'CLICK_CRAZYWEEK',
  clickClose: 'CLICK_CLOSE',
  viewMainModal: 'VIEW_MAIN_MODAL',
  clickNotToday: 'CLICK_NOTTODAY',
  clickWish: 'CLICK_WISH',
  clickWishCancel: 'CLICK_WISH_CANCEL',
  clickMain: 'CLICK_MAIN',
  clickSearchModal: 'CLICK_SEARCHMODAL'
};

const attrKeys = {
  sendLogApiEvent,
  appsFlyerEvent,
  naverEvent,
  commonEvent,
  login,
  brand,
  search,
  userInput,
  mypage,
  header,
  wishes,
  noti,
  sellerInfo,
  products,
  productsKeyword,
  category,
  home,
  welcome,
  searchHelper,
  myPortfolio,
  legit,
  legitResult,
  legitGuide,
  crazycuration
};

export default attrKeys;
