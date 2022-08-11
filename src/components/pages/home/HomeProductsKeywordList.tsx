import { useCallback, useEffect, useRef } from 'react';
import type { UIEvent } from 'react';

import { ParsedUrlQueryInput } from 'node:querystring';

import { useRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography } from 'mrcamel-ui';
import throttle from 'lodash-es/throttle';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import type { ProductResult, SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import {
  fetchProductKeywordProducts,
  fetchProductKeywords,
  putProductKeywordView
} from '@api/user';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { homeSelectedTabStateFamily } from '@recoil/home';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeProductsKeywordList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [{ selectedIndex, prevScroll }, setSelectedTabState] = useRecoilState(
    homeSelectedTabStateFamily('productKeyword')
  );

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: productKeywordsData,
    isLoading: isLoadingProductKeywords,
    isFetched: isFetchedProductKeywords
  } = useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
    refetchOnMount: selectedIndex === 0,
    onSuccess(data) {
      const firstProduct = data.content[0];
      const newProducts = data.content.filter((product) => product.isNew);
      const generalProducts = data.content.filter((product) => !product.isNew);

      if (firstProduct && selectedIndex === 0) {
        setSelectedTabState((currVal) => ({ ...currVal, selectedId: firstProduct.id }));
        logEvent(attrKeys.home.LOAD_MYLIST, {
          name: attrProperty.productName.MAIN,
          title: attrProperty.productTitle.MYLIST,
          total: data.content.length,
          totalIds: data.content.map((product) => product.id),
          new: newProducts.length,
          newIds: newProducts.map((product) => product.id),
          general: generalProducts.length,
          generalIds: generalProducts.map((product) => product.id)
        });
      }
    }
  });
  const { content: productKeywords = [] } = productKeywordsData || {};
  const selectedProductKeyword = productKeywords[selectedIndex];

  const {
    data: productKeywordProducts = [],
    isLoading: isLoadingProductKeywordProducts,
    isFetching: isFetchingProductKeywordProducts
  } = useQuery(
    queryKeys.users.productKeywordProducts(selectedProductKeyword?.id),
    () => fetchProductKeywordProducts(selectedProductKeyword?.id),
    {
      refetchOnMount: true,
      enabled: !!accessUser && !isLoadingProductKeywords && productKeywords.length > 0,
      onSettled() {
        if (productKeywordListRef.current?.scrollLeft !== 0) {
          productKeywordListRef.current?.scrollTo(0, 0);
        }
      }
    }
  );
  const { mutate: productKeywordViewMutate } = useMutation(putProductKeywordView);

  const productKeywordTabRef = useRef<HTMLDivElement | null>(null);
  const productKeywordListRef = useRef<HTMLDivElement | null>(null);
  const throttleScrollProductKeyword = useRef(
    throttle((e: UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget?.scrollLeft;

      if (scrollLeft) {
        setSelectedTabState((currVal) => ({
          ...currVal,
          prevScroll: scrollLeft
        }));
      }
    }, 200)
  );
  const debounceScrollProductKeyword = useRef(
    debounce(() => {
      logEvent(attrKeys.home.SWIPE_X_BUTTON, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.MYLIST
      });
    }, 500)
  ).current;
  const isLoading = isLoadingProductKeywords || isLoadingProductKeywordProducts;

  const handleTabScroll = (e: UIEvent<HTMLDivElement>) => {
    throttleScrollProductKeyword.current(e);
    debounceScrollProductKeyword();
  };

  const handleClickTab = useCallback(
    (index: number) => () => {
      logEvent(attrKeys.home.CLICK_MYLIST_BUTTON, {
        name: attrProperty.productName.MAIN,
        att: productKeywords[index].isNew ? 'NEW' : 'GENERAL',
        index
      });

      productKeywordListRef.current?.scrollTo(0, 0);

      if (selectedIndex !== index) {
        setSelectedTabState((currVal) => ({ ...currVal, selectedIndex: index }));
      }
    },
    [productKeywords, selectedIndex, setSelectedTabState]
  );

  const handleCardScroll = debounce(() => {
    logEvent(attrKeys.home.SWIP_X_CARD, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST
    });
  }, 500);

  const handleWishAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      site: product.site.name,
      price: product.price,
      cluster: product.cluster,
      source: attrProperty.productSource.MAIN_MYLIST
    };
  };

  const handleProductAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST,
      index: i + 1,
      id: product.id,
      brand: product.brand.name,
      category: product.category.name,
      parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
      site: product.site.name,
      price: product.price,
      source: attrProperty.productSource.MAIN_MYLIST
    };
  };

  const handleClickProductKeywordProduct = useCallback(
    (id: number) => () => {
      logEvent(attrKeys.home.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.productName.MAIN,
        title: attrProperty.productTitle.MYLIST
      });

      if (selectedProductKeyword) {
        productKeywordViewMutate(selectedProductKeyword.id, {
          onSettled: () => {
            if (productKeywordsData) {
              queryClient.setQueryData(queryKeys.users.userProductKeywords(), {
                ...productKeywordsData,
                content: productKeywordsData.content.map((productKeyword) =>
                  productKeyword.id === selectedProductKeyword.id
                    ? { ...productKeyword, isNew: false }
                    : productKeyword
                )
              });
            }

            router.push(`/products/${id}`);
          }
        });
      }
    },
    [productKeywordViewMutate, productKeywordsData, queryClient, router, selectedProductKeyword]
  );

  const handleClickAll = useCallback(() => {
    if (isLoading || !selectedProductKeyword) return;

    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.MYLIST,
      att: selectedProductKeyword.isNew ? 'NEW' : 'GENERAL'
    });

    const searchParams: SearchParams = JSON.parse(selectedProductKeyword.keywordFilterJson);
    let viewType = 'search';
    let productKeyword: string | string[] | undefined = searchParams.keyword;

    if (selectedProductKeyword.sourceType === 3) {
      viewType = 'categories';
      productKeyword = searchParams.categories;
    }

    if (selectedProductKeyword.sourceType === 1 || selectedProductKeyword.sourceType === 2) {
      viewType = 'brands';
      productKeyword = searchParams.requiredBrands;
    }

    if (selectedProductKeyword.isNew) {
      productKeywordViewMutate(selectedProductKeyword.id, {
        onSettled: () =>
          router.push({
            pathname: `/products/${viewType}/${encodeURIComponent(String(productKeyword))}`,
            query: searchParams as ParsedUrlQueryInput
          })
      });
    } else {
      router.push({
        pathname: `/products/${viewType}/${encodeURIComponent(String(productKeyword))}`,
        query: searchParams as ParsedUrlQueryInput
      });
    }
  }, [isLoading, productKeywordViewMutate, router, selectedProductKeyword]);

  useEffect(() => {
    logEvent(attrKeys.home.VIEW_MYLIST, { name: attrProperty.productName.MAIN });
  }, []);

  useEffect(() => {
    if (productKeywordTabRef.current && prevScroll) {
      productKeywordTabRef.current.scrollTo(prevScroll, 0);
    }
  }, [prevScroll]);

  return !!accessUser && (isLoading || (isFetchedProductKeywords && productKeywords.length > 0)) ? (
    <Flexbox component="section" direction="vertical" gap={20} customStyle={{ padding: '20px 0' }}>
      <Flexbox direction="vertical" gap={2} customStyle={{ padding: '0 20px' }}>
        <Typography variant="h3" weight="bold">
          {accessUser?.userName || '회원'}님의 매물목록
        </Typography>
        <Typography variant="body2">저장한 검색조건의 매물 확인하세요!</Typography>
      </Flexbox>
      <TabList ref={productKeywordTabRef} onScroll={handleTabScroll}>
        {isLoadingProductKeywords
          ? Array.from({ length: 10 }, (_, index) => (
              <Tab key={`product-tab-skeleton-${index}`} isActive={false}>
                <Flexbox direction="vertical" gap={4}>
                  <Skeleton width="130px" height="19px" disableAspectRatio isRound />
                  <Skeleton width="90px" height="15px" disableAspectRatio isRound />
                </Flexbox>
              </Tab>
            ))
          : productKeywords.map(({ id, keyword, isNew, filter }, index) => (
              <Tab
                key={`product-tab-${id}`}
                isActive={selectedIndex === index}
                onClick={handleClickTab(index)}
              >
                <Flexbox gap={4} alignment="flex-start">
                  <Keyword weight="medium" isSelected={selectedIndex === index}>
                    {keyword.replace('(P)', '')}
                  </Keyword>
                  {isNew && (
                    <Typography variant="small1" weight="bold" brandColor="primary">
                      NEW
                    </Typography>
                  )}
                </Flexbox>
                <Filter variant="small2" isSelected={selectedIndex === index}>
                  {filter}
                </Filter>
              </Tab>
            ))}
      </TabList>
      {isLoading || isFetchingProductKeywordProducts || productKeywordProducts.length > 0 ? (
        <>
          <ProductList ref={productKeywordListRef} onScroll={handleCardScroll}>
            {isLoading || isFetchingProductKeywordProducts
              ? Array.from({ length: 8 }, (_, index) => (
                  <ProductGridCardSkeleton
                    key={`carmel-product-curation-card-skeleton-${index}`}
                    isRound
                    hasAreaWithDateInfo={false}
                    customStyle={{ minWidth: 144, flex: 1 }}
                  />
                ))
              : productKeywordProducts.map((product, index) => (
                  <ProductGridCard
                    key={`product-keyword-product-card-${product.id}`}
                    product={product}
                    hideProductLabel
                    hideAreaWithDateInfo
                    hideLegitStatusLabel
                    showNewLabel={selectedProductKeyword?.isNew}
                    name={attrProperty.productName.MAIN}
                    source={attrProperty.productSource.MAIN_MYLIST}
                    wishAtt={handleWishAtt(product, index)}
                    productAtt={handleProductAtt(product, index)}
                    compact
                    isRound
                    customStyle={{ minWidth: 144, maxWidth: 144, flex: 1 }}
                    onClick={handleClickProductKeywordProduct(product.id)}
                  />
                ))}
          </ProductList>
          <Box customStyle={{ padding: '0 20px' }}>
            <Button
              fullWidth
              brandColor="grey"
              disabled={isLoading || productKeywords.length === 0}
              onClick={handleClickAll}
            >
              이 검색조건으로 전체보기
            </Button>
          </Box>
        </>
      ) : (
        <Flexbox direction="vertical" alignment="center" gap={20}>
          <DizzyFaceIcon />
          <Typography customStyle={{ textAlign: 'center' }}>
            앗, 등록되어 있던 매물이 사라졌어요.
            <br />새 매물이 올라오면 알림으로 알려드릴게요!
          </Typography>
        </Flexbox>
      )}
    </Flexbox>
  ) : null;
}

const TabList = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 8px;
  padding: 0 20px;
  overflow-x: auto;
`;

const Tab = styled.div<{ isActive: boolean }>`
  padding: 8px 12px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.palette.primary.highlight : theme.palette.common.grey['95']};
  min-width: 200px;
  max-width: 200px;
  border-radius: 4px;
`;

const Keyword = styled(Typography)<{ isSelected: boolean }>`
  color: ${({ theme: { palette }, isSelected }) => palette.common.grey[isSelected ? '20' : '60']};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Filter = styled(Typography)<{ isSelected: boolean }>`
  color: ${({ theme: { palette }, isSelected }) => palette.common.grey[isSelected ? '20' : '60']};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ProductList = styled.div`
  padding: 0 20px;
  display: grid;
  grid-auto-flow: column;
  column-gap: 12px;
  overflow-x: auto;
`;

function DizzyFaceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="52"
      height="52"
      viewBox="0 0 53 52"
      fill="none"
    >
      <rect x="0.5" width="52" height="52" rx="20" fill="#E6E8FF" />
      <path d="M14.5 37.68H38.5V13.68H14.5V37.68Z" fill="url(#pattern0)" />
      <defs>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_2881_9462" transform="scale(0.00625)" />
        </pattern>
        <image
          id="image0_2881_9462"
          width="160"
          height="160"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAYAAACLz2ctAABtZ0lEQVR4nO39d7wlx33eCX+ruvvEmyfnAMwMBhhkgARBMIBJJJVIiZR2pRUlU/ZKWr+SvX712l7va/vVa8uSNzjIytbuWmvLsgIpUiRIJJIAM0gi5wEwgzDxztx4cndX1f5RVd11ztx7ZxCHklmfOXPP6e7Tp7rqqecXqwq+V75XLlIxcJkwF7sW3yv/VRd5sSvwvfJfd/keAL9XLmr5HgC/Vy5q+R4Av1cuaokvdgX+qpYv/8aPCDACwCAM8D177hUUcc9v/MjFrsN3VWmYVs0QjXVpbm7S3jFOaz1STuZUZipiMBOLvBmhGlKYCpgIECCUQaTKyF6u4/bAVBYrIptHq6WWGZtrM3FsXHSOC5O1ge7FfsbvphJP6MWLXYeLVnqmWk9NsnVMdC8bE90DkVQHmnFnT12mWytxujGR+aSQphJJjZQKIgPSgHA3EP4/Y/nPAFqAFmgVoZTEGJHnWi6neeVMX1VPtnXjeaN4umMah9ti4okKg2NA+yI1wUUvcWb+65HCHVOLI2H2jLN8fVP0r9sUnb6hGXf21ZN0UxzniUxyiIV9Re4lhdWUpQQhLN4K4IFFnXtvPBAN0hikzkGZuKL0TEN1Z8jNAXKNyWOyLNZpHs+2s+ZzLd18sK+q31li4kFl5GGg/8a3zsUpcU/9tQdgtcLgmqbovWVTfPLWqWj5+kalvy1JUqgAFQe4WEKcBKATlu0kFngSe8yDT2ABN0SHBrQ7rglY0YAyoAClEcpQUamsZP3NY1lr8+ZUvDXPEnpp5cxSOvFQ19TvPTmY+ups1vwO0HmD2+sNLfFs968nADc2siunWLx1Jlr84HS8dFOj2p+UNWUBV5EQRZBIa4ZJUTKfZzwPRIEDYPAZyr++eDAaLPi0KRlRY0WzMqCkA6K0n3P7ivOc8SzdMD5Yfq8ZRO/dVql2F9LJ+5fV2B1LZuKLHZrfwn7zr1WJp2v6YtfhNStayMkpFt+9nrMfmUmW3jVR62yS1RyqkX3FiQVcLCDxohaIpAVcLEAYC7RoBHQeiIUIhmHD14HPCAc891c7NtSAEu6zgVyA0vZYbiATFpS5QWSGZtprNAftt5l+9LZ2v7Z0Npu597TZ+Imuqd8FnHzjWvX1LeIL/8v7L3YdXnWJTb5zjPaHNkWz/8266uKba7WBpCag5lgukQ5wlEwXO9BFlDqfxL0MSAVSW7B5w0M4kYwEEVG6UR3NGeWYjxKMygFTSdDSGs7Kg1A7YBrITMmImf8LpBoGOfQ1WT9hfjD16Jls5s+71P8MePINbejXoYj7fv3mi12HV1xSkn1TYuknN8Znf3xdZemyqK6gIaESW1GbBEzn/8ZYxouFYz5lXx5wkYBoDKJx93c9ROtATIIYB9EEUQORgIixIFRgcjApmC6YDugl0POgzoBaAtWBfBlU3zGhBBWBjhwLags6hRPLugRiigViqqGfo3sRS/2xl47nmz/1ktr0fwEPXsx+eDVFfO5ffN/FrsPLLg2R7Z5h7mObkzMfW19bukQ0tGW7SuR0PFHqdyEIIw/A3AFPQ9KAaAoq2yC5BKKdkGwHsQPkBge4KlDDWi0JhcFxThFYBKXu1QfTs2A0pyF/EbJjoF6A9Ahks5AvQZZZIOaRBaUHYeaBiAVf5sCYaegr6MFCb/zUi9nWP23r5h8Aj77ujf8aF/HVf3HLxa7DBZeebE5OmOWP7Ype/PkN9YXLZcM44AmoOtBVcH9D6xYHutR+TmaguhOqV0LlCoj2QbQNxJQFHILCjDWaYZM2tHzDEp7zLwlCBtdLIAfTcuz4PGRPw+BRGDwJgxOQtSGXoCv2b64hx4HPgTHTMDCQGhgo6BjmuxMvHVdb/o+zcuP/Cbz0+vTAa1/EF//ley92HS6oNNTyD26Rp355S23u7Ukzg3riQEfJehU5zHixdqADKjNQPwi1G6B6HcSXWIYzVSzlGCtG0Vg3SwiyUdN3NQCOvg8idCY873XIyP6OaYE+AdlT0Ps29B6A/vMwaIOKQVUsCFPHiKljx9Qx4sAyouoIZvvrHnmiv+Nfn84n/xP2W9/VRfzRP/7uNkI21bPLNnH6l3dXXvrYWKOX0IyhKi34KliwVQLGSwTEOUQDqDShsR8ab4H6WyC5DMQ0GM9EAeAKgyJkMPdZMHLsfMW5YIaA6P+OvrC/LWKnUw5AnbCs2PsatL8FvWOW9VTVWs8egF4kp54NNXRy+p2EFwZbPvWS3P3rwH0vv9XfuCLu+rX3XOw6rFqaqvXTu6MX/6ctjbkDNAXUYqiJQOR6BvRWbmrBV5mB8Ruh+W7LeNFmIHJGgnelhWIxZLbR9yux3lpAXIH9hv7qkfOjLw/GBOhD+ix0vwKte6DzBAz6oGuQSceIOAPFWLE8wOqHXcVcZ+L0c/me//0Um36L79IYtPj0P//+i12Hc0ot6+/eWpn9/16SPPez9fEMGrEFWU1AlZLxClGbQZJBbSNMvB3G3gfVq0FMgMmwNOGLB9xKQFsLgHDhDAgl6PTI5xBso2AMPhtjxbSoWDGtTkH3a7B4O7QehLQHec26dwbGMqQHYWpsMK+XkrZjjva33XbKbP6fgYdfxgO8IUXc88/eerHrMFSaW4+/f8ux9Ne2jp+9RowD9diBTkAtELUVWYra+nqYfAdMfD/UrgIqoAeUgQNvEPj3q71CMUzwmZHjo+9hbR1wtc8rANCw8jWiAjIBdRY6X4eFzzggZhaIGaVeONDDbNjOOd2ZPvqMvvRXgD8cbfOLWcRX/tlNF7sOACzHzWiDOvbLe8yZ/2n91PIkDSduq6IUuwXzGYgHUKnD5Fth+sNQvwaogu5jgecypbxYA4bErVgNhHAuIBk5vlpZSeT6v6sBz703ZuS60Ws9EGOQVQvE1j0w92loPWlFsqo4fdAD0L36Bro53U5FP5nu+zcvRXt+BVhe40HesCL+4l986GLXgcikm3flL/zzg5UjP5tM5lCPSvBVhTU6CpGbQZLD+CFY91EYfxvIJuiec5l44JxPzLqXWA184WvUvbJaGQVNeHyUCfUKhsqou2el73ogJiAr1q84fxvMfRa6pxwbypIJ0wCEPUXegucGO287yeZfBp5a42HekCK+dLFFsDEHt3H8t/fWjr8zmhAWfFUnbqtYn17Vs14f6jMw8/0w80OQbLOi1uRrMNqosbEWEFnluzAMUP/XjByDYV0uPDYCKqPPPVYAEM5hvlFxbQwIg3WSR9B9CM78CSx8A1JlLeaBs5Q9AAcGugo6ihOdmceeEId+HvgaF7HEOclF+3FjuPkKHvu9rc35Q4zFUJcl69VEmS6VZFbfm7wONv4ENK8HjA1xAfhEAOHF7kqsthKLBaA0I9eLlQC4GvuNAnAFC3hFEbvaC1a2lt1xD14DmI59juaVUN0Fjdth9s8sG1KzyRS+ihIgAinYKucOyfYjf/I4V/5d4M9XebDXvcRixZDS618yE33gah7+3S1jCzsZiy3j1QLgVbF/4x5UGrDhw7D+I1DZAKpL6b8LQGMCkIlVgDb0nVGRDSsDEs4BoKD8PORkDt+vBqJRwI1e579rgnuv5r4BUKBSK5LXfxhql8DpP4LF+50lHY80lQRRYbNY2FZpP/AHj6orJoH/g4tQ4lgP3vAfzUTy0et56Lc2jC9tYKxaAq8wNgRUDER9aO6ETT8Jk2+3ozlkvRX1uJWANsp+o8A0nAPAFUVw8HnVcWtGTq4EmLXAN8KcYqXrAgYcct307LHG5bD9l6H6CTjzWXucKkPRHQGIhBnRmby69fC/e1wdHAP+7WpP9XqVOB7ykb3+pS+bP3aNfvB31k+0ZxirlMDzkY2KgFhBlMHU9bD5Y1DfD6ZvRU/BPJ6lTKlSAWAwjr0Ewo52JEK69CkRulo0a0ZAzvk7CsoQaKFOqFe4ZiUAjuiBxhsnNrXLOFFr0AhMASA73oQDJ8F33UunENXtwK1shVN/DJ3TUKmVdRV+0CVM0a9fufzE//aYvjwC/hVvYIlX02pej9Km+ZHr9IO/s36sPUOzasWsf1UofXuJgfXvgY3/LSTrQS9brwrCGY8aoxQ6TzF5Zv/qFK1ybE6etxQjEAkyriDiOjJpIJM6UVQFGa3AnCtFRUYZkpH3YRlhr3OOjbxMaWAYrdD5AJ110FkPk/cwaoDROdatJBAyhihGyBgZVxFxBZkkyChBiCiosgHdBSNh6laI18OJ/wCtZyAJQFjMYakwYQbxodbj//JRfYUG/s0FdOdrUuI3SgNsickPXKfv/+314+0ZmhWb3VQA0IndOIVKAht/ANZ/CKIqmGWQYJRB6wyd9lH9NqrfIu+1yLot0m6Xfq9L2u+Tpzl5rsCAjCRRklBt1hmbnKA2Nk0ytoG4sYG4PoWsNBDSp1cJhhzXotDaWdsahpWB5z+bYXYKj6PRKkMN2uS9RXT3DIPOWXpLC3SXW/S7PbJBBsYgY0FSSahWEyr1OtVmk0ptjKQxTlSfIKqOI2sNZFxBCsf8JgOTQvMgbP/bcPIPYfFB2+hGWIAWdUyYII0PLT/56w/pq1q8QTphnJvX3wpum+rN14iHfn/jeGuDBZ9wwPPpU8JmrVRqsPlHYeb9tu91G2M0Kh2Q91vk3XnS1jyds2c4OzvH2ZPLnDyxyOJcj04ro9/PGPQVWaoxBqJEUKlE1BsJk1N1tmyfYM/+rWzdu5uJLXuIJ7aRNKaRcZVzRKzxItofEo4I15AZKxojK/01gCIfdMnbcwyWjrF06nlOHjnG88+e4vTxJZaXBnS6KYO+HUxxIqgmEZVaRH2swuREjfUbx9i0dYJ1W9YxtWE99ekZ4uY0cX2CuNJEiAQhBOgMaltg298C+R9h/pugEwtAQzltwCRM6n71iuVH/9WD8vpl4M9eRbdfUIlTWXl9f0Eml12VPfz72xoL26lXApHrdL7Yg68Om38Mpt8FJkXnfVTaI+8vkXfP0pk7zannT3LkqTM8f2SekyfbLC+m9Ls5ShmrEnmPg3tjJYzBaFAKkqpgZt3zHLj8OW569yEuufYaBLuJmzPIKGHYKAldNFAC80IeeiWxO/xZpV2y9ilaJ57lyfse5qFvHuHocwsszHfJM42QIIUo8e7VRAzKgESQVCXNZsyGjQ127Jpk9/717Nizkamtm6lPbCCuzxDVx4miCsLkEI/D5p8CkcCZr4BJwETlBCoAnbBedScOdR75d49FV88C9768Dn95JV5zRL/KMq/H112bP/I7W2tzV9BIhoFXZC2n1s2y+cdg8haM6qCyDll/iax1muXTJzjy9DGeevgkzx1e5MyZPmmqbVZ9LKjXJJEUrsOGCcpg21VrUNqQ5Yazs11OnzzKC0eX+fBPJ1z9zklMtW6zpYdErmJlw2QlfdCMHF8NeP5jjslbdOeO87XP3ccXP/MI8/M9oliQJIJ6NSKKhH0eOfIr7nm0NuS5ob2csrSQcuSZRb7zzeNs3THOvoPr2Xf5VrZfso3mzGbi5nri2jhSphDVYOOP28eb/4q9uXbiWBuoGtAJW/TSprzzyO89Gl37IV7HiEmc6eh1ufGjszJ55/Qz/+ue+kvvjBpR6dvz+p4Pq1VrsOnDMH4TOl0mT5fI2nO0zx7n8CNHuf++Yxx+cp7W0gApBZWKYHJcEkfCTulwtkTBgAYsTzgGNE7CaKjEgkoSMRhojhye445PPcj2K69m2wYPOA+SUUNk1E1zvjIKvBCkVvxGkeTJh49xx188zNJin2ZTUkkEUeQn6Rk7qDwAC+vf3kIbgTGCXNnJdXlu6HUVTz02z3NPL/LAN05wxVUvcd1Nu9l+6U4qU1tIGtNESYaQddj4YasjFuJYhNWDRsxWtXig1X/u3z1ZvfajwOLLAsAFlrgXT7we9+WmmRf+7hXxs38jachS1yvma+Dy9hLY8EEYfxP5YJ6sO0fWOs3x517kG19+jvvvO8nSwoAkEYyNRVRiQRxZ0NmFCoxVFY0CNyFt1AD1+r/RuPm45dyjpeWUTDQgqdp5Gef4Fn0ZBV2YpLCS4TH6PhBxGOsNqo8xt2iYP9unEoFQuvhZjzUB53iewF4TS4EQkiQWboAJalVBnksGuebk8TanTnQ4/ORZbn7HLNe86VImNm8jHltPUhtDygZs+BCoAcw/AEnFAVDY2XlGEOmIS/KX3tNNx371+cr+X+TcGOOrLrG5oBH98sqEWf6+K6Jn/vFYU0MtCQwO6cBnrFtl5u2Y8ZvIunPkndO0Zk/w2P3Pce+XnueF55aRAibGI5LEAU9CJA1oZSehOcnRaDapT0xQqdUYX7+B8XXrqDWaxLUaINBKk6UZ3XaH1mKLXndApTHOlbdcz9Z9uwEFInd4ceBaMRIyKn5HS8h24bEVGFHWuPF9b6PXzjn70ikiCfVmjcmZCeoTTZJKxSoCWUba7zPodVg+e5al06dJux16rRb9dtcOLAmRFETSAjJRkmosSVPNC0eXmD3zFC+9sMQt71xg+76dmMnNxLVJ4soEbPhByFqw9IwdiNpYKaUNKEm1aTjQOvwLy4PmQ8C/f+WoWLmIL/yTG1/TGy7GG7ZfnX/783sbZw6JscS6W+qiDLVVsKJ35k3odd9Png7IWieYfeFF7r3rMPd9/TjtdkajHlGrCKIYpNAI59uLI2hOTTC9cQObLtnL+p3bWb9tGzPbtlIbb1Iba1Kt1YmSBIvy0tWg8py0n5JnGUk1ptaIgQ6Ynhv1sHokpGiy87TAKAjDv87xLATEMdAEKvS7yjJOHJFUR+utsO6alEGnS6/dpbfc5syLLzL7wkucfek4J58/Smv2DP12D62dd4WIXAuyHHp9TaYMe3ZPcut793DlDZfQWL+FpDFDXJ2yKf8n/hTaJyCv2MSFVEMP6BnoZBxbnpi9T1z/QeD+lwGH8xbx5//41tfsZqoyEV2SPvkHhyqHf6Y6Hlvg+Veh+6UwcQCz4cNkSpAtH+P5J57n8595gkcfOYMU0KxHxLFBGIXQ1nqdWD/Nlr272HnFZew4eICNu7YzvmGaOKlhOzYfeYX6l59x7iYC+bm8DKyLQuth0lrR+BjNDVyt+BuNRkNG9AOBU2Cr2FlT3u2jgvrr8GL3Stz1tj6Dbo/5U7OcOnyUlx5/mpeeepozx47RWeqjNBgkCkk6MHT7ionJGm9753be/p6DTG3dSdKYtiBsPwUn/hz6bcgSl9SKBWDXkC9nPDPYfs+T1et+mNcwlzAW1fHX6l6sz07/xF5x5GPVughiuiJYdyWD2iaYeRe5lqjWcY4+8Tyf/JNHOfzUHPWapFoVCJ2Dgol1Y2zbt4tLr7uKPddcwaa922hMjGM7J8XqxSl2Yrim9OxD6T6hjHiEkQ8TnDejOh+sDEJWeB+WlUTvCk5qbx2ZFOiV0Qt/rsgV9D9nRuwiYaM8JFQbFbbsXc+WvZu46r03MH/yDMcef5ZnvvMYzz/6FGePz6L6OUksGGtGtJf73PG5o3R7ig/8cMTMNoESEDUvgfVvh1N32AEZS2vdVGzzxnXJjvzEO+fTmf8R+JVVGuBlF/HVf3LVa3Kjs8nWPVcNvnXXzsb8JdFYDE05nFSaKKhWYfMPYJqXofpnOfbM8/zx//UtHnv4NI26JBLWvbJx+zQHb7qaQ2+/kZ1XXMLY9ASWGXrYyd6ZBVzovyr6a9SdsppIHQXXagCUazufVytFmG0lEK7hojkHuHr1a/2qXSKyoUUqQB2okA4GnH7uBEceepInv/kwzz/6LMuLfTSCXmpASH7ghy/n/T9yPY1164niMdues3fA3HesKB5gmbBnxbHpZJxqN5fuj970AeAbL79Rzi3xglz3qm/STabEnv6T/2hzPH+J9BPF4+DlpcfUddC8FCH6IA3f+fYJHn3oNJEAk2umtk5w7buu44YPvoXdV+wlihMs6E7adCPtA/UwLBJHweQ6atVs5/D9aiD0n9UK4nmtsppVvBLQwuOrgdOljJkVvu+XgSMtmVEugkyoVGvsuHwzOy7fzjXf9yYOf/sJHrjzPp769lPkC306Xc2Xv/Q8B669hKs2bwAGds7J9JuhdxpaxyCu2GVDEmEXTarGrE87k3sGz/6zxyrX/jCvwdJxcUe+ehE8mc1/cJc5+lPVukB4N0tCIHpTaO6BiWsseyUGRIP5jvXXbd4+zeU3H+QtP3gT+2/ch5QR0IK8A3leOvOEHMGNB8NKYPQiVjhvrmF1kIWfRxMSCL7LyLXhuVFwhed98assBINkRVC692ZUj1wty4ZyUSQA0wfRsW6DpMrkuiY3vv8GDt50gMfufYz77/w2Tz98lBxBxyRQq0E/tQkM8RjM3ASDz9tpDnFUABAliOuSbdmJd5/ONv4N4Dd5lUV84R9f/6pucDbZOnFocP/nL62duDkZjxF1YUVvXVjXS6yh1oDN74fGDhApJDGM1Xj22XmOPnWG3Qd3sefQduIkAVrQ70GelTodBKuUEuDmfMkCgRg95xzD14mRz+fcj5Fjo0y30vGV2DD0CQbHzvnOGqJ3lCWHdF+GVROEWwsxgaQJ1FleaHHkkRfo99pcfvU2JmoCOs4ToJ3Bc/abcPZbkEUupd9NdOpB1s441pk6en9043uAIys0xAWXeF7MvJrvsyE/8bEt4tTNUU0i/OpTfuUpb3hOXGGND+MUbm0gE1x61SYuvW63bSSzDN0+ZHmQTuXuIZw4NdoaDNKUf9c0EjzzyRXOjzCYESPHRfBnLUYcZccRY2P02IpMtgpQh96vIr6HjC9XD7+ejRHOQZBC2oeoC5UKE9M1rnnHXiCHbgdaXeyE/WCATFwO3eOwfAyi2PZpDsQGWYnY0F/cs1kd+yXg7/IqSrxZHXvFX36it3nbdY3nf7FR1YgkcWJXBquL5jYLY2w/xVIYRtilyQYGFnKIWxQNqZ14Kiw9p+8ZByIfJvANrXSArVB8elCo4K+/ZlRsj4J4BGwmeF+UFQC8apBgLd1v9Bpfdz3yeVSMY9vAgw8YMsaMF9+iPKeNlSrpALptChUlV/ZlglCkyW3MePIQ9M6AysqVxWKQiaBSg12dF3/64eQt/5FX4RuMF5Ntr/S77Bic/Ph6Ob9f1iSyYD6cq03ZFUknLrPZuTotGcsY0ApSYacQ+lVJJZQ6m3vvi9ZOB3S6oAwaF3D5W8MVLIyQUP/zr9DHxsj7lQA3ynRr6YBhWQt8obgNrxlhPzN6b7PCV3R53Iz+himBqbH6nHafw/sX7iFjZxtWt1jdPX3KsSA2dpaArERMDzpTm7IXfhH4mVUe/rwl3pS98Iq++Hi6bde76ic/XkkMMo7cEmg49pMgMqhvh9pWqxRjSuby4kE4IBRSRpSiVoRGhDtPbsFntNPlA2AM7fu5EnuFInXUaPF/R/W/8LgZud7/wKixEV67EijNyCs4vqrIDr8nSrD59tQeQCP+w1CHDn8jvEZ7tgy+Y6kRRAxjl0L3BKi27Ve3e4CMbeRuS3bsRx+M3/x7vEK3THwqemUMuFGf+dgkC7tl1bFfuNZypK3C29yLbbDMAUqUwPGfoRSrxsdhnc5XnAzEpTEBIUnKmXA6AOEokALAmVA0M3z9qgkIq+l7a5WVQOSfwR8bFbthCRk6AGuBx8A9YwIAFteIUpcu1BhKUIZ/wwXVQ5DqHJIJaO6CweMlwUQCERtEJWIy7o1tUsd+jlcKwE2vQAecrV+6ZX9+6qeSxCDiyC1158SvFCAUNLZCZdqynxGcE20wwlpc3pnqG6zAWshSuhSnOiutYaMcCINLh4wG/34UcL6MOKzPYcxRdhu990pl9NqVxO4oOEfBF17r7jGk4/nTo+Jz9Ba6vL0JJU3w3VHxG/6I0UAE9R1QOWZXc/UAdCwYV2FT+8QPP1J/67W8gqWC49PVPS/3OzT7Zz4yxcI+WRHWAT+0oYtjv/p2y0hauaS2kU7Wpkx2Cy3QgtC00/Ocbhcyps5Lg0SoEpzGjGSleis4LCGAAmAD5wJwpRIaL/661dhuhc8iZMDR86uIbG9UDLlbzAhuQ3YODZXAkV4soG6GxfaQ3uhEvPZiXkHcgMZ26C8HIXWBlAYRS6bj7tR079hP80oAON17eQw429w3vlEd/8laRZfsJx37ecu1tslSt3Eeep8zZEY614TA8gxHYWCYXBenpHTZp6G+ZwLQhSAyIXCdyC46yAPI/jVKYZQV+UJGbvpmWEKgwYVt1TH6HV802rmZDCAiiYxCQIeWa3AbOJextA7akxJARmOUjRgZLV3TiNLoKECsz/2Nwn9Y0GZ58+omiF+CbLnob8uCkiTRbBic+NF706v+LXD0AhqoKPETvfUv53p2J2feNcPcDaIiENK+ym2tjJ3JVttoH8A4dtLunDcspGMmgxO1Xif0jSvQOifvDzAqAymQ1RpRvWoNHiRDI9bhu2ho4dSAQt+CEnhljFalirzbRQ/6ICSy1iBpNpDxWhO1Ro2Q8NhK7OcBpcgHGVm7RdbpIiNJMtYkbtaJ4njk+6YEVygyQ2s2dDT772mDGmTk/R5kAwwRslonqcQIohXEbPgDomwbn/df/FZuZW19IwwcAKWxolgaTCJZn7S2X1brfgj412s03jklvmziwhfOPJlsF1Pdxz7ajLJoiP2KDV2MXZ00HrPsV4g0ZywYJza1CYxL997I4rPKFXm/R/vsAo/df5aJqQr7rtpIZWqSeKyGPKfDcCAPRHFBqg6sYlipV2lG1m6zfGKe+798grHxhKtv2YYwM8TNZvAbL7eEotB9NpAPUvL2MgsvzvKVO44xva7KjbfuoLFhGppNosT9nlEMLTFSANDVX488dyGODfkgR7U7zL10lscemGXb9iZ7Lt8IY2Mk1WoxWavQCcN8iYIhKcUvDIv+2jqIT0Dec+CzLChiSSXKmc5O/ejTzet/n5cRI45nKxduBVey7oFpfeY9UQ0751taZbTw/8oYao5RQ6ezNC7E4yIbRYDdjV7tRLfAgq/XI11u8cDXTvLHf3ScmXUJP/U3FPuuNiDGiZt1ZBTZ7xYgDkS5P1aM6uEUepWmZO0Ondl5vvy5l/jkfz7J1HSClJqrbzEYo0nGmsg4NFJWEqvnitjh4sCX5uTtFsunzvClz7zAp//sFNMzCTIy3PDOnDo5otFEJlHA7JTqhGc/7Z/JDGEQYyzAW11ap+e55/Mv8Zm/nGX//iY/+THDjn0KmuMk1UoZFg+NGo83g/sNr/+Z8q/W1p9bmYZBzw7sSFkcCOucnk7nbmjmS28B7l4NQ6MlbuZLF3otlbz1fROyvYkkEL2Skv2SMYibFnxeFBaNiBt1sgSscczorGCVa/Jen3R5iQe+Octffuo0C4s5i4uKT/yX4/xYLNh7yIaZkkYNEcnhCprgN3F1M15ntGC0zGfBd89nj3PbJ06TpobZUymf/KNjyAiuvFkjZE7caDgQjhoaqxko54pklWWoTpfW6bN88dPHuPO2MxgD82cz/vJPTiAxXPd2Deu0E/8xZaeHgPP3liUrOYbMBxmq1aZ1apEv3XGcu+48y2BgePzxDp/4k2N85McN2y/RoMdIahVE4b7xfeN1Q2GNxpAJC33R2N+uTkPnDMgcv6WZcLtNNaJ+dSo/84O8HABO5Wcu6MLjye5kkzrywWqsEVFk6deDz4u+yoSlRp0HFqxvKK+r+Qc1FhgyaIg8I+t2efC+s3zqL05x9syAqYkIreHw4Q6f/JPjfEQYdl9uleykWUF4w8QbJx58XqcUZQeqzIHv9BL33Hacz3/qNOlAMTkhMRpOvNTnk390HJHEXPW2KlG1YlOSVgXa6LERXdAYUIpBu8u9nzvJnZ85hcoMk+MSY2Du9IDP/vlJjDFc/3Zbx6RZtQaX1wPPMbJVEMUQqEGOardpzS5y752nuOvzZ0gHmqlJiVLwyCMtZHScj/54xPZLI7QUREkUANDdt7hnaJw45vMiWTuLOGlCumgBIA0iMohIEseaqf7s+56qX78RmL0QXMWn4h0Xch1V3b9iUi/cKGMY2j3Sh8Siip347FOOPLsVBkOp45UO6BAwmiiBp59q8Wd/epz5uQHj4xFxJBBArSJ55qk2n/rT43z4x2HXQQM0SZqOCb2vsXDteDECoFCZsuA7s8CXP3+SO//yDCrVTE9G1nYxkMSSY0e7fOIPX2TdrnXsu3HCsnkhyt3z4Oo8VMzIe/udqA6PP7zE5z95nKyvGB+Pid0yLrWKZP5Myuc+eRKB4fq3GdATxPWK0wllCRR/38Bvp9KcrNWlfWaRr951mi/ceZY81UyOy2L8JbHg4QeXQRznp/77Jlv21gKJFIBw1EAZtYa9K0hISMZBLrtx76UgEAnGWd7X0O23AJ++EFzFDX1hm3XHqv/2puxOE0vLfsI/h5u9H9dBVsoOO8fM92D07gPp4rvegAHqCdXpMeJaQhINqCaCJLGntRYkccThpzt86s+O88Mf0ZYJMSSNaimOvXO7aEiNShVZp0fnzDJfucOCT+ea6SlJ7AhUKzsXpxLDzNYJmpun7Q6bvXB+htNVfUcUzzVSikFln6m+YYLJdXWWT7WpJhTPZIwgTgSLZzNu/+RpJIZr36qozYxBYR0HIrKQJs6Cb3XozC7xtS/McvcdZ8kGislJSeI8SUqDEIJBDwY6wtTriEpkHzR0yYThOC3KzwYKo8gvE2eEZcEoAZE5YWMNEmJBTabRmFq4lQsF4JhaOO9FJ+v7ol3tR25NpLap3wKQwlpVwjV20nBuEOVaVwZidsT6LRRt36FY3VAbDr1zKz/TrPLJ33iQ+ZcWqTZiYmm7P4lByIjDT3b59J+d5EM/ZplQYIgbFWsQjYjgPM3I2z06Z1p85Y5T3PnZs6jciqhKApH7TppqTK647tad/Pg/fAubdzcgbdkBFeiQpfditeyXwEgwEpThmlv3YEyVv/g397F0YpGkHpPEAmMgjg2RlMzPpXzuL6zUuvZmRc0YaNaIYhkMZAe+gX2m9pklvv6lWb5w5xzpQDM5KamOPFM/V1z11s185BevZtveBrT6DlTeuvVGDiUT+jkpIRC1938aK+2iOka4EKsQzs0miSLNeDb/tmea108C5zUw4lMXEAmp6P6Ocb1wvfDLpxRuFwesKAFZp3DSaq+7eF1Plg8nvbWqAstVWyBmQBpz9a1bkbHkE//rN+mc7VCbTJDC7uUnpUEIyeGnu3z6z0/yoY9qdl2mMaZJ0qiUTGgMeabI2306Z5b58h2nueu2eVRmmJqQ1KrCARryzDLKlW/fyY/8vZvZuGsc8kXI0jJiEEYwpB9FIdN61SJU2oxNf6pHXPuunUhhuO0372P59BJRJUFKiP0SHEIyfzblc39xGozh2psNNaOgUSOKouK2apCTt7u0Z1t8/Uuz3HX7PP2eZmJcUK/ZZ5ICstygMsVlb9rMD//S9ey6bALOtmxK1pAoD0N0fuCEAPTHA0AinMSzPkEjROn7j2AsXT7YyJevBr58XgA28uXzAjAy2Q1109lGJEq3nihfIqpYF4zOKfL2Cv3PgRBZsp2Jiv6xx90D5im0LBivvGUjanAdt/3WA/QWujTGY6TELT1m7/f0E13+8s9P88MfhR37NdB04hjyLLPgm23z5TtnufNz8+jMMDlpVxCoJjZ3QilD1s+57Obt/NDfvZENO2qQzcEgLYP5RYe55x8KhowYHoycyzSYNtQVV9+6lUjcwO2/+x2WTi/TaMbF0iJ+Obj5sxmf+9QZMJpr3pJTnxmHRh0ZS3Sak7d6tM+0+PqXzpbgmxDU/TNFYJQhHyguuXYTP/C3r2XHZeMwvwy9vpvi4OqsKSMqo0ArEhTClzdIhA04iBgj8kIMW+e0pEavXlftN10QAOvq/DpgZLIbKiKTQynx+EYDZLVkskLXk6U41mI4hFocNzZv0A8fY2zyY8tOxr7mvdsQEXzegbDejO0OVoVlK3nqiS7iz2f54Y8Ytu83YBQykeS9Ae3ZFvfefoa7b19Eq2HwxRFobUi7in1v3sH3/50b2bC9DoM56A8ci5vyeQodKHj+0VJg0Fux7uIU0Ck0Mg69cyuI67nr9+9n+dSyVTFi35QehCmf+/RZjDFc+xaoKY1MYnQ/o3OmxdfvOcvddyyeA744BqMNg75i55Ub+OD/cDU79jdhbhG6qUs8DZnPvxfOhenFbaBzDs3u0+U1fu1pMmtvOlwYKUhiTTVbevOD6tIVkjSHS/xEf8Na59nQFJU9/Seuj5yVgxQY52OzDCgxMkEI7QAVBb8pyg7TylLOUFzYON0+iNtqYXeEXO6ANFz9rq0INLf/9oN053vUmjE2aGBZ1iB58okO8pOGH/pRzZa94yBj+st9vnzX2RJ8E+eCr9/N2XvDdj74Szc48C058Hk9yLdCQHkFAEPG8wcdMo0aPmeATECnC0049I4tCHEdd//+AyyeWqZatyCs+TZDsjCXcftn5sEYrrouJa4mDFop3/zqAl+4a5HeCuDDGAY9xbbLN/D+X7iaHQfGYW4J2oNSnPr6hNGQQscMRHOhxwYDr5TVIAQmcvvZ+Ud3LyGgoZcOJUKt5zzumDgR5wuuR1vqur2PhMJdh7N+ASt6ZeQa3Vm/nj2MF8dYIwPtlkFTpfyW2MX7IlF+H+y1Sx0wmqvetRUh4PbfeojOfHcYhMLqhE893iWKzvLBH8hZv6HCt7/R4ot3LGA8+Col+Iw2DLo5e6/bxgd/6Vo27KhAfw56Tufzq6MW1nQIRobfrxgbDs6FHZjmVk0Zy7ji7ZsQ4hru/v2HWDhRMmEIwsW5lDs/Nw9Zzp7dFR56uMe997RI+5rJ8WBAefB1Hfh+/ip2HBiDuWXo9O3g907t0PGsxQjI/Ithses/F0aJxmAgSjA+LixKo1QLaIreru319CDnA+D2xtqLlEudXV6lt3WlnQ6s5PT6nPf9Kfd3xIdVWLsiUOIp9Q9BmeeHe+AstyBEc+WtmxHiaj7/mw+fA0KBIRKSp5/sUYnh4MEa93+7g1bWMqxVBJUAfP1uzp7rtvLBX7qODTvr0Fu00xJVXuJIhNk7/rMp6y18x4UAXEkfDFkFqxO2OjBmuPxtm0Fcw12/9xCLJ4eZUApBFEmWF3O+cm+L556JOfzMgDyzzFerCCp2yWgw0O8qtl22nvf//BUOfC3oDCzgi6iJ7wMdgM89hxHuePDen9eaIZHsPhsbj8UUS3i5JogEVdJ6a3HpIOdZ4DJuLa5tKU834/2JSRPj0C08x/pVSIW0/VWMFK+f+c9eHwq8+0UGjOscb7RobUHorWiR2/1xl6zuceidGzHmSm7/rUfoLvSoNmIqse2sOLLLzhx5rs/xYykqN0xPSioVaxl65bzfVey+dgsf+MVr2LCzCr0l6A4Cg8MDaEQymBBg/nMxuljh4pEiyu9kxs5EG4PLb9mE4Gru/N2HWDzZotawA0sI606pxNBu5Tz9dI4QMDUhSGJBHFuNxoIvZ8v+Gd73c1ew47JJB75+CShfpYLF/DHPcgHgCib0xkmgB5oSiMZnOjkPR9H1TjxLcjbUsgNrQAuAeEMtW/OCyGT7IqExjunCLCEHd0C7BBRPj75GXmF17wuCUBSRkbDD/Hf8vYVrnFzDsl3c78pbN2H0IW7/ncfoL1qd0KcKVhJBrgxaaao1QRQLYhcyLMG3mQ/+0tVs3FWD7hL0BtZj6x+noPaVZK4ZrltxKGBFCJhxFfFsPAjbMKY4eMsGjLmSO3/3EZZPt6k144Kxk0RQc7aDlPYVBY6Gflex8dJpvu/nLmfXFWPW2vViN1xFYiihNdDlfH1GoyIhEIf0QR2IYSinzrqXFIWaNk7nsrnmJQnWwbZiidPm5tXOoYyurO8cuXTU6i2aUkg3SJTtD+1Wf9RR4Ix2YPMx4EIc6UAcU7KeNqXjOpxamGtYtqljV71rE1pp7v73T9Bv9ak3IhKEayNRVFW4EalyQ3+g2X3dJj7wi1eycVcVOovD4CvAIYoxdG4pRlP5MTSLzei1Zvh8eApj59m2chhXXP62jRhziLv/4HFap9s0mpGL0gx/1/eA0tDrKDbsmeR9f/Mguw+Nw7xjPhUkESAotq4IV0Ed1feGiGPknO9bB2Jj3Eqfzgi07FcCz/uHY9Xf3pf1CWBupdYEiPuyvto5tDFjiR5sJSoptnhR9hVaYyKB8O6XQh80/gJKfyB2GBvj0rRkmaxaKJembBTvANaONZa6YOCad6wjSi/h3j9+ln47o1IVjCYzu1wAlIF9163jPX9rHxt2JdByzKdH5ooYSmpZ0dcyCj5/OBBrK5aQbUYOa2fxjxmuePs6IrOPe/7wadpzfcvi0TAG/TPluWHLnjHe8RN7uOTKMVjoQLsbgG/E4FiJ0X0CwhDoRkKohSTz3zEOhM4l40a63/KtJCdIdG8TOtvCWgBEry6ChREbE9PfUDgah066/wwYNMIIjDGIIiIQjCIfDSly0VzFtSmzYbQORk/Q0TIqQSgN5Bl6bhm5BJfvjzl66RhPPTCPjIyNKkhR2AdKW/ZLqhFXvWmCDVMD9PFZOz252MRvBfFZDJzwxBplLeytpieGPZUqzNwyIm5x4JKYl64Y56Ev95HCRUpkCX2tQSuDjAT7D01w6Xbg5BxGmVIPhxJ8ykuR0Ajx0ig4do4RErJgmJBgd25C2811jHsG/7doUwHSpNP1wcIu4LHVWieuDxZWbTolku1Sp9PnqDNB5xgMosh+8RNgXLpPkZvnKlWIqmCIFSI67BUPYuenKkSyTT/Kein9xQEPP9ThyFMt4lg4q9EuXO5/wmAV+V5fc/8XZ6maAVt314mbNeJG4uZjjNTJD7QCIGuia6RRQtpYwTA551YWJHZqQJ/+Usrhxzo89+iSy9EQLlxXfiM3IKRddvipBxeZrCv2XFqnOl4lqsVEkcusDi1XXyVvaHjmKwySUDUK6+u/WwLReB2wvJEj0OHvGwFSqzhCbVyr1eJojUk2cd7fgDHVIdWhqJtwzWzBZ/cz8xZxwGoePKE+VIhX32k+GjKi3Aso3TpW7OSdAe25Hvd9Y5lv3ddBSsPkuDi3v13xkv3w410W53Pe9d5xdh+09YubcZl7VwAorK9gVAdbu4iRvyHoVhLTApVpsnZK92yXh7/V4htfbTHoaaYmhp8pnDJjBYXgpRd6LM5nvPWWMS6/cpzaTA1q1n1TAsR3ngfN6EAhENNeDw8MloD5zhHVvk/9mA3VM6wlrIVcM9IR6yKt6NwijZmSJg8Gro2ClJ9DvUFgjF/LWQDSGsheH/SZMTpku5ApwghJaAlbcZDnmrw7oH22z9e+2uKrX28jhWF6QpZtqA1KGyeiZNFWUkBSkRw9mvL5z7Z4vxbsvdyAqTsmdJ0i/LNQgrBg8BCI/mChU5T1DU+HH+zIdO/tdSrLyTsZvbNdHvzGMvfc06bfVUxNylIV1sbOZgiwgrEaTaUiOTWbc9fdbbIMrrrGwLRG1JNytt2QXicYYsVz6uhZ0R8bTVSw9zKOCY3WAfOVldTupwSOxNYocZz3Vz2Zysq0RA1Ha4J29sqoMSC8DiEdkMKG9zqVfzDtOkP6VvaGSO4MFAqTHuOyWnoZ7bM9vvKVZe75ahcwTE+IIi1Pa0iV3VujUk9I2zlaiII14hhqVcGR51M+85klfsAYLrkCx4Suw4xnYx/CDAZIkUQbMqa/hvJzKMqHOodSFzYCnWkLvvkeD3xzmbvubtNpK6YmnBrhVTiF3XpMW70PKYustiiCek1w5mzOnXe30LnmmuvGYAYqNfdMXiH2YtcPqkKKeqkU6oPhq+xHYxQGt5CRN0Iw53pwnGIGBqkGM6sCDIilWn2/4DhiyjegLm4asLHw6qcp9fZipJgRxvf6oC4PFv3rrGRMGQoTgFbkmSbvZrTnB3z5Ky2+8JUuRhvbUZEobJl0oNG54cr37mTfzdt44DPPcuQ7s8QVacWBgEpF0KjD0aMZf/npZX5ICC653DZYqRP63g8GUbHkhxc9lOdWE2vFpiWhk8w9YqbIOgMLvvta3Hlnm6UlxdS4dTL7QFGeGwapZtO+KbZfPsMz3zzF0ukucdWqOlJYP2GzAWfnFHd8oY3RcM11AjFjSGpxwIRh34jys29zZGAVB4OnGGMevMZhwBkigVph1TIvQWwfRiabnG9eGjbQMMaWGrtWOg7ARO9Y0/50WeHivVM+i9EldaEHlrTv46mBKCt0K+euGV2uAwoyyXPtmK/PvV9pcbcD3+SEKHYVAshSg8o0V7xjC7f81D6a0+OMzUT02hkvPLJAUrdzWOLYMobWcPT5jE9/aokPYbjkclu5uO7EsYBzWLwowQDCXxc81zkWW1Ac+NLOgMFCj4e+1eL229ssLigmxgXVqo1wCJcs3u8rNuwe560/dRm7r9nExksnuecPn2TpZI+kFlkDJYZqRTA+BnMLmju+2AED116rqc/UqdS9nuuqWCx5ostjftqEp1Yo2dBbz0EExTggGu+YxmPWsWHgxRBaNWM9SGDljallrAes9hJGFU7CgrUN6GI0W140gUJqhkI37oGHKD1UaELrRpdWszLkqSZvZ7TP9Ln3yy3u/nIXrQ0T4zYOmsRWWqvM0O9pDtyylXd/fD/NuoL5WTbuqPCev3kZWy6bptdRGG0jCJUYGnUYHxMcPZryqU8v89yTbfLlLnl3gFZ+VphXxIORbzyjhS8x/H7I2U55H61Rg4y03Wcw3+PB+5b53OfaLMwrxoNk0siBr9dRTG0b450f28/uQ2PQX+bgW9fx9p/YT326VjxTLO2GU/WaYGJMML+guONLHR58oE1vrkfayVGZGtEozHDb4zpW+P7xfTPiIfD+v6HMmlKsO8iVXQ8Io+pSD2KpB6z0iqVeXQQLo6r+ZkNKMGEbe3lcKgKFg9o/pHSjyE8iHbKCnRsm6DOVafJ+Tnuuzz1fafGFr3bRxhQZIEVHZYY01Vzx9i287+P7GBsXMLtk8956A7ZcMsH3/dwBbvvNpzjx9EKRcQICU7dgOnIk49OfWuZDBvYetPWPGzjDpGzQYXfNaBkVx2FD2f9Uqsg7Azpn+9x/X4u77u4UzNcI8/kMpD3Fuh1jvOtn9nPptVM2wtFPoVHlipvXkaf7+ML//Yx1Vtcjynn69rfnFxS332N3Ubr2WmjO1APr2PVF0ebhoAl0QQ9Gd9x4ieceKsTtkJHsH73AqE6Eyla1dGOh1ogFGxMX1rgvwldAlMAUgUtmJVFfINKd9pEQn/bkb6wNKoe8l9Nd7POVr7e5+6ul2K1VbXA+jqwzdjDQHHrHVt7/ty5lfAKYbUPqUs61gbMttu+f4AO/cIDbfuspTj2zSK1Ie/JMLDhyJOVTn1rmhwxcctCK0Lju9acAVMUDjD6jCK4LwOjeqkyRt1O6832+9bVl7ryrQ7tt0+gbNUG1YsEnjI3tTm5u8q6f2c+BG6dtNlCrZ62RVIEWXP2OjRgMX/yPz9E+2xsGoavrwqLijns7YATXXitozlShViWKTSmFRHm9lfvBoCniaqOhynO7V2sHz4CcSn4q0lVXLKPyceQ1PLaNEQHiDUZ7ketGifH06/UD/+1QLxLBTZ2y79hCOZ2vMz/gm/e1uOfrXVQgdofA19dc8batfOBvHmB8QsKZZZtMqrBxZa1tlstci52Xj/OBn7+MDXsn6fdy6x6IoeaMkvExyXNHLQitOO6R93K0Clkh6BgzegyGFPuAClSmUJ2MzlyP+77W4q4vdGh3zgUfBvo9C773fHw/B988bWPfrYEFnzY2Hr7UhXaHa96xmXf9d/tpTNUY9FTxTNUKNGqCiaZgflFzx71tHniwTXchRfUydKYpZ/TJ4f4oitfRfRcGIjcUu8HADAk//FrY+yu95FonjXDZqqPWuSl/0BomZQ2G/UIjwC8GU0D7gRgwOfRbGd+8v82dX+7Q7WsmmqXOF4Lv4M2b+cDP7mdsIoIzXRiErgGsv1Fhc+LOLrP70AQf/PnLWL9rgn6nBGE1KUF4xIHwyOE+up9jcj3ywGFPhR0wIoJDd0au6bYyvn1fhzvuarO8rBlvWp3Pi10BDLqK6a1Nvu/nLuPQLest6y137RwOv3K90XZS0XIf2gOuecdmbv3JfdQnqwz6AQidTjjeFMwtae68t8ODD3fptTP3GGZ4EBXPEubWl89l9Egfu/daa7Tz+5pCXyz72jaB0BrBai+51kmDHBRZ2wafhVMom54JS4XdiWD3BRP6awrXi69oGAazIzKuRDx+eMBtd7VYbmuadUE1cblvkZ1A1O9rDrx5M+//+AHGJwXMLsIgc/cNk2PdfZWxGSJzLfZeM8UHfv4gMzvGh0BYSQS1Kow1JYefGfCJTywyO6vcCgJBRxUNMar4jChAhQIviSoxTz814LOfXWZxUTPWKAdUFIBvcnOD9378IAdvWm/F7nLPMl4BCD96pY3HLfeg3eb6Wzfxrp/cT228WjCh35WhVoGxuuD02Zzb7l7m2GlFVI1dB4bCL9QH/SAK+80hq7B8w34nOOa+How/LWRmZKKMTFjpJVc7YWSCEnFfl79dwjtg5BKEQQcMMULQKeFDF6fdQwoJ9YTKVBORRMTS2Jw4N81Q5XayzYE3b+KDP3uAqWkJZ9pWOc/96gUR5cZ/Pn0oskmtnR7MLXPpddN84OcvZ3qbBSHGqqRJDElkiKVB1KvIyQZUi9lCnCsfRq3g0Wuw321UqEw3IJLEQpMkFnhlMqmiPlnjnT+1j4NvWQeLLZusmmswfmK6D5f61RKw0z2XOtDtWxD+xD5qExaEQJHIEEn7TFt2j7F+zxR21rpnupAJxYgO6LvOvdGBWmWUtYZd/wXC0I1FFx/WYIj6WlaUlhVWesVarrT2iSsy7ugALEMDP4x1G/+TAlEorsHD+BHlLWAjGA76GzcKI65752bSao3b/ugIvaUe1GKUMuSp4rI3beKDP7OfqXURnF22Uyd9UW4lVuGBGDCyiGzuXXsALLH/hinMz13Obb/zOPPH2yS1GLQ1Fq5+2wZ+9G/vY/uu2LLMOVbvSvp0YISMXm8kV797C/+tqPLZ33+W/lIfWY0xDnxj62rc+lP7ufptG2C5bXW+HAcKN4iEA3uoDhhsetpiB7ThhndvwWjDF//oWTrLA5JqhHE66HW3bOSjf/NSNq6XMN+hTFANBksRwQk9Embk5frap+Qbg3Z1GRYGwp0HI6KuiqqrJ6SqqLraOfqDeLEwOLzI1cbK+5KBnUGiECay59yClMIBs/RLinPMe1scmjODRHPz+7aQVCNu+78P05nvE8Vw6ObNfP/HL2N6fWzFbuo3mDals7tI6fLM5IHo8v7yCNoZ0ObAm2fQ+nI++1uPc/ZYB6UNB2/ayIf/zhVs3l2Fs0tuGqPvCEoQYM7F4dB17r0BUoWsaW7+gW3IKOb2P3iK/lKfPBJMrK/x7p/ex3Xv2ex0voEFlQkGcDg3pVi3zzGuN06WumAMN75rGzqHu//zYdqLKbkSXP6mjfzIf3+QDZtjmF224jskBQeqEmCiqLvxCahulqAxLv5bPKEovl5IweKzfakoXhzrvDBiSpclHuu8sNo5TvXrCzuERBsdZHSXul9oFWM0xq2KJUKTXvqIiKuZn4I5ZJk7QObadoIU3PjOzfQHmtv/42H2XrmOH/jZg0zNSDu7v59bUElnPvo1ZgqGNSUQjaCc06tcFnIKdDh483pydTmf/NePMb25wYd+6XI276rBrPsNH1UnuMcos1tkDD+LffCSEpYHQMxNH9gGQnDb7zxOFAne9TMHuO7dW0rwhRvGeCkRsl5xX68Tut/IcljsgZa86b1byXL43B8+zd59U3z45w6yYVPFDqh+NpznhyirbgzFgPWz34L950yo52td2gPBYeNyQr2HRGtQorqwKsCAWInVGXCqJhazbkRF63Mmyttc0mEQiiIHzfaQwbGgMYgwrboQv260hTPOcg1Ldsncm965memNdTZtbzI1HbtGTCl8iFq5hNUA1OUKjEFdvE5mXGq5gpb93Stv2kjlH11HYzxiy44qnFlyqfqegUKrMHRhhGwXirJAHHuDLFNudp/hze/ZSLWZIITg6ptmoN235/LM1s2u9FTWvwBfkKHgP/twpsG1WwchBG9+9zbGZups3FJl46aKVVe6WakZGa/y+Dqa8hlCS7cYcH5apy7cbp7wLQhL0JX4MNZzFNXWXP8vzqPaqidFVDmruzI1mkpocBintBaIRwS4s+EaYRQYt6aJr6kHWhEHDsAR6iK5FSvJmOHQ1ROQZTbCEe4j58V5sdq+bzwHzgIIo0Bxv6GUTYVXOQcONZ3jumstauXFeph4MOJmOGe1fH9/ExwPRHWuYKmLaMK1t6yz55a6No0+88sZR4EIDAeQW8KrULzD5w3EswEW+yRNwzU3TNj2OhMyX1j3UR1CEqrueBXCaMfKuqhO2e9hNe2xYkddY8iJkeizrFFiucbKCb3K+DEtkiWtBxv0ENWWXWuC+aXGYNPCtcIIgTA5PqvEsmHQN76zhjabcRdoY+dRLXeg3bNgKGauyfLHCMRUuMZMIYJHQeOPRa5DcrsWTadPsTRIAQTKexd9ZVlguPNG6h7qaMUp1+GZsYZNZ2AbMteOkUMGZYS5ffv6foqGf6pgMGl/J8thMYNWZEGpcusTDeO6oc+u+G7wDMbgkWSMCvyA2lnDBIsqmEIiak9QWrj1CSKlkWtPTNdD6yePlCg+ncnarFbtDUPg02CUcWsMCZf4IiijIo6mjQGjXK6gz/mDUgzrgBkpO87nWIFtwGAesgXdiJUblgKgAWANJTiBIZ1Nabsps2fq4jf0cKcVYJcBq/vf86y1AgOOJoHq3C7TIURZxyL1yw+AUJzr4FhgBIUs4F1CRecI227nxHxN8Nk/V9Du7vtGa0Bh/Gw6wK+UWmS8GFMsHei6uUyk9p9FvJjWplc3MoA4rU2vfnKw3FKietJorih+VAunYAo7qU07O8PgRLGtgSiAaCtO5EWz6zDhH9wEgAxGYLHEblQCrWDL0DURirqgsYVbo6aY2ulfHjiUn20Lu7/+OgfyUUYL/45EDMr6i/L+hbHlf1uXBtk5NxypZ8G24e974Hmw+nYIxfOoqGb4NcTaoUM6ZD7/+5T3K3AfgNAd0yPvtYZM1k8TJydYo8SssSeGipNBVhk7otsljkK9uHjhwekIotADLVCMUQgtXVaMXxewWJeMIlNmxZi1KHVGGDYyGGE7D9yi80M9zTNtcKxgtkAsYRz7yQCk/u9K9Vuhvr4MMXQA8JC0h9jNBN9zgyBwiwwxV/EcHnyO7Yp7BoMxvGfBhn5Kqgeopa1iumUxB9h3si6A5yNDvs+1NmHWWUHEKq4dj9LO0lqtFUfp2ls6qKT5lDICrTXGRMXMPWnK59bafsaULhpBUJNCgdaOAPxKWUEne2PCXz/EaARMGHSicHvFFbPwPKgorytANCIKfed5lSA8boy9d5lXVt5jVOQPHXNgHgKMB1Vx8+BeARiHJg2NxmQpn71gvQBYoWgNxW5IsCYAn5+3U4QMHfh0iCL/UhitnIER6H8FGZXMZ3QJSK0hS8YO17pn1lx8KK51114lP61MPKtkooxKo2IFf13+2DlsqMEIBwahMUYihGNEN0vOMmJkXSjeKvaMFG7tAOVnYMhdU+iNXhz7Tg3ZkBLkxf1M+VuhhTE018MMvcUIjNZupJcvX/yOUUK6ecnFTMAQ+CMMWqgoYWt7aze8xv0trvMi2QPEM2XAgia4Rxhe80RQ/JbvNIUxefBZB+3j9D5tCkmsjXe7gHYqWYkLmzCijCBLxp5cAVJDJc6SsTUv6Fennsxk/VRNpds8srUWjgkF0umDlgWdX1AbtDBIoe26gUO5ZdI9p3KbF0VlCC1U9rUJQqzhOUnhrC3A6Ro5ZEPvU/C/f05MF0oF34Nflr9v7Ow6lSl0mqNShc4yVKpQmd2PzU9fkZEgSmziQZTEyIp9RYlEyshpCiGIAvF/DjD931Emdc+u/ffDdvX3DnytmNK/VzCkv86D1FiPxZAFYdnOLjZQMowxFEsKDonbAnymnNeuDErWBiS18wOQZHU/oHvsl7Jo7LDJlrYNsZ8RhbPcA89vau6p2VP7ylavA5FmuOMLMFDq4EN6HY45A8PEX+xX1yrW9nMVFKEy7+8BJcIDUBiNyu3K+nk/I++m9JZTFhYylhYy5pdyFluKXteQ54Y4EdRqgsnxiJmpiKnJhOmZKvWJCkkjIapXiKuRXTjcqxWhYVGI0oDtPOo8mHzirh9YxmBdEL7OQduEYjcEXaGaeJDq0ilfJBaUKW3CuJiv8y8WSwN6kasY0gF1IH6Fhr5ovPhiOzk/AF9sr7UxH0A2GKtOPqQGx2+VyqCVKFQErQ1SCXQEwk2JFBqEKOPGAlUo/3ZUKfySvUa4UaZzq+PJAEwFIFcoBoqIhAkAW7g2PIsFlqzWlMaFcD8RiHkMOtfkfUXeG9Bf7nL2ZJ8jL/Q4+mLGidmc+SXNIDVkuU0N8+soRZFNr6pUBFNjkq0bI/bsqLB3b42NW+rUJmskjRpxNQm2/wrBEqAmyDIZ0vWK7VMJjhcjKWBUd9hPJi7A6c57kRyCzxtpxmc2l2LYMp0psF70vfEYsLfRCjcn2x5Lk4nHtIzPu1lNrOX5N+XL4rHv5MREKkdrGSBdWBBqUdZZg4lEMeh83ph1y3g2dOLDSAwK4VfJ8qCQIwZHqLgXmDQBEL1I89dTNrT33eFWcRUwZAFiVQaVKvJeymC5x6njHR59vMsjT/Y5cSanNzBuCThBEkGtitX1RNlXSkOvb2h1cl44mfPQkylbNvS44kCfqw812LIjpzpRJ2lUiZIIUUxSDxnPgy70LQavUL0ogBiK1VBkw7Dz2Rt4IZ0F7pYRVjTaGiVexJYM6N+bQgQrXQLTKEOmBGps4tt7OX2+5XeJ98rT5wVgr7rx/ixqnKqo5c2FrFdW/7OiNwChsUqoEG4iixDW+BAKiKzu532BhetDB+9dlEKKoAaBUm1blCG9qbBmVXm9B2vhvokoowjl7xqtyPqKrN1n+UyPRx9r89X7O7x4PCfXhlpVMDVhN3+Jnd0kRFm9YqA5EColyBWkmeGFkzkvnmrz2OE+N1/X55prxpna0CRuVklqkTVWIABeqNP5AejPixIBQ+4W95w+1DY0K88U5FaCOACfn7tc0JkaPm9MEN0YMTRCQ1kHYllrlKgN0qT57bUw5UucJs3zXqST2pG0MvVgo7/8Aa1d6p22TmmtbN/6FZt8Yor3CXpRjFQMzRlGFjqbtZBdr4qgIUMXx1Ce2rDoLBpchO6YEKCOfYtJUFY0a2XIe4qs1efY88t88WvLPPj4gN5A06hKJmt2aV+/wmrsFj/yO0UVdx8CoCFXkClBIxX0B4YXTmScPrvMC8dTbr0lZ8eeMTB14lpijZRCH/SWrB9ggYPZhMcYbouC4Siv86I8nKviVRGtMAXrehTlFAsPBRbvEOgcELUyBfAKw1QZlDGYHAbx+DNpdfLB8wILiNPq5PmvUnmW19fdo7ovfUAqBzxtUApEZPVA40AopHBLwRhn5ToXhTY2ZAIBU8UMh7Zc/p2QlHuJiGFboWh03x8jSny4XktBlKEFbHVEo+3+uunygOeeanHbFxd58uiAaixYNympVmxaeyXxS/zaifCRUy/DJXVC0ZQrYfceySFLDJWKNVLaXcPXH+gyv6T5wffC3n0StCRuSKRvlzArxd/Yt8FQvNaUnoJCx6MUwf47xUD26k8gRz34tG/33MtQDGH2k0H75AM3yArDwxvPuSUlo2x4rl+f+dr40tFV1wQMSzy+dPRCrmOpsvHepqy14rw3rmNhjZGhkSCc688CT2jh/Jx2vQTrGrQTpI1bw68Y4Rjn83UBdL82xVAqlB/2ATMO+QiD6zyICxFsyvs4xS0fZGStHoefWuIv71jg6Esp4w1Bs2FnqlUrnv3KecjSsd+QduBKqJQrLSwAc6hkMEgNSSzodCVPH+mTfX6BD2nYd9Bt+lyNEcXqmoFiGVrLBQuGoBIlEHWoGwbgM1AGba3RYUTJhN7qNYUOOJxWNeRiKcCnMc7oUKq0gI0y5CRa1ae/eEGgAmJVn76gC19YTh6eiqcfaOS9d7iBUqgNOiqBJ10mhNGgpXALTpliNQWJDlgptw0XxWAEBum8J4piIxvh5zAQyD3PGGKIMIoy6jfE9ZfTNfOBQvUGvHCkzWfvXuT54ymT45JG3S5gVHMATNw6zVEEkRTFGptDtpC/tSn9ZEobktiyYSWm0B8jCTKSHD024LN3L/CResSeSyKUiIgTEwwYQemUDlkuUIS9ilJQldcZZdE8JfiC5XVxx4pFhoaZ0a54VYKvAJ6/xJGONqboZ2+EoAxdOXb0xW7laxcEKiB+sbvGnJCgjMV5P0s2fC5fOPmOSGmUlkhVyn+h7GKK2rtijP3rN6/0dG4MCK0xUjs8iaDRraFiJaVbKYugx0O9zu9a6UW4R0Zx3uuMJgBuhMpz9CBj9kSPO760yNEXB0yMScYaUK+6vTeqdgmPOLZit9gabzQ8HBavumqIjEDHECuII0Pk7hMVDCp47sUBt39xgR9tJGzcJhFU7Cy8oTCbbx8z/Nm/D7cSE96/5w85lhjyFZYs6JmvQJbWBfgsoTpmc/jUyup+PtFAK3/MEoxR2k6rbW744m5OHb8gUAHxbk5d6LV0qztuT6PmP6jn7RkT25Euc1CRQSiNlhIRaYSWSC3Qws4H0YW/DdDGTp4Ubr0SKZ3+YZwnwSBkPMwGJne97zKFC2bzuowondaF4RJ0mpfkRqNTRa+V8rX7lnjicI9mQzDWgGbNzdWt4GbjOfA5g0PAqm7J4tmgUFmNsYCLpJ2ZFomSRQVWZXn06S4b1y3ygfdVGIvtwkjCqx860G3DCAauXYbi126wOZ2bUER5vdq4dV2CGG9Jczl+rb+QULUugahDvc+BTyk7W1ErINekppJnjY1/ecGAAuKsseYKqkNFVZqP92rr76l12j9irSGBck5o7S1gNznNumIs+IQMIifSsaMyCKkB54TGtaeILeDw/kk3iguEuWs1ASIcCIv1nkfeYztAZxqT5Rx+psO3H+oQxzDRtCsU1OpO9wvmIRcbgq4FvJHiwVqooQKEcHsqi0BvNVZx/84jbfbuanDd9VV0FBElDmRFDNfrr54JQwMrCKkVp5xVEGS0WPCpEfD5vy7h1AS+W21CV2EJRifxlLK6n/H6nzKYDPrVmYf71amvXnhrQdyvTl341Uarfn3jn+bdYx+u5EqYyEVG/KiInNh11rDQFEuNIQzCCIQRRZjXeAe138zQE56IbQy5WKwyFNEwlICJCUQ1gTgPjBVn9ZosZ3l+wH0PLdPq5ExPWdar1wK9z4HvglhvjeK/NwRiIVxihvWZ5hoWl3Puf7jFJbvHmN4cW7/p0JJ2gQ5bGFTu+XV4zSi7eQs6FLtuq7BAFIcJpp79tDGljl+E2Up1Sweql3HWrzaCfnPzJ8Y7xxZfTjvF451jL6thu2Pb7uovr3skyU9fTeIrJFBKIxUIKVHSGyUOhH4AB4PY5pZZJVqIHHQcpGO5ieaFEeJZTLk8MBfgL5ZH9Zd4d0XQUY5AtDKQK559rsOzR7s06lCvWqPDM59f/sMb368Qe0UJNQ9P8hiBrhiUFuTaMEgFz77Q5fCRDm+eqWKERMSBb9BHKsJBFTqbfda0tvM2hmO73oII3CxA6T9xwPIgDIyLQuSO6HtKcc4xck0vmjjVqqz/5Mtto7hVWf/yvpEO5juNLX9cX5y9OlZ2ByWtrC9QKUDamLCSBuF0QOF6w3aIQSLs3oUGJM5HKJz8djsvWRAWvUaZSOAa3rFqgRZ/TnoQuu85N4VQmlZb8chTXfoDxcyk3bS6Uuh85Q5Er5T1Viqh0RJJMDFUnHWZK0GzDgtLiseeanPFgQnGK5Xy2fwzDEWNGG6HkN2GWC9kvtIKDt8XlqzBplWdA77Ayaw842nresm17W+t0Tl0xrZ8Zrz90tMvt33i8fZLL7tRe2Pb/nQQTfwPcbq0U0fG2hNKFAkJWgqktItrWz3IgNMJLbUYpJE2yO1Ek0Tb2WhSAwnGrU5TFAPlPnKuEb1h4pnQz0ceSjJwol4rTp1Oef5Yj2qC28BQDFu78rUFX1i88zoCYiNIlKGaCPKqTWJ44aUeJ072uWyq6vIlHPOHq0ng2o9RgHmLluCcCcAXvHdJnTpkPKcSjBoZQyJXGef3s1K8cCFmmlTUu72xrX/4Stol7o1tfQVfM0c7Yzv+S21x6e9HSmOkROfGrj8prfWrpEAIjZDSKuHSWn5QxomFdPFiLdyuXQZQTvrE2O5yI1tGlj4ElNEO16hipIOGjBP70gpeONaj3U5p1CWVJHC1yFJXez2LX4oskvZ3K7EhjaFRhaVOxtFjHQ7sH0fEfgEhGMpkZgVQFUYalG6V3L28BVwaHCH4CuPD4Fa6CpjPWJCp3Fm7yqBzb3xoF/WwobdOc8vndHX8m6+kTWJdHX9FjdlLav/noP3Cxxppa7OWWNGbg5AGJQQom0EiXGJCubKAKMSczR+0IlJKu7yl1NiGKjZnERQ+P1tle5/RPMCQBYt9ii1QhTH0Bprjp+xKq3Z1Kmvtegfx6w2+4mk8ACMr9pMEqlWJ6CpOzqZ0+5qxCgzlLhbMFvjt8C8zck6BySh8gN7g0HalhzDEZv+KItXes57RwxauNza0UyW9CkmuSEW132lu+724t3DezJeVShz3Fl5pWz49X9/5n2rtx39ZKoORLjEht/qczCXKJxc4XU0Ig0AUzmnpNjDU2Lb0vmMJCOWYLYqcawasXqitESIiii0hisiHM1C85SMiB0LJclsxeza1kQm/3WksSj/fGwhA++z295PIRk0qMZw+k7K0pBif9KoGK4hRDzpdPrOPkYVbKHjmK+JnBFYuge7n1vlT5Wely8QK+1cXrheltDXolMZk0G5svS2rTt7zStsjzi4kGWGVkprK7/R6x368kS3tIBLWwheiMELsCgPg/TFSWPHskyUt2ITztpjCMW1K+YPwLSO9SA5Gtnb7yBWhEG8xOv9YkIDa7yq6vdxmtMQQRYZIiDdE9I4Wn84VCZ9lY0Vyv68YDLzxEfrtHOjCJIKhdBUHvDCyUaTZ6zJV3gBDOh9FUkkRVg10Pu1Ap3PncM5NkXBAphmIeqc7ses3kqydv9K2iJOs/YobMok4sjy2+3crC4/8apJbXdA4RRZp2dDrf1JbJdYmwhR+E9eY0v2zsWN/VoKzkJ0uI43VBYeCnV7kwlCCZpiqZQydToZ2Mdo4cgmlbzD7+RKyoJSCKLLJClppltsDNxnfX22GAViAMNCBhyIcppSTrimGEguCqRSFjy9gQqV9dMOyos49GCnBpzQqg+WxHf+l2jrx5VfTFnG1tea84fOW5ZnLfr/RO/nRyWz2GiIw0qAkIIR1xUiNEBLlRTHeIhTW+HBsJgrXjClITQtTJG2KMK5ZOJ5950jHkFDohaFrxgg67Yw8N1QSUcR2Lwb7+SKCOvgFMrt9TauVBfpuIGqHoiC6dCgPGSa6sHLLCF7pXvGA9AkGPq7r8/pUYPX6LWHVCPg8+3WjqVNLE/v/1atth3hpYv+ru0Ouzy5MHPz15PTiHzXzNDLSLvduhLWQlCDw15UA9Ft1SWGVYCE8fwmne4siTbDYWVXr0uKVmmICEk6x8asleAMlmNqZ5gptNFEAvMKFeDGKd3YHQDRGkysdGF1mGIxBXLcQueBkZ14A1V9SJjwPGxyF3udA6vU7z3h2m1vQud19SgfiF6XopTGtmd2/OdY99sSrbYZ4rPvyIiErld27+5+c7W3+ZLr84kcr0up72q8DI7DumCIeSmkVO/ayq2gY/Cpbfmt6oGDJIjSG35PYONEbueiIF72BHuiTFkS55244Ae+i429kIEgpiCNrxFkzc8Tq9cgqMqcdE/qoBgFZugGoi/Qq4Xx5QcaLwoldF+XIdQBEXTCfVrqwjLO+IatP33do75nffi3aIT60d+2J6ecrO8eOCyCLduz8Zy8+se6WddncFukmZhvpHNQOhAjrE/SAAhBoJH5nS+Myy+01UoBxMWRrrbq1Z4QFoh3ibgUuPyUvjBMLJ45FzFgzolqx6f8XDXXnKUkkqVcDR/sQC5oSjCM5fATjL1ydwq5oSqHj+VVMy5BxaVSUup5BZ8axXymSrXdH0dFjvW27ov/foK0W9m0+dc5G6S+3xDubF5y6tXJxUuDAuhcfXdy2+9daL7Z/YyIagIycVWzKkS4NyicWOL9duaa0HMobRJfuGoTGIG0mtfe44LbKKSYi69IQ9vqm8VSqmZ6MqDci+l1dNNcrbrXXqJigAlpbf+DUZFSKYI+e0OUytCQVBfiGfIZOv0PbJIFCbfR/lSlEsdICpVSR2awLxsNOvs+1dTzkik4/xqzb8HvHZrkdYN8mMfwQr6DEr0kvuPSNPdvb//7RxY23pu1jH65I54CWNt1eCRC5Z0Gso0nY3CzbfpaxjLCRESmsc9oW6UawctMhnX4nXEqXX8PF64hFEoLBT6web9iEg65xFs53UfEMVa8LpsZlKR9H9cAiDu7n7zrRG6xS65musHi9oWEMygQGhzuunA9QaRfpcEyoCp3PAjHtG1Rj+tsH9nZ/FWBrc/Y1aUR5/ksuoLghuLE61z+4v/+POvH00bzvwzUakxuMf7DMFEmMyj9w4exUhShQXjfxuWkIF8B34SADxkhn0dkFtAsXvVagszJoqRS1Kow348InVqzDc5FosARMWZ9mPaJala7ePuQQvNwzGqMwSrn0eFGkTfn2GvXzFdauj+eaMLymyzBbpgvDw3iHswaTalp6amnrnso/6HTjs1ubp0XQ76+qvDYAhIL+t46dfWpm18Q/aOfNgUlV4dw0uhxdfoRp51n3gPT0XzTiSC6a3ypWGwdO17AYv0COwRQ5Qw6ELgeu3oRtmxLAZu0MeTYuQgkNBstAgs1bEppjxi0u6UNqmRtMGUZlBfD8EslD6fMOEKYYYOVkomEHM64PdAHEom8cWfg4r05zWv0q49smfm1hKfrSwlIwV+U1KOdfFuGCiylE8TXbX/izb3c3X9c6nv3DiSjFEAWrwhoXwbT+QXvQ7jMsjM2wLlDhncU+8dJ7WBwIcXFl77IxTuwabMpXEY4SOaIq2bE1oZpIslyj3IJKHgRvpD+wAJ4DSpZDUhHs2l4lqgA9x4DFlASnFxPsTuVaqVgyzZSYKC1fUwBcBzqe0t6wME4Kaed49jFg7VIIFd1eRDa15T9fsWv53wKsSxbEazlqXzsGBN8CEmDP7uyf55ObP9XtSnRWmvQmdw/qxa8bbXmuyYPwT+gSKNnOOUWNdzGEosfbIs5Z41Unpe0C4bli2/YKG9ZXyAY+zunF+xtbfN18evsgNaybSdi7s4bTM2wYU4vADy1Ku8MI2x7BlEgdADoMsakctNKFk1kVoLPqkMm1e40wX6ZJe4a0PvOdyw90/36axf11yYLFy2vYYK8tAKEA4frKXOfggd7fS+vTD6Q9UzxkkWGRO32jcII6cewaywfBh/LSdAnCYq0e58n3uk2oVxUSVhtIFdNTEZdc0rBr12WmmGRdGJtvQAl1P6UMaQ65NuzdXWdmJrIb8Gi3Gqmr+pC+6CMYrj2GvDNBO6mC9bRrMz1i6brEAq/zeT3d/c17mmVmju+8lP9Xr2eOb2nMyqB/hx7p1bTHawHA0Qr4yadyS/PM0Z2Xyl9YEjMvZX3PfBSmfQlEEzTcsEhQWjm9cFipHl6xUxSO0mIhRd8h3tDINUIaLj9QZ3I6ode3RlBeZqe/IcWYgJRzu/ni1GTC1Vc0rEWf+UlCgaEUPEexQKYR1hGly0E4tEyaZzvfpsUA9zp4OfjxotfpgFlfsagmWuv2Tv7iUm/svr3rz0in973mrfTaMyBgh6UAgdy7/sy3Nlwy9fOLamou72krjp2Ds3xoXVrEo6D0SrIzTpQZtvg8I4QsMRSXd9fr3EBfsW1rwlWHxlFaMEiNs6pL8fV6ltDizZ3ozXLBocsn2LGtCoO8mODjjV5TrDxmSpCZUsXQBpTRRZsod2+bYuXa1SWQeoD5AV6IXlWG29RAsTRoptO7p/4/Old/oXPF8IJHr215nQDowt42p01cu+PI59btmf47C+lEO+/bB9eZpXq8HpPrIeAp7XPQGMrINQUwTWD9BUq9sd+1O/WUbKG1wQxyhFbccO0EO7bX6XYNaVaC0LyOIPRs5oP8WWbodAxbt9W58YYJBBr6yg5M69UqjK1CjBpzDtuFhoVNGg2BRwA6D7JA38tDQ8Sg+orlXo3pXRP/f6Gy3xMq4/rdL0VrPNarRuVrZQVbE22lw1pIQF238/k/ul/vrM8/p39jSrTrcQ0Q0lmsEu0mulkLTlqXi3Tr10mJibw1aEO/Q5suGYOUMlhKxqZ1SWP1AT8lUitD1MmZnqpwy1un+cxtKZ1ORhxFRWw4cksTitdwaJoAfCq3al67o6k3E97+tnWsm45gaWDB4Y0iZ8XqwrUSWMAaNKWDWRvntTFe3/NSAowbyKZIsXKDLfTN5oZ8oGj1q0ztmvzVQ/vm/wVAolO7jJgPPb0O5TV0w5xTvN/AuBk26vrdL/7B/WZ7Zf4o/9sU7brNdrHTKKV28eAIQNsQUiwsRRsbLy68/tZp4+afG7QQRNiEB+kyr1E2lFdMrzTGum4GEHUGHNjXYO7mdXz53lnaHc34mHRJElh3jw4SBV5pAwQGhNf70tzQ6djcyZvfup6D+xvQ6aIHeZEoYIyvr7+P9/uaQt0I2b9cHjdgRxWA0ak1XtczHpCO+fK+A9+OiX95aN/iP8VgEpNGxUOsDL7XBJCvJQBXYUEYAuGeY799v9iRzx8R//uUaY0ltcBf54K50v3VQlI+vnLgk4UT1ycoCGkbWbgUL5954/MKJXg6JDca0RkgI8mbbpii1zd865tn6HQ0NN293TqA4Xz3lwNEY8q/WlPoZVlmmU9ryZtuWs+NN0xBv4/upOS5Xxzcb/ZD8ZzergvFsJcGegh4DowefNo4d6LNZilEcKDS5H3Fcr/G9M6JXz20b+mfAmoEfK9rEeY/vPb3XOWzn/KfA9z/4s6PzT239K8mosV11YZExhIZg4wEMrYvEQlkJC3QIrsFgpQCEUn3nuJvATqXsCDdEnBDS2P4zwgqlRg51WAgq3z9G4t8+1tnQCvGxiKbNR2LIi1Mhkx6nuIHTOiTy3O7XmC7rUDG3PimDbz1LVNUzAC92CHPcgsc10xFLBcLvXDCeOFgLgyawDhxDuTC1RW4XFA+1GYKIzDrKZbSZjqze+KfAr8OcN3eU3bW17DFe66n4zUqrwcA4XwglDa9+ZHju35o9tmlf9tQi7vrTYGII2TkJgsFIBQRRFLa9w6EMir35PBr9vl1m4XL8hTCTa7zAMVl3wh7v6QSE001yJMa33lomfu+Pku3ldJsSqpVUaTu+6zl84nkc+O71s0zGFix2xiv8uabN3LDNePE+QC12CEbZA5sJmBOJ35D695bwmYEkNo56rW2uqEPe/qQphrW9bRzg6VdzWI+ubh+78Q/BH4P4Prdxzz4oATZ6wY+eOMBaN8LIXyO/fHF6ZueekL+TtKbv2asATKRiFgQJRDF0q7J7NkvsiDEs5+wQCQSBVMJt7aKXUzS6op4ZsQUQESAFJJKJSaebECzybMv9vnm12c59kKLSBhqNUklKSetS6cjrrZAJYVuZg2ONLN+PmUk23eOc9Mtm7h0VwVaHfLlLlmaW+AgCgCGOw+BM2Aww2znr1Fe9ysd/MUSuipMKC2tYJVp+h1DN55+fv3eif838EmAa7a9+IaDD14/AMLKEqtkQoRA2rTek+31lz7+ZO1/kYuzHx5vpMTVCBnb2WteJJcgdPFhKS3AIpDSTWqS1gApRLUIGNEZJ7JIy7YbzkspSeKY6ngNpsdo9SWPPb7ME4/OMXe6B1qTuFUU4tiL+eGHC40Nq+sZ0oFVUmc2NLj8qhmuunKSsaqCxQ5pq0eW59bCLXS9EHgj4rZwvDug+9BjATz33mUuD/tY/WoGhjxVtDsRqrnum5cdVL8EfHvb1JzEuAj7GyR2hwDxOgIQLgSEdqJSPp9PTzz3XOV/XjjW/h/H405SbQhkEln2iRzQYmnFbVTqgn41Binc2nqyZCtRiOSSGUtAEjChII4klVqFeLIJzQYLLcOzz7V49vASc7Ndum07WagUxS4BghI4SgNC0GhW2LCpwd59k1y6d4yZSQG9Hvlih6yfkildAs0xZ8h+/ni5VG4Y8y19gUYTMF9gXOjAX5pDrjRZT9MeVIjXb/jDy/an/wR4cVPjTIQRfrfxUQ/oWmB8zcrFAKA/XpoFwgjsFtU8dGzHfzd7pP0r1Xxxb7OJ3QKrAGDIhBaIInJM6ESuF7ded0N4oyRkwsBoEWWFZCRJoohqvYqcbECjziATzM5lnDzZZe5sn8X5Pp1Ojla6sPuFFDSbCdPra8zM1Niytc6mdRWqiYFuD73cJe0N7MSowrfibVsf1zYlI46I4jIKUhogxvn4iv3rCsezDlwv1urtdQ3LZmpu0+7Grx3cs/TvgLROJ7GpQ4XIfcPZD15/AMLaLFi+D4yT40vrr3ry6cqvmIW5D43XBlRqsjBKIieCZSyIpLUypAOhCJlPBhaxm3IXgq60jEtrGWc5W7EckVQTkmYVGjWoVkFBP4NUmcLKddKfJBbUK1h3T5pCZ0DW6ZMNMnKlCh8fMGRceCAOMWAIwCHglbqfXcNPFzMxw0lEyn3OBppWP4Gxqa/tujT+J8AXAS5ddyqx6Pe/5sh8daD9lQYgXBATDumFajGfaj77fPMXzr7U+Xt1vbyl0dDESVQwn4xHmTDUDT3oRlw03oiQ5Qw9ONdVg3PVSCGIIkkUR8RJTJzERJXITuINqVMbyBQqy8nTDJUrcpfhbRx4LMwEFCxn3JIkpQGCCf76jB7jRGzhhjGFpWunB5erlfqtElRmWa9lJloz2xq/vXd3+q+B0xtq81Gg78H5mW+1Y69ZeaMACBcGQkZF8pGFzTe++Dx/P5tf/Egj6lNtQBRFgV5YglB6C9lbvYVuiD0OhXumAJz0vyrK9Y18hURZJendOEO6JAWodAAQUyQElU/lXS3+mNHlNUOz1Yb8fbjsnnLlqsIN4zObcy9ybfpa2tO0BlWiyakv7dgjfx24E2D/hlOJq8iorrdW9Pt190S/kQCEtX25Af8Ms2FXNyvPHJv8iZMvZr8U9RavHatkVGrCOq9lCMDSZSOiEXG8glES+gdxqzkU4thXxofngBI9qz3JuQcLw9KIAoDDbDcsbo3BJaGaYcB5Xc9FN7R2k8ed3penmk4vIqtMHJnZ1vjdS3b2/gBYmKnMS4yIAR2wnv/7hovc0fJGA7D43fMcK2MPARue7q3b/sJLlY8vnOz+bJK1dzZqiqRifYORd1h7IDrxS2CgDEdLhId5yX7CBQOHIifCTcAzQQ1XG0chMgO2M8FHB8jQzeKTC9ABixqKzJhS5/MhNMosmIGmM5AM5PjC2Mbmf7pk1+B3gScAtozNVwJdz1dwNR8f5zn+upSLBUC4UONk2F2TAZxsTV/13Iu1v9E+0/1vKll7c62qqFQdI3qntNcNvUM6ZL/I7uLuxSkhIxoK/bBgPzFS2VXDIQHo/H8FCEMLlxFDxJSgK1wsI6lXqtwOSytDlmp6fUlfjLXq68Y+uWOn+ffA1wAuWXfSrna+uq7HCp9XO/a6losJQDg/CP3n0lyQxuDiyS8ubLju6LHqT/fn2h8WaWdHI8moVCGKoyEAShmAcUgshzpdsBCSo8KiIsXWYgwR3FANR7quYLuABf2xUP/zLhgPvtDJ7FcaU87Y0EqTpYZeGpFGY3O1meZnt2/Vf7h9Q+teQNdFxxsZpeVzYUB7w4Hny8UGoC8rgW6la0pWlGjcvg0nW9NXvHi8+mPzs/mHRb99ZU32qVYhTspkhkIvDMDnRfSQTzA0UAQuoya0mldC4EgphF5oaLhTepj5fGTDaFEk0BaL2Dsxm2eawQD6qoKpjh1prKt9ZvtW/cdbZ1rfAkxNdCRaxGuI26BmK9X24pXvFgDC2lby6OeSqkQJxFPddTtOzlbfMz+b/0i/1X9borqTtSi3rBhZX6IXycW2q0NWsSlFsfslIbyb0v+6/+nhfjMjb0IYWMuYwrjwKxaYwPIt5p0XaVSaNIV+FpPJWq8yXvvm5Prap3ds6n0eOAyweXxuNeANVekCP1+U8t0EQF8uhA398VJDC0RzJx+vn1pqXDt3Vrxv/qx6b97tXZuYfr0qcyoVl23j07ycWA7fl0zo8eaSXM9XoyG3i3B/Q8s3mL9SuFVc9oyyqVJpCqmKGFDLZL3x+NRM9IWNG9Ttm6d73waWAMaSthW1oVWzMvC+KwyNtcp3IwB9uVCxHPwdNlYA5gdTM2eWq9cuLfD2xQXztqwzOEQ22FCVKUmkSRK3DHUYTXF3LNjRf16tFkEZhYMuDA9T6Hx+Bp/fVzjPBamuoOPKUtyoPTExKb4+NSPuWTeVPwAUK4hurM0lbo+4lUD2Vwp4vnw3AxAuzEgJj406tAtWBGir8YnTS81Le211/ZnF5MZBO70y76eXijxfH5GSyBwp3Mr5buOmwmVD4D9co7aFgaEBSge1yu3GNFobch2RUcFEyWJUS45Wm5VH10/m99fH5Xc2TPSeAub9Laeqy7HdcFkETsULFrPnO37Ry3c7AH25UCCGx4fBKIfBCLA4GF93tjW2KxvkB1tt9i22K/vloLdrkOotOtfrhM7HhNEyQiGFQhqDkCZgwmGfn7Mr0Ei0kShi7LJyUTuK5XylKk+ZpPZSvSEOz0ykh+Na5el1470jY7X0DEFEokrHulGGRaz7oaG/o8dHy3ct8Hz5qwJAXy4kkrLSsdCn6Jx9pfHiS0+PJWg1PtdtTrX71W3k6VaTZ+sWOo3pTprMCK0m0PkY2tQxpmKMsXNqhFBCiBQh+siobaJ4uV5RCzP1zoJIojkRV042a9mxdY32gohkG+iHv1uXHYkhtluZF347X9ZyHP+VBZ4vf9UAOFou1GAJzw07uwUUoQ45tO3QOaWvxwSG2GBijPG7KApAI4QWkCOE28xk5VKTbYF226GXe/6upr+tBroVPI+rXv9dXV7PaZlvRPGdEX72ZRSMIZOUstOv+WYARTT0PREAREBNtA2CnMDIGSkekJH9hjddSoc0KqzHOeBb6XNY55crgr/ry191AELZ+L6D1opVrHQu/P7w51D9MsU1a60UsELdRj2EK9Z9le+uCrq/soAbLX8dAOjLKMOtBLjRjluNPcPP53G8XHC9LuS6UdH61xJ0YfnrBMCwrAXGla4TrA6416Pjz8fGr+dvf1eVv64ADMso+60EyLVA8Hox4FqM+9ceeL4IA5cBT13sinzXlP/wqgF3IeW/GoCdr/w/2t16G7gHAYgAAAAASUVORK5CYII="
        />
      </defs>
    </svg>
  );
}

export default HomeProductsKeywordList;
