import { useEffect } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Label, Typography } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isUndefined from 'lodash-es/isUndefined';
import { animated, useSpring } from '@react-spring/web';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchSizeMapping, postProductKeyword } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { SHOW_PRODUCTS_KEYWORD_POPUP } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import {
  allSelectedSearchOptionsSelector,
  searchParamsState,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import { homeSelectedTabStateFamily } from '@recoil/home';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Searching() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { brand, gender, parentCategory } = useRecoilValue(selectedSearchOptionsState);
  const {
    deviceId,
    brandIds,
    genderIds,
    parentIds,
    subParentIds,
    categorySizeIds,
    lineIds,
    minPrice,
    maxPrice,
    siteUrlIds,
    colorIds,
    seasonIds,
    materialIds
  } = useRecoilValue(searchParamsState);
  const {
    brandLabel,
    lineLabel,
    categoryLabel,
    sizeLabel,
    maxPriceLabel,
    colorLabel,
    seasonLabel,
    materialLabel,
    platformLabel
  } = useRecoilValue(allSelectedSearchOptionsSelector);
  const resetSearchParams = useResetRecoilState(searchParamsState);
  const resetSelectedSearchOptions = useResetRecoilState(selectedSearchOptionsState);
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));

  const { data: accessUser } = useQueryAccessUser();
  const props = useSpring({ val: 0, from: { val: 235908 }, config: { duration: 2000 } });
  const { mutate } = useMutation(postProductKeyword);

  useEffect(() => {
    const productSearch = omitBy(
      {
        requiredBrands: [brand.name],
        brandIds,
        genderIds,
        parentIds,
        subParentIds,
        categorySizeIds,
        lineIds,
        minPrice,
        maxPrice,
        siteUrlIds,
        colorIds,
        seasonIds,
        materialIds
      },
      isUndefined
    );

    const moveToProducts = () => {
      resetProductKeyword();
      queryClient.invalidateQueries(queryKeys.users.userProductKeywords());
      setTimeout(
        () => router.replace({ pathname: `/products/brands/${brand.name}`, query: productSearch }),
        2000
      );
    };

    if (accessUser) {
      logEvent(attrKeys.searchHelper.loadMyListSave, { name: attrProperty.productName.AUTO });

      if (categorySizeIds?.length) {
        fetchSizeMapping()
          .then((sizeMapping) => {
            const { outer, top, bottom, shoe } =
              sizeMapping[gender.name as keyof typeof sizeMapping];
            const sizesData = [
              ...outer.filter(
                ({ size: { parentCategoryId, categorySizeId } }) =>
                  parentCategoryId === parentCategory.id &&
                  categorySizeIds.some((id) => id === categorySizeId)
              ),
              ...top.filter(
                ({ size: { parentCategoryId, categorySizeId } }) =>
                  parentCategoryId === parentCategory.id &&
                  categorySizeIds.some((id) => id === categorySizeId)
              ),
              ...bottom.filter(
                ({ size: { parentCategoryId, categorySizeId } }) =>
                  parentCategoryId === parentCategory.id &&
                  categorySizeIds.some((id) => id === categorySizeId)
              ),
              ...shoe.filter(
                ({ size: { parentCategoryId, categorySizeId } }) =>
                  parentCategoryId === parentCategory.id &&
                  categorySizeIds.some((id) => id === categorySizeId)
              )
            ];

            if (sizesData.length) {
              productSearch.categorySizeIds = categorySizeIds.concat(
                sizesData.flatMap(({ subSize }) =>
                  subSize.map(({ categorySizeId }) => categorySizeId)
                )
              );
            }

            mutate(
              { productSearch: { ...productSearch, deviceId }, sourceType: 1 },
              {
                onSettled: () => {
                  moveToProducts();
                }
              }
            );
          })
          .catch(() => {
            moveToProducts();
          });
      } else {
        mutate(
          { productSearch: { ...productSearch, deviceId }, sourceType: 1 },
          {
            onSettled: () => {
              moveToProducts();
            }
          }
        );
      }
    } else {
      setTimeout(
        () => router.replace({ pathname: `/products/brands/${brand.name}`, query: productSearch }),
        2000
      );
    }

    return () => {
      resetSelectedSearchOptions();

      if (accessUser) {
        resetSearchParams();
      } else {
        LocalStorage.set(SHOW_PRODUCTS_KEYWORD_POPUP, true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper>
      <GeneralTemplate hideAppDownloadBanner>
        <Typography variant="h2" weight="bold" customStyle={{ padding: '48px 0px 40px' }}>
          검색 집사가
          <br />
          {accessUser?.userName || '회원'}님의 꿀매물을 찾고 있어요!
        </Typography>
        <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
          {[
            brandLabel,
            lineLabel,
            categoryLabel,
            sizeLabel,
            maxPriceLabel,
            colorLabel,
            seasonLabel,
            materialLabel,
            platformLabel
          ].map(
            (item) =>
              !!item && <Label key={item} text={`${item}`} variant="ghost" brandColor="primary" />
          )}
        </Flexbox>
        <Flexbox justifyContent="center" alignment="center" customStyle={{ flex: 1 }}>
          <Round variant="h4" weight="bold">
            득템까지 남은 매물
            <animated.div className="number">
              {props.val.to((val) => commaNumber(Math.floor(val)))}
            </animated.div>
          </Round>
        </Flexbox>
      </GeneralTemplate>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Round = styled(Typography)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  bottom: 151px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.common.white};

  animation: roundPulse 1.2s infinite;

  @keyframes roundPulse {
    0% {
      box-shadow: 0 0 0 0 ${({ theme }) => theme.palette.primary.main};
    }
    100% {
      box-shadow: 0 0 0 60px rgba(0, 0, 0, 0);
    }
  }
`;

export default Searching;
