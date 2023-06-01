import type { Announce } from '@dto/user';
import type { PageProductResult, ProductContent } from '@dto/product';
import type {
  CommonCode,
  Content,
  ContentProductsParams,
  GetAnnounces,
  PhotoGuide,
  PhotoGuideParams,
  Styles
} from '@dto/common';
import { PopularSearchKeyword } from '@dto/common';

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

export async function fetchAnnounceBase() {
  const { data } = await Axios.getInstance().get<GetAnnounces>(`${BASE_PATH}/announces`);
  return data;
}

export async function fetchContent(id: number) {
  const { data } = await Axios.getInstance().get<Content>(`${BASE_PATH}/contents/${id}`);

  return data;
}

export async function fetchContentProducts({ id, ...params }: ContentProductsParams) {
  const { data } = await Axios.getInstance().get<PageProductResult>(
    `${BASE_PATH}/contents/${id}/products`,
    {
      params
    }
  );

  return data;
}

export async function fetchStyles() {
  const { data } = await Axios.getInstance().get<Styles>(`${BASE_PATH}/styles`);

  return data;
}

export async function fetchPopularSearchKeywords() {
  const { data } = await Axios.getInstance().get<PopularSearchKeyword>(
    `${BASE_PATH}/popularSearchKeywords`
  );

  return data;
}
