/**
 * @name getCookie
 * @return cookie-value: string
 * @example getCookie('cookie-name')
 */
export const getCookie = (name: string) => {
  let x;
  let y;
  const val = document.cookie.split(';');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < val.length; i++) {
    x = val[i].substr(0, val[i].indexOf('='));
    y = val[i].substr(val[i].indexOf('=') + 1);
    x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
    if (x === name) {
      return unescape(y);
      // unescape로 디코딩 후 값 리턴
    }
  }
  return '';
};
