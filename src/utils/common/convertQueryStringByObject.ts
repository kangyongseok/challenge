/**
 * @name convertQueryStringByObject
 * @returns string QueryString 반환
 * @example '?parentIds=1&subParentUds=2&gender=male'
 */
export function convertQueryStringByObject(object: object, forcedPrefixIgnore = false) {
  return Object.keys(object)
    .map((key) => {
      const k = key as keyof object;
      if (!object[k]) return '';
      if (typeof object[k] === 'object' && Object.keys(object[k]).length === 0) return '';

      return `${key}=${encodeURIComponent(object[k])}`;
    })
    .filter((item) => item)
    .map((item, index) => {
      if (index === 0 && !forcedPrefixIgnore) {
        return `?${item}`;
      }

      return item;
    })
    .join('&');
}
