import { Announce } from '@dto/user';
import type { ProductContent } from '@dto/product';
import type { CommonCode, PhotoGuide, PhotoGuideParams } from '@dto/common';

import Axios from '@library/axios';

import type { CommonCodeId } from '@typings/camelSeller';

const BASE_PATH = '/commons';

export async function fetchContentsProducts(contentsId: number) {
  const { data } = await Axios.getInstance().get<ProductContent>(
    `${BASE_PATH}/contentsProducts/${contentsId}`
  );

  return data;
}

export async function fetchCommonCodeDetails(params: CommonCodeId) {
  const { data } = await Axios.getInstance().get<CommonCode[]>(`${BASE_PATH}/codeDetails`, {
    params
  });

  return data;
}

export async function fetchPhotoGuide(params: PhotoGuideParams) {
  const { data } = await Axios.getInstance().get<PhotoGuide>(`${BASE_PATH}/photoGuide`, {
    params
  });

  return data;
}

export async function fetchAnnounce(id: number) {
  const { data } = await Axios.getInstance().get<Announce>(`${BASE_PATH}/announces/${id}`);

  return data;
}
