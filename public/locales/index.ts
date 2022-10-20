import ko from './ko-KR/common.json';
import en from './en-US/common.json';

const locales = { 'en-US': en, 'ko-KR': ko };

export const notSupport = {
  'en-US': {
    message: 'Your browser is not supported. Please update your browser.',
    button: 'Update Browser',
    url: 'http://outdatedbrowser.com'
  },
  'ko-KR': {
    message: '지원하지 않는 브라우저입니다. 브라우저를 업데이트 해주세요.',
    button: '브라우저 업데이트 하기',
    url: 'http://outdatedbrowser.com/ko'
  }
};

export default locales;
