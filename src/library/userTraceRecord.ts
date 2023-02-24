import dayjs from 'dayjs';

import LocalStorage from '@library/localStorage';

import { USER_TRACE_RECORD } from '@constants/localStorage';

import type { UserTraceRecord as IUserTraceRecord, UserTracePages } from '@typings/common';

const UserTraceRecord = {
  getFirstVisitDate() {
    return LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD)?.firstVisitDate;
  },
  setFirstVisitDate(firstVisitDate: string) {
    const userTraceRecord = LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD);
    LocalStorage.set(USER_TRACE_RECORD, { ...userTraceRecord, firstVisitDate });
  },
  getLastVisitDate() {
    return LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD)?.lastVisitDate;
  },
  setLastVisitDate(lastVisitDate: string) {
    const userTraceRecord = LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD);
    LocalStorage.set(USER_TRACE_RECORD, { ...userTraceRecord, lastVisitDate });
  },
  getPageViewCount(page: UserTracePages) {
    const counts = LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD)?.pageViewCounts;
    if (!counts || !counts[page]) return 0;
    return LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD)?.pageViewCounts[page] || 0;
  },
  getLastVisitDateDiffDay() {
    return LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD)?.lastVisitDateDiffDay || 0;
  },
  setLastVisitDateDiffDay(lastVisitDateDiffDay: number) {
    const userTraceRecord = LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD);
    LocalStorage.set(USER_TRACE_RECORD, { ...userTraceRecord, lastVisitDateDiffDay });
  },
  increasePageViewCount(page: UserTracePages) {
    const userTraceRecord = LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD);
    LocalStorage.set(USER_TRACE_RECORD, {
      ...userTraceRecord,
      pageViewCounts: {
        ...userTraceRecord?.pageViewCounts,
        [page]: ((userTraceRecord?.pageViewCounts || {})[page] || 0) + 1
      }
    });
  },
  isReVisit() {
    const userTraceRecord = LocalStorage.get<IUserTraceRecord>(USER_TRACE_RECORD);

    if (!userTraceRecord) return false;

    const { firstVisitDate, lastVisitDate } = userTraceRecord;

    if (firstVisitDate && lastVisitDate) {
      return dayjs(firstVisitDate).diff(lastVisitDate, 'days') <= -1;
    }

    return false;
  }
};

export default UserTraceRecord;
