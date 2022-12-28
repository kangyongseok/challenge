import type {
  ChannelDetail,
  ChannelsParams,
  PageChannelDetail,
  PostAppointmentData,
  PostChannelData,
  PostHistoryManageData,
  PutAppointmentData
} from '@dto/channel';

import Axios from '@library/axios';

const BASE_PATH = '/channels';

export async function fetchChannels(params: ChannelsParams) {
  const { data } = await Axios.getInstance().get<PageChannelDetail>(BASE_PATH, { params });

  return data;
}

export async function postChannel(data: PostChannelData) {
  const { data: result } = await Axios.getInstance().post<number>(BASE_PATH, data);

  return result;
}

export async function fetchChannel(channelId: number) {
  const { data } = await Axios.getInstance().get<ChannelDetail>(`${BASE_PATH}/${channelId}`);

  return data;
}

export async function postAppointment({ channelId, ...data }: PostAppointmentData) {
  await Axios.getInstance().post(`${BASE_PATH}/${channelId}/appointment`, data);
}

export async function putAppointment({ channelId, ...data }: PutAppointmentData) {
  await Axios.getInstance().put(`${BASE_PATH}/${channelId}/appointment`, data);
}

export async function deleteAppointment(channelId: number) {
  await Axios.getInstance().delete(`${BASE_PATH}/${channelId}/appointment`);
}

export async function postLeave(channelId: number) {
  await Axios.getInstance().post(`${BASE_PATH}/${channelId}/leave`);
}

export async function postNoti(channelId: number) {
  await Axios.getInstance().post(`${BASE_PATH}/${channelId}/noti`);
}

export async function deleteNoti(channelId: number) {
  await Axios.getInstance().delete(`${BASE_PATH}/${channelId}/noti`);
}

export async function postHistoryManage(data: PostHistoryManageData) {
  await Axios.getInstance().post(`${BASE_PATH}/historyManage`, data);
}
