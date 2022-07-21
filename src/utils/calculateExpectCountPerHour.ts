/**
 *
 * @param {*} count 총 매물 수
 * @returns 한 시간에 오는 알림의 수
 */
const calculateExpectCountPerHour = (count: number) => {
  try {
    const numberOfAlarmasPerHour = Math.ceil((count * 0.05) / 24);
    return numberOfAlarmasPerHour > 0 ? numberOfAlarmasPerHour : 2;
  } catch (e) {
    return 2;
  }
};

export default calculateExpectCountPerHour;
