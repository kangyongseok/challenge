import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import type { CSSObject } from '@emotion/styled';
import styled from '@emotion/styled';

import type { ProductKeywordSourceType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchProductKeywords, postProductKeyword } from '@api/user';
import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { filterCodeIds, orderFilterOptions } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
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
import { homeSelectedTabStateFamily } from '@recoil/home';
import { deviceIdState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductsKeywordSaveFloatingButtonProps {
  variant: 'brands' | 'categories' | 'search';
}

function ProductsKeywordSaveFloatingButton({ variant }: ProductsKeywordSaveFloatingButtonProps) {
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
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));

  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();
  const { data: { content: productKeywords = [] } = {}, isLoading: isLoadingProductKeywords } =
    useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
      enabled: !!accessUser
    });
  const { data: { userProductKeyword } = {}, isLoading: isLoadingSearchOptions } = useQuery(
    queryKeys.products.searchOptions(searchOptionsParams),
    () => fetchSearchOptions(searchOptionsParams),
    {
      keepPreviousData: true,
      enabled: Object.keys(searchOptionsParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );
  const { mutate } = useMutation(postProductKeyword);

  const triggered = useReverseScrollTrigger();
  const [isOpenSavedKeywordToast, setIsOpenSavedKeywordToast] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const showProductKeywordSaveSearchFloatingBtn =
    !!accessUser &&
    !isLoadingProductKeywords &&
    !isLoadingSearchOptions &&
    !userProductKeyword &&
    !isPending &&
    !!selectedSearchOptions.filter(({ codeId }) => ![filterCodeIds.order].includes(codeId)).length;

  const searchKeyword = useMemo(() => {
    const { keyword }: { keyword?: string } = router.query;

    switch (variant) {
      case 'categories': {
        const { subParentIds = [] } = convertSearchParamsByQuery(router.query);
        const subParentCategory = subParentCategories.find(({ id }) => subParentIds.includes(id));
        return subParentCategory ? subParentCategory.name.replace(/\(P\)/g, '') : keyword;
      }
      case 'brands':
      case 'search':
      default:
        return keyword;
    }
  }, [router.query, subParentCategories, variant]);

  const saveProductsKeyword = useCallback(
    (isAutoSave?: boolean) => {
      logEvent(attrKeys.searchHelper.LOAD_MYLIST_SAVE, {
        name: isAutoSave ? attrProperty.productName.AUTO : attrProperty.productName.MANUAL
      });

      let sourceType: ProductKeywordSourceType = 0;

      setIsPending(true);

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
            resetProductKeyword();
            queryClient.invalidateQueries(queryKeys.users.userProductKeywords());

            if (isAutoSave) {
              setProductsKeywordAutoSavedToast(true);
            } else {
              setIsOpenSavedKeywordToast(true);
            }
          },
          onSettled() {
            setTimeout(() => setIsPending(false), 500);
          }
        }
      );
    },
    [
      deviceId,
      mutate,
      queryClient,
      resetProductKeyword,
      searchOptionsParams,
      searchParams,
      setProductsKeywordAutoSaveTrigger,
      setProductsKeywordAutoSavedToast,
      variant
    ]
  );

  const handleClick = () => {
    if (isPending) return;

    saveProductsKeyword(false);
  };

  useEffect(() => {
    const handleRouteChange = () => {
      if (
        showProductKeywordSaveSearchFloatingBtn &&
        !productKeywords.length &&
        productsKeywordAutoSaveTrigger
      ) {
        saveProductsKeyword(true);
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
    saveProductsKeyword,
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
            isEllipsis={searchKeyword.length > 6}
            onClick={handleClick}
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
                    transform: searchKeyword.length > 6 ? 'translateX(-4px)' : ''
                  }}
                >
                  ’ 검색 목록 저장
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
      >
        <Flexbox justifyContent="center" customStyle={{ overflow: 'hidden' }}>
          <Box customStyle={{ whiteSpace: 'nowrap', color: palette.common.white }}>‘</Box>
          <Keyword variant="body1" weight="medium">
            {`${searchKeyword}`}
          </Keyword>
          <Box customStyle={{ whiteSpace: 'nowrap', color: palette.common.white }}>’</Box>
        </Flexbox>
        <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
          검색 목록을 저장했어요!
        </Typography>
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
  padding: 10px 16px 10px ${({ isEllipsis }) => (isEllipsis ? 20 : 16)}px;
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

export default ProductsKeywordSaveFloatingButton;
