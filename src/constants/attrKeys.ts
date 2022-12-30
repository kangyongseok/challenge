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
  clickAiOff: 'CLICK_AI_OFF',
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
  viewCrazyWeek: 'VIEW_CRAZYWEEK',
  minorScriptError: 'MINOR_SCRIPT_ERROR',
  pageNotFound: 'PAGE_NOT_FOUND',
  VIEW_APPDOWNLOAD: 'VIEW_APPDOWNLOAD',
  CLICK_APPDOWNLOAD: 'CLICK_APPDOWNLOAD',
  pageNotFoundError: 'PAGE_NOT_FOUND_ERROR',
  CLICK_TAB_CHANNEL: 'CLICK_TAB_CHANNEL',
  VIEW_CHANNEL: 'VIEW_CHANNEL',
  SUBMIT_APPOINTMENT: 'SUBMIT_APPOINTMENT',
  SUBMIT_REVIEW: 'SUBMIT_REVIEW',
  CLICK_PRODUCT_MODAL: 'CLICK_PRODUCT_MODAL',
  CLICK_APPOINTMENT_POPUP: 'CLICK_APPOINTMENT_POPUP',
  CLICK_REVIEW_SEND_POPUP: 'CLICK_REVIEW_SEND_POPUP'
};

const login = {
  LOAD_LOGIN_SNS: 'LOAD_LOGIN_SNS',
  CLICK_LOGIN_SNS: 'CLICK_LOGIN_SNS',
  CLICK_NONLOGIN: 'CLICK_NONLOGIN',
  VIEW_LOGIN: 'VIEW_LOGIN',
  SUBMIT_LOGIN_SNS: 'SUBMIT_LOGIN_SNS',
  CLICK_TAB: 'CLICK_TAB',
  CLICK_RECENT: 'CLICK_RECENT',
  VIEW_LOGIN_MODAL: 'VIEW_LOGIN_MODAL'
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
  CLICK_PERSONAL_INPUT: 'CLICK_PERSONAL_INPUT',
  CLICK_BLOCK_LIST: 'CLICK_BLOCK_LIST',
  VIEW_BLOCK_LIST: 'VIEW_BLOCK_LIST',
  CLICK_BLOCKUSER: 'CLICK_BLOCKUSER'
};

const header = {
  CLICK_LOGO: 'CLICK_LOGO',
  CLICK_BACK: 'CLICK_BACK',
  CLICK_SCOPE: 'CLICK_SCOPE',
  CLICK_SEARCHMODAL: 'CLICK_SEARCHMODAL',
  CLICK_CLOSE: 'CLICK_CLOSE',
  CLICK_TAB_WISH: 'CLICK_TAB_WISH'
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
  CLICK_WISHLEGIT_POPUP: 'CLICK_WISHLEGIT_POPUP',
  CLICK_DELETERECENT_BUTTON: 'CLICK_DELETERECENT_BUTTON',
  CLICK_DELETESOLDOUT_BUTTON: 'CLICK_DELETESOLDOUT_BUTTON',
  CLICK_PRODUCT_LIST: 'CLICK_PRODUCT_LIST',
  CLICK_CLOSE: 'CLICK_CLOSE',
  CLICK_DELETERECENT: 'CLICK_DELETERECENT',
  CLICK_DELETESOLDOUT: 'CLICK_DELETESOLDOUT',
  SWIPE_X_TAG: 'SWIPE_X_TAG',
  CLICK_UNDO: 'CLICK_UNDO'
};

const noti = {
  VIEW_BEHAVIOR_LIST: 'VIEW_BEHAVIOR_LIST',
  CLICK_BEHAVIOR: 'CLICK_BEHAVIOR',
  VIEW_HONEYNOTI_LIST: 'VIEW_HONEYNOTI_LIST',
  CLICK_HONEYNOTI_MANAGE: 'CLICK_HONEYNOTI_MANAGE',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  CLICK_ALARM_LIST: 'CLICK_ALARM_LIST',
  CLICK_ANNOUNCE_LIST: 'CLICK_ANNOUNCE_LIST',
  CLICK_PRODUCT_LIST: 'CLICK_PRODUCT_LIST',
  CLICK_WISH_LIST: 'CLICK_WISH_LIST',
  CLICK_ANNOUNCE_DETAIL: 'CLICK_ANNOUNCE_DETAIL',
  CLICK_LEGIT_INFO: 'CLICK_LEGIT_INFO',
  CLICK_BEHAVIOR_LIST: 'CLICK_BEHAVIOR_LIST'
};

const sellerInfo = {
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  VIEW_SELLER_PRODUCT: 'VIEW_SELLER_PRODUCT',
  VIEW_SELLER_REVIEW: 'VIEW_SELLER_REVIEW',
  LOAD_MOREAUTO: 'LOAD_MOREAUTO',
  CLICK_SELLER_PRODUCT: 'CLICK_SELLER_PRODUCT',
  CLICK_SELLER_REVIEW: 'CLICK_SELLER_REVIEW'
};

const userInfo = {
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
  CLICK_CLOSE: 'CLICK_CLOSE',
  CLICK_MAIN_TAB: 'CLICK_MAIN_TAB',
  SWIPE_X_BANNER: 'SWIPE_X_BANNER',
  CLICK_BANNER: 'CLICK_BANNER',
  CLICK_CRAZYWEEK: 'CLICK_CRAZYWEEK',
  CLICK_MYPORTFOLIO: 'CLICK_MYPORTFOLIO',
  SWIPE_X_CARD: 'SWIPE_X_CARD',
  CLICK_REFRESH_PRODUCT: 'CLICK_REFRESH_PRODUCT',
  CLICK_LEGIT_MAIN: 'CLICK_LEGIT_MAIN',
  CLICK_LEGIT_INFO: 'CLICK_LEGIT_INFO',
  CLICK_WISH_LIST: 'CLICK_WISH_LIST',
  VIEW_PERSONAL_ONBOARDING: 'VIEW_PERSONAL_ONBOARDING',
  CLICK_RECENT_LIST: 'CLICK_RECENT_LIST',
  CLICK_TAB_WISH: 'CLICK_TAB_WISH',
  VIEW_LEGIT_MODAL: 'VIEW_LEGIT_MODAL',
  CLICK_LEGIT_MODAL: 'CLICK_LEGIT_MODAL',
  CLICK_FEATURED_PRODUCT_LIST: 'CLICK_FEATURED_PRODUCT_LIST'
};

const products = {
  viewProductList: 'VIEW_PRODUCT_LIST',
  loadProductList: 'LOAD_PRODUCT_LIST',
  loadMoreAuto: 'LOAD_MOREAUTO',
  viewFilter: 'VIEW_FILTER',
  swipeXFilter: 'SWIPE_X_FILTER',
  clickApplyFilter: 'CLICK_APPLYFILTER',
  clickResetAll: 'CLICK_RESETALL',
  selectFilter: 'SELECT_FILTER',
  clickFilterDelete: 'CLICK_FILTER_DELETE',
  clickFilter: 'CLICK_FILTER',
  selectFilterTab: 'SELECT_FILTERTAB',
  clickApplyIdFilter: 'CLICK_APPLY_IDFILTER',
  selectIdFilter: 'SELECT_ID_FILTER',
  clickSort: 'CLICK_SORT',
  selectSort: 'SELECT_SORT',
  clickProductDetail: 'CLICK_PRODUCT_DETAIL',
  clickWish: 'CLICK_WISH',
  clickWishCancel: 'CLICK_WISH_CANCEL',
  clickBrandRequest: 'CLICK_BRAND_REQUEST',
  clickKeywordRequest: 'CLICK_KEYWORD_REQUEST',
  clickApplyMapFilter: 'CLICK_APPLY_MAPFILTER',
  clickMyFilter: 'CLICK_MYFILTER',
  viewMyFilter: 'VIEW_MYFILTER',
  viewMyFilterTooltip: 'VIEW_MYFILTER_TOOLTIP',
  clickWishList: 'CLICK_WISH_LIST',
  clickPersonalInput: 'CLICK_PERSONAL_INPUT',
  clickLogin: 'CLICK_LOGIN',
  viewMyList: 'VIEW_MYLIST',
  clickMyList: 'CLICK_MYLIST',
  clickBack: 'CLICK_BACK',
  VIEW_MYLIST_MODAL: 'VIEW_MYLIST_MODAL',
  CLICK_MYLIST_MODAL: 'CLICK_MYLIST_MODAL',
  clickUndo: 'CLICK_UNDO',
  viewMyListPopup: 'VIEW_MYLIST_POPUP',
  viewRecommPrice: 'VIEW_RECOMMPRICE',
  clickRecommPrice: 'CLICK_RECOMMPRICE',
  CLICK_BRAND_SEARCH: 'CLICK_BRAND_SEARCH',
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
  CLICK_EXPAND: 'CLICK_EXPAND',
  CLICK_WISHMOAL_CLOSE: 'CLICK_WISHMOAL_CLOSE',
  VIEW_WISH_MODAL: 'VIEW_WISH_MODAL',
  CLICK_SEARCHMODAL: 'CLICK_SEARCHMODAL',
  SELLER_PRODUCT: 'SELLER_PRODUCT',
  SWIP_X_CARD: 'SWIP_X_CARD',
  VIEW_PRODUCT_DETAIL_TOAST: 'VIEW_PRODUCT_DETAIL_TOAST',
  VIEW_PURCHASE_TOOLTIP: 'VIEW_PURCHASE_TOOLTIP',
  VIEW_WISHPRICE_TOOLTIP: 'VIEW_WISHPRICE_TOOLTIP',
  CLICK_CLOSE: 'CLICK_CLOSE',
  VIEW_APPREVIEW_PROMPT: 'VIEW_APPREVIEW_PROMPT',
  CLICK_MYLIST_FLOATING: 'CLICK_MYLIST_FLOATING',
  clickMyListAuto: 'CLICK_MYLIST_AUTO',
  loadMyListSave: 'LOAD_MYLIST_SAVE',
  CLICK_LEGIT_FILTER: 'CLICK_LEGIT_FILTER',
  SELECT_LEGIT_FILTER: 'SELECT_LEGIT_FILTER',
  CLICK_SEND_MESSAGE: 'CLICK_SEND_MESSAGE',
  viewRecommKeyword: 'VIEW_RECOMMKEYWORD',
  clickRecommKeyword: 'CLICK_RECOMMKEYWORD',
  clickDynamicFilter: 'CLICK_DYNAMICFILTER',
  swipeXDynamicFilter: 'SWIPE_X_DYNAMICFILTER',
  swipeXFilterHistory: 'SWIPE_X_FILTERHISTORY',
  CLICK_PRODUCT_LIST: 'CLICK_PRODUCT_LIST',
  VIEW_SOLDOUT: 'VIEW_SOLDOUT',
  CLICK_SOLDOUT_DETAIL: 'CLICK_SOLDOUT_DETAIL',
  SWIPE_X_RECENT: 'SWIPE_X_RECENT',
  VIEW_LOWPRICE_PRODUCT: 'VIEW_LOWPRICE_PRODUCT',
  CLICK_CATEGORY: 'CLICK_CATEGORY',
  CLICK_WISH_SELF: 'CLICK_WISH_SELF',
  LOAD_PRODUCT_LIST_ZAI: 'LOAD_PRODUCT_LIST_ZAI',
  SELECT_FILTER: 'SELECT_FILTER',
  CLICK_APPLYFILTER: 'CLICK_APPLYFILTER',
  SELECT_ID_FILTER: 'SELECT_ID_FILTER'
};

const welcome = {
  VIEW_WELCOME: 'VIEW_WELCOME',
  CLICK_PERSONAL_INPUT: 'CLICK_PERSONAL_INPUT',
  VIEW_PERSONAL_INPUT: 'VIEW_PERSONAL_INPUT',
  SELECT_ITEM: 'SELECT_ITEM',
  SUBMIT_PERSONAL_INPUT: 'SUBMIT_PERSONAL_INPUT',
  CLICK_SKIP: 'CLICK_SKIP',
  CLICK_START: 'CLICK_START',
  VIEW_AUTH_MODAL: 'VIEW_AUTH_MODAL'
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
  loadMyListSave: 'LOAD_MYLIST_SAVE'
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
  CLICK_LEGITCARD: 'CLICK_LEGITCARD',
  CLICK_BANNER: 'CLICK_BANNER',
  CLICK_LEGIT_PROCESS: 'CLICK_LEGIT_PROCESS',
  SWIPE_X_BANNER: 'SWIPE_X_BANNER',
  SWIPE_X_BRAND: 'SWIPE_X_BRAND',
  SWIPE_X_LEGIT: 'SWIPE_X_LEGIT',
  CLICK_LEGIT_PROFILE: 'CLICK_LEGIT_PROFILE',
  CLICK_NOTTODAY: 'CLICK_NOTTODAY',
  CLICK_CLOSE: 'CLICK_CLOSE',
  VIEW_LEGIT_PROFILE: 'VIEW_LEGIT_PROFILE',
  CLICK_SELLER_PRODUCT: 'CLICK_SELLER_PRODUCT',
  CLICK_PROFILE_LINK: 'CLICK_PROFILE_LINK',
  CLICK_SHARE: 'CLICK_SHARE',
  LOAD_LEGIT_INFO: 'LOAD_LEGIT_INFO',
  VIEW_LEGIT_PROCESS: 'VIEW_LEGIT_PROCESS',
  CLICK_LEGIT_CATEGORY: 'CLICK_LEGIT_CATEGORY',
  VIEW_LEGIT_BRAND: 'VIEW_LEGIT_BRAND',
  VIEW_LEGIT_MODEL: 'VIEW_LEGIT_MODEL',
  CLICK_LEGIT_MODEL: 'CLICK_LEGIT_MODEL',
  VIEW_LEGIT_UPLOAD: 'VIEW_LEGIT_UPLOAD',
  CLICK_LEGIT_UPLOAD: 'CLICK_LEGIT_UPLOAD',
  CLICK_LEGIT_ADDINFO: 'CLICK_LEGIT_ADDINFO',
  SUBMIT_LEGIT_PROCESS: 'SUBMIT_LEGIT_PROCESS',
  CLICK_LEGIT_HOWITWORKS: 'CLICK_LEGIT_HOWITWORKS',
  CLICK_LEGIT_COPY: 'CLICK_LEGIT_COPY',
  CLICK_UPLOAD_GUIDE: 'CLICK_UPLOAD_GUIDE',
  CLICK_LEGIT_HISTORY: 'CLICK_LEGIT_HISTORY'
};

const legitResult = {
  VIEW_LEGIT_SURVEY: 'VIEW_LEGIT_SURVEY',
  SUBMIT_LEGIT_SURVEY: 'SUBMIT_LEGIT_SURVEY',
  SWIPE_X_THUMBPIC: 'SWIPE_X_THUMBPIC',
  CLICK_THUMBPIC: 'CLICK_THUMBPIC',
  CLICK_SHARE: 'CLICK_SHARE',
  CLICK_DELETE_POPUP: 'CLICK_DELETE_POPUP',
  CLICK_COMMENT_DELETE: 'CLICK_COMMENT_DELETE',
  SUBMIT_COMMENT: 'SUBMIT_COMMENT',
  CLICK_LEGIT_INFO: 'CLICK_LEGIT_INFO',
  CLICK_THUMBPIC_BTN: 'CLICK_THUMBPIC_BTN'
};

const legitGuide = {
  VIEW_LEGIT_POPUP: 'VIEW_LEGIT_POPUP',
  CLICK_LEGIT_BRAND: 'CLICK_LEGIT_BRAND',
  VIEW_LEGIT_HOWITWORKS: 'VIEW_LEGIT_HOWITWORKS',
  CLICK_LEGIT_TAB: 'CLICK_LEGIT_TAB',
  CLICK_LEGIT_PROCESS: 'CLICK_LEGIT_PROCESS',
  CLICK_PRODUCT_LIST: 'CLICK_PRODUCT_LIST',
  VIEW_UPLOAD_GUIDE: 'VIEW_UPLOAD_GUIDE'
};

const legitProfile = {
  CLICK_LEGIT_FILTER: 'CLICK_LEGIT_FILTER'
};

const legitSearch = {
  VIEW_LEGIT_HISTORY: 'VIEW_LEGIT_HISTORY',
  CLICK_LEGIT_SEARCH: 'CLICK_LEGIT_SEARCH',
  CLICK_LEGIT_FILTER: 'CLICK_LEGIT_FILTER',
  CLICK_PRODUCT_LIST: 'CLICK_PRODUCT_LIST',
  VIEW_UPLOAD_GUIDE: 'VIEW_UPLOAD_GUIDE'
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

const camelSeller = {
  VIEW_PRODUCT_POPUP: 'VIEW_PRODUCT_POPUP',
  CLICK_PRODUCT_POPUP: 'CLICK_PRODUCT_POPUP',
  CLICK_CLOSE: 'CLICK_CLOSE',
  VIEW_PRODUCT_MODEL: 'VIEW_PRODUCT_MODEL',
  LOAD_KEYWORD_AUTO: 'LOAD_KEYWORD_AUTO',
  CLICK_MODEL: 'CLICK_MODEL',
  VIEW_PRODUCT_CATEGORY: 'VIEW_PRODUCT_CATEGORY',
  CLICK_CATEGORY: 'CLICK_CATEGORY',
  VIEW_PRODUCT_BRAND: 'VIEW_PRODUCT_BRAND',
  CLICK_BRAND_SEARCH: 'CLICK_BRAND_SEARCH',
  CLICK_BRAND: 'CLICK_BRAND',
  VIEW_PRODUCT_MAIN: 'VIEW_PRODUCT_MAIN',
  CLICK_PRODUCT_EDIT: 'CLICK_PRODUCT_EDIT',
  CLICK_MARKET_PRICE: 'CLICK_MARKET_PRICE',
  SUBMIT_PRODUCT: 'SUBMIT_PRODUCT',
  VIEW_PRODUCT_MODAL: 'VIEW_PRODUCT_MODAL',
  CLICK_PRODUCT_MODAL: 'CLICK_PRODUCT_MODAL',
  VIEW_PRODUCT_OPTIONS: 'VIEW_PRODUCT_OPTIONS',
  SELECT_ITEM: 'SELECT_ITEM',
  CLICK_PRODUCT_OPTIONS: 'CLICK_PRODUCT_OPTIONS',
  CLICK_RESET_ITEM: 'CLICK_RESET_ITEM',
  VIEW_MAKET_PRICE: 'VIEW_MAKET_PRICE',
  CLICK_FILTER: 'CLICK_FILTER',
  SELECT_FILTER: 'SELECT_FILTER',
  CLICK_SORT: 'CLICK_SORT',
  SELECT_SORT: 'SELECT_SORT',
  CLICK_RESET: 'CLICK_RESET',
  CLICK_MARKET_PRODUCT: 'CLICK_MARKET_PRODUCT',
  VIEW_PRODUCT_DESCRIPTION: 'VIEW_PRODUCT_DESCRIPTION',
  CLICK_PRODUCT_DESCRIPTION: 'CLICK_PRODUCT_DESCRIPTION',
  CLICK_MY_STORE: 'CLICK_MY_STORE',
  CLICK_NEWPRODUCT: 'CLICK_NEWPRODUCT',
  VIEW_MY_STORE: 'VIEW_MY_STORE',
  CLICK_PRODUCT_DETAIL: 'CLICK_PRODUCT_DETAIL',
  CLICK_PRODUCT_MANAGE: 'CLICK_PRODUCT_MANAGE',
  SUBMIT_PRODUCT_MODAL: 'SUBMIT_PRODUCT_MODAL',
  CLICK_PHOTO_GUIDE: 'CLICK_PHOTO_GUIDE',
  CLICK_LOGO: 'CLICK_LOGO',
  CLICK_MODEL_SEARCH: 'CLICK_MODEL_SEARCH',
  CLICK_PIC: 'CLICK_PIC'
};

const debug = {
  LOAD_USER_INFO: 'LOAD_USER_INFO'
};

const intro = {
  CLICK_LOGIN: 'CLICK_LOGIN',
  SWIPE_X_APPINTRO: 'SWIPE_X_APPINTRO',
  VIEW_LOGIN_BUTTON: 'VIEW_LOGIN_BUTTON'
};

const events = {
  VIEW_CRAZYWEEK: 'VIEW_CRAZYWEEK',
  CLICK_TAG: 'CLICK_TAG',
  SWIPE_X_TAG: 'SWIPE_X_TAG',
  VIEW_FEATURED_PRODUCT_LIST: 'VIEW_FEATURED_PRODUCT_LIST',
  CLICK_PUSH_ON: 'CLICK_PUSH_ON'
};

const channel = {
  VIEW_CHANNEL: 'VIEW_CHANNEL',
  CLICK_TAB: 'CLICK_TAB',
  SWIPE_X_CHANNEL_LIST: 'SWIPE_X_CHANNEL_LIST',
  CLICK_CHANNEL_ALARM: 'CLICK_CHANNEL_ALARM',
  CLICK_LEAVE: 'CLICK_LEAVE',
  CLICK_SORT: 'CLICK_SORT',
  CLICK_CHANNEL_DETAIL: 'CLICK_CHANNEL_DETAIL',
  CLICK_CHANNEL: 'CLICK_CHANNEL',
  CLICK_PRODUCT_MANAGE: 'CLICK_PRODUCT_MANAGE',
  VIEW_CHANNEL_DETAIL: 'VIEW_CHANNEL_DETAIL',
  CLICK_PROFILE: 'CLICK_PROFILE',
  CLICK_CHANNEL_MORE: 'CLICK_CHANNEL_MORE',
  CLICK_APPOINTMENT: 'CLICK_APPOINTMENT',
  CLICK_REVIEW_SEND: 'CLICK_REVIEW_SEND',
  CLICK_REVIEW_DETAIL: 'CLICK_REVIEW_DETAIL',
  VIEW_APPOINTMENT: 'VIEW_APPOINTMENT',
  CLICK_APPOINTMENT_CANCEL: 'CLICK_APPOINTMENT_CANCEL',
  SUBMIT_APPOINTMENT: 'SUBMIT_APPOINTMENT',
  VIEW_REVIEW_SEND: 'VIEW_REVIEW_SEND',
  SUBMIT_REVIEW: 'SUBMIT_REVIEW',
  VIEW_REPORT: 'VIEW_REPORT',
  SUBMIT_REPORT: 'SUBMIT_REPORT',
  VIEW_PRODUCT_MODAL: 'VIEW_PRODUCT_MODAL',
  CLICK_PRODUCT_MODAL: 'CLICK_PRODUCT_MODAL',
  VIEW_CHANNEL_MORE_MODAL: 'VIEW_CHANNEL_MORE_MODAL',
  SELECT_CHANNEL_MORE: 'SELECT_CHANNEL_MORE',
  VIEW_APPOINTMENT_POPUP: 'VIEW_APPOINTMENT_POPUP',
  CLICK_APPOINTMENT_POPUP: 'CLICK_APPOINTMENT_POPUP',
  VIEW_REVIEW_SEND_POPUP: 'VIEW_REVIEW_SEND_POPUP',
  CLICK_REVIEW_SEND_POPUP: 'CLICK_REVIEW_SEND_POPUP',
  VIEW_CHANNEL_POPUP: 'VIEW_CHANNEL_POPUP',
  CLICK_CHANNEL_POPUP: 'CLICK_CHANNEL_POPUP',
  SUBMIT_PRODUCT_MODAL: 'SUBMIT_PRODUCT_MODAL',
  CLICK_PHOTO_GUIDE: 'CLICK_PHOTO_GUIDE',
  CLICK_LOGO: 'CLICK_LOGO',
  CLICK_MODEL_SEARCH: 'CLICK_MODEL_SEARCH',
  CLICK_PIC: 'CLICK_PIC',
  VIEW_SELECT_BUYER: 'VIEW_SELECT_BUYER',
  CLICK_BUYER: 'CLICK_BUYER'
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
  userInfo,
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
  legitProfile,
  legitSearch,
  crazycuration,
  camelSeller,
  debug,
  intro,
  events,
  channel
};

export default attrKeys;
