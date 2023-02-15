/**
 * @name setCookie
 * @example setCookie('cookie-name', 'cookie-value', 1)
 */
export const setCookie = (name: string, value: string, day: number) => {
  const expire = new Date();
  expire.setDate(expire.getDate() + day);
  let cookies = `${name}=${escape(value)}; path=/ `; // 한글 깨짐을 막기위해
  if (typeof day !== 'undefined') cookies += `;expires=${expire.toUTCString()};`;
  document.cookie = cookies;
};
