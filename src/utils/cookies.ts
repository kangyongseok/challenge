/* eslint-disable no-underscore-dangle,no-unused-expressions,@typescript-eslint/no-explicit-any */
import type { IncomingMessage, ServerResponse } from 'http';

import { CookieSerializeOptions, parse, serialize } from 'cookie';

export type CookiesObj = { [key: string]: string } | Partial<{ [key: string]: string }>;
export type CookieValueTypes = string | boolean | undefined | null;

const isClientSide = (): boolean => typeof window !== 'undefined';

const processValue = (value: string): CookieValueTypes => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'undefined') return undefined;
  if (value === 'null') return null;
  return value;
};

const stringify = (value = '') => {
  try {
    const result = JSON.stringify(value);
    // eslint-disable-next-line no-useless-escape
    return /^[\{\[]/.test(result) ? result : value;
  } catch (e) {
    return value;
  }
};

const decode = (str: string): string => {
  if (!str) return str;

  return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};

export interface OptionsType extends CookieSerializeOptions {
  res?: ServerResponse;
  req?: IncomingMessage & {
    cookies?: { [key: string]: string } | Partial<{ [key: string]: string }>;
  };
}

export const getCookies = (options?: OptionsType): CookiesObj => {
  let req;
  if (options) req = options.req;
  if (!isClientSide()) {
    // if cookie-parser is used in project get cookies from ctx.req.cookies
    // if cookie-parser isn't used in project get cookies from ctx.req.headers.cookie
    if (req && req.cookies) return req.cookies;
    if (req && req.headers && req.headers.cookie) return parse(req.headers.cookie);
    return {};
  }

  const _cookies: CookiesObj = {};
  const documentCookies = document.cookie ? document.cookie.split('; ') : [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = documentCookies.length; i < len; i++) {
    const cookieParts = documentCookies[i].split('=');

    const _cookie = cookieParts.slice(1).join('=');
    const name = cookieParts[0];

    _cookies[name] = _cookie;
  }

  return _cookies;
};

export const getCookie = (
  key: string,
  options?: OptionsType
): string | boolean | undefined | null => {
  const resultCookies = getCookies(options);
  const value = resultCookies[key];

  if (value === undefined) return undefined;

  return processValue(decode(value));
};

export const setCookie = (key: string, data: any, options?: OptionsType): void => {
  let _cookieOptions: any;
  let _req;
  let _res;

  if (options) {
    const { req, res, ..._options } = options;
    _req = req;
    _res = res;
    _cookieOptions = _options;
  }

  const cookieStr = serialize(key, stringify(data), { path: '/', ..._cookieOptions });
  if (!isClientSide()) {
    if (_res && _req) {
      let currentCookies = _res.getHeader('Set-Cookie');

      if (!Array.isArray(currentCookies)) {
        currentCookies = !currentCookies ? [] : [String(currentCookies)];
      }
      _res.setHeader('Set-Cookie', currentCookies.concat(cookieStr));

      if (_req && _req.cookies) {
        const _cookies = _req.cookies;
        data === '' ? delete _cookies[key] : (_cookies[key] = stringify(data));
      }

      if (_req && _req.headers && _req.headers.cookie) {
        const _cookies = parse(_req.headers.cookie);

        data === '' ? delete _cookies[key] : (_cookies[key] = stringify(data));

        _req.headers.cookie = Object.entries(_cookies).reduce((accum, item) => {
          return accum.concat(`${item[0]}=${item[1]};`);
        }, '');
      }
    }
  } else {
    document.cookie = cookieStr;
  }
};

export const deleteCookie = (key: string, options?: OptionsType): void => {
  return setCookie(key, '', { ...options, maxAge: -1 });
};
