import { baseCons, doubleCon } from '@constants/consonant';

const getBrandListTitles = (resultKo: Array<string>, regexp: RegExp) => {
  const data = resultKo.filter((koCon) => !regexp.test(koCon));
  doubleCon.forEach((double, index) => {
    if (data.includes(double)) {
      const doubleIndex = data.findIndex((con) => con === double);
      const matchIndex = data.findIndex((con) => con === baseCons[index]);
      data.splice(doubleIndex, 1);
      data[matchIndex] = `${data[matchIndex]}, ${double}`;
    }
  });
  if (resultKo.filter((koCon) => regexp.test(koCon)).length > 0) {
    data.push('0-9');
  }
  return data;
};

export default getBrandListTitles;
