/**
 *
 * @param arr origin 객체가 갖고있는 키 배열
 * @param origin 원본객체
 * @returns origin 객체에서 value 값이 있는 객체만 리턴
 */
export const getOnlyObjectValue = (arr: string[], origin: { [propsName: string]: string }) => {
  const obj: { [propsName: string]: string } = {};
  arr.forEach((el) => {
    obj[el] = origin[el];
  });

  return obj;
};
