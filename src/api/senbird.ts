import Axios from '@library/axios';

export async function deleteSendbirdUser(userId: number) {
  await Axios.getInstance().delete(
    `https://api-${process.env.SENDBIRD_APP_ID}.sendbird.com/v3/users/${userId}`
  );
}

export async function deleteSendbirdUserDeviceToken(userId: number) {
  await Axios.getInstance().delete(
    `https://api-${process.env.SENDBIRD_APP_ID}.sendbird.com/v3/users/${userId}/push`
  );
}
