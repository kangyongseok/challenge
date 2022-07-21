import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Chip, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import type { CSSObject } from '@emotion/styled';
import styled from '@emotion/styled';

import type { ProductKeywordSourceType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchProductKeywords, postProductKeyword } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { filterCodeIds, orderFilterOptions } from '@constants/productsFilter';
import attrKeys from '@constants/attrKeys';

import { convertSearchParamsByQuery } from '@utils/products';

import {
  productsKeywordAutoSaveTriggerState,
  productsKeywordAutoSavedToast
} from '@recoil/productsKeyword';
import {
  searchOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { deviceIdState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductsSaveSearchFloatingButtonProps {
  variant: 'brands' | 'categories' | 'search';
}

function ProductsSaveSearchFloatingButton({ variant }: ProductsSaveSearchFloatingButtonProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const atomParam = router.asPath.split('?')[0];
  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const {
    searchOptions: { subParentCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));
  const [{ selectedSearchOptions }] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const [productsKeywordAutoSaveTrigger, setProductsKeywordAutoSaveTrigger] = useRecoilState(
    productsKeywordAutoSaveTriggerState
  );
  const setProductsKeywordAutoSavedToast = useSetRecoilState(productsKeywordAutoSavedToast);

  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();
  const {
    data: { content: productKeywords = [] } = {},
    isLoading,
    isFetched
  } = useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
    enabled: !!accessUser
  });
  const { mutate } = useMutation(postProductKeyword);

  const triggered = useReverseScrollTrigger();
  const [isOpenSavedKeywordToast, setIsOpenSavedKeywordToast] = useState(false);
  const showProductKeywordSaveSearchFloatingBtn =
    !isLoading &&
    isFetched &&
    !!selectedSearchOptions.filter(({ codeId }) => ![filterCodeIds.order].includes(codeId)).length;

  const searchKeyword = useMemo(() => {
    const { keyword }: { keyword?: string } = router.query;
    const { subParentIds = [] } = convertSearchParamsByQuery(router.query);
    const subParentCategory = subParentCategories.find(({ id }) => subParentIds.includes(id));

    return subParentCategory ? subParentCategory.name.replace(/\(P\)/g, '') : keyword;
  }, [router.query, subParentCategories]);

  const saveProductKeyword = useCallback(
    (isAutoSave?: boolean) => {
      let sourceType: ProductKeywordSourceType = 0;

      switch (variant) {
        case 'brands': {
          sourceType = 1;
          break;
        }
        case 'categories': {
          sourceType = 3;
          break;
        }
        case 'search':
        default:
          break;
      }

      mutate(
        {
          productSearch: { ...searchParams, deviceId, order: orderFilterOptions[1].order },
          sourceType
        },
        {
          onSuccess() {
            logEvent(
              isAutoSave
                ? attrKeys.products.CLICK_MYLIST_AUTO
                : attrKeys.products.CLICK_MYLIST_FLOATING,
              {
                name: 'PRODUCT_LIST',
                att: 'SAVE'
              }
            );
            setProductsKeywordAutoSaveTrigger(false);
            queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));

            if (isAutoSave) {
              setProductsKeywordAutoSavedToast(true);
            } else {
              setIsOpenSavedKeywordToast(true);
            }
          }
        }
      );
    },
    [
      deviceId,
      mutate,
      queryClient,
      searchOptionsParams,
      searchParams,
      setProductsKeywordAutoSaveTrigger,
      setProductsKeywordAutoSavedToast,
      variant
    ]
  );

  useEffect(() => {
    const handleRouteChange = () => {
      if (
        showProductKeywordSaveSearchFloatingBtn &&
        !productKeywords.length &&
        productsKeywordAutoSaveTrigger
      ) {
        saveProductKeyword(true);
      } else {
        setProductsKeywordAutoSaveTrigger(false);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [
    productKeywords.length,
    productsKeywordAutoSaveTrigger,
    router.events,
    saveProductKeyword,
    setProductsKeywordAutoSaveTrigger,
    showProductKeywordSaveSearchFloatingBtn
  ]);

  return (
    <>
      {searchKeyword && showProductKeywordSaveSearchFloatingBtn ? (
        <Flexbox justifyContent="center">
          <CustomChip
            show={triggered}
            brandColor="black"
            variant="contained"
            isEllipsis={searchKeyword.length > 9}
            onClick={() => saveProductKeyword(false)}
          >
            <Flexbox alignment="center" gap={2} customStyle={{ overflow: 'hidden' }}>
              <Icon name="BookmarkFilled" size="small" />
              <Flexbox customStyle={{ overflow: 'hidden' }}>
                <Keyword variant="body1" weight="medium">
                  {`‘${searchKeyword}`}
                </Keyword>
                <Typography
                  variant="body1"
                  weight="medium"
                  customStyle={{
                    whiteSpace: 'nowrap',
                    color: palette.common.white,
                    transform: searchKeyword.length > 9 ? 'translateX(-6px)' : ''
                  }}
                >
                  ’ 검색 저장
                </Typography>
              </Flexbox>
            </Flexbox>
          </CustomChip>
        </Flexbox>
      ) : null}
      <Toast
        open={isOpenSavedKeywordToast}
        onClose={() => setIsOpenSavedKeywordToast(false)}
        bottom="32px"
        customStyle={{ textAlign: 'center' }}
      >
        <Flexbox
          justifyContent="center"
          alignment="center"
          customStyle={{ maxWidth: 224, margin: '0 auto' }}
        >
          <Keyword variant="body1" weight="medium">
            {`‘${searchKeyword}`}
          </Keyword>
          <Typography
            variant="body1"
            weight="medium"
            customStyle={{ whiteSpace: 'nowrap', color: palette.common.white }}
          >
            ’ 이(가) 저장되었어요!
          </Typography>
        </Flexbox>
      </Toast>
    </>
  );
}

const CustomChip = styled(Chip)<{ show: boolean; isEllipsis: boolean }>`
  position: fixed;
  bottom: 84px;
  max-width: 220px;
  overflow: hidden;
  transition: all 0.2s ease-in;
  border: none;
  padding: 10px ${({ isEllipsis }) => (isEllipsis ? 12 : 16)}px 10px 16px;
  opacity: ${({ show }) => Number(show)};
  transform: translateY(${({ show }) => (show ? 0 : 84)}px);

  ${({ show }): CSSObject =>
    show
      ? {
          '&:after': {
            background: 'rgba(255, 255, 255, 0.2)',
            filter: 'blur(16px)',
            content: '""',
            width: 43,
            height: 75,
            left: -47,
            position: 'absolute',
            top: -21,
            transform: 'rotate(25deg)',
            transition: 'all 550ms cubic-bezier(0.19, 1, 0.22, 1)',
            zIndex: -10,
            animationName: 'diagonalSwipe',
            animationDuration: '4s',
            animationIterationCount: 'infinite'
          }
        }
      : {
          pointerEvents: 'none'
        }}

  @keyframes diagonalSwipe {
    0% {
      left: -47px;
    }
    100% {
      left: 120%;
    }
  }
`;

const Keyword = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.palette.common.white};
`;

export default ProductsSaveSearchFloatingButton;
