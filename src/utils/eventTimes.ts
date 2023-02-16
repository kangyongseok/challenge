import dayjs from 'dayjs';

export const EventTime = (startDate: string, endDate: string) => {
  const isOverStartDate = dayjs().diff(`${startDate} 00:00`, 'minute') >= 0;
  const isUnderEndDate = dayjs(`${endDate} 23:59:59`).diff(dayjs(), 'second') > 0;
  return {
    isEvent: isOverStartDate && isUnderEndDate,
    isStart: isOverStartDate,
    isEnd: isUnderEndDate
  };
};
