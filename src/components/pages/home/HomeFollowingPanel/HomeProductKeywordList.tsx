import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { ParsedUrlQueryInput } from 'node:querystring';

import { useRecoilValue } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { Skeleton } from '@components/UI/atoms';

import type { SearchParams } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchProductKeywords, putProductKeywordView } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchRecentSearchListState } from '@recoil/search';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeProductKeywordList() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const savedRecentSearchList = useRecoilValue(searchRecentSearchListState);

  const { data: accessUser } = useQueryAccessUser();

  const [isMounted, setIsMounted] = useState(false);

  const { data: { content = [] } = {}, isLoading } = useQuery(
    queryKeys.users.userProductKeywords(),
    fetchProductKeywords,
    {
      refetchOnMount: true,
      enabled: !!accessUser,
      onSuccess(data) {
        if (!data || !data.content) return;

        const firstProduct = data.content[0];
        const newProducts = data.content.filter((product) => product.isNew);
        const generalProducts = data.content.filter((product) => !product.isNew);

        if (firstProduct) {
          logEvent(attrKeys.home.VIEW_MYLIST, { name: attrProperty.name.MAIN });
          logEvent(attrKeys.home.LOAD_MYLIST, {
            name: attrProperty.name.MAIN,
            title: attrProperty.title.MYLIST,
            total: data.content.length,
            totalIds: data.content.map((product) => product.id),
            new: newProducts.length,
            newIds: newProducts.map((product) => product.id),
            general: generalProducts.length,
            generalIds: generalProducts.map((product) => product.id)
          });
        }
      }
    }
  );

  const { mutate } = useMutation(putProductKeywordView);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);
      const selectedProductKeyword = content.find(({ id }) => id === dataId);

      if (!selectedProductKeyword) return;

      logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.MYLIST,
        att: selectedProductKeyword.isNew ? 'NEW' : 'GENERAL'
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.MYLIST,
        type: attrProperty.type.INPUT
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
        mutate(selectedProductKeyword.id, {
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
    },
    [content, mutate, router]
  );

  const handleClickFind = () => {
    logEvent(attrKeys.home.CLICK_SEARCHMODAL, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.FOLLOWINGLIST
    });
    router.push('/search');
  };

  const handleClickKeyword = (keyword: string) => () => {
    logEvent(attrKeys.home.CLICK_RECENT, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.RECENT
    });
    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.RECENT,
      type: attrProperty.type.INPUT
    });
    router.push(`/products/search/${keyword}`);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <List>
      {isLoading &&
        Array.from({ length: 10 }).map((_, index) => (
          <Flexbox
            // eslint-disable-next-line react/no-array-index-key
            key={`home-product-keyword-skeleton-${index}`}
            direction="vertical"
            alignment="center"
            gap={8}
            customStyle={{ width: 80 }}
          >
            <Box customStyle={{ position: 'relative' }}>
              <Skeleton
                width="48px"
                height="48px"
                disableAspectRatio
                customStyle={{ borderRadius: 32 }}
              />
              <Badge isNew={false}>
                <Icon name="FilterFilled" width={12} height={12} color={common.uiWhite} />
              </Badge>
            </Box>
            <Flexbox direction="vertical" gap={2} alignment="center">
              <Skeleton width="60px" height="16px" disableAspectRatio isRound />
              <Skeleton width="35px" height="12px" disableAspectRatio isRound />
            </Flexbox>
          </Flexbox>
        ))}
      {!isLoading &&
        accessUser &&
        content.map(({ id, keyword, filter, imageThumbnail, isNew }) => {
          let splitFilter: string | string[] = filter.split(',');

          if (splitFilter.length >= 3) {
            splitFilter = splitFilter.join(', ');
            // splitFilter = `${splitFilter.slice(0, 5).join(',')}...`;
          } else {
            splitFilter = splitFilter.join(',');
          }

          return (
            <Flexbox
              key={`home-product-keyword-${id}`}
              direction="vertical"
              alignment="center"
              gap={8}
              data-id={id}
              onClick={handleClick}
              customStyle={{ width: 80 }}
            >
              <AvatarWrap alignment="center" justifyContent="center">
                <GradiantBackground isNew={isNew} />
                {imageThumbnail ? (
                  <ImageAvatar src={imageThumbnail} alt="airjordan.jpg" isNew={isNew} />
                ) : (
                  <IconAvatar isNew={isNew}>
                    <Icon name="SearchOutlined" color={common.ui80} />
                  </IconAvatar>
                )}
                <Badge isNew={isNew}>
                  <Icon name="FilterFilled" width={12} height={12} color={common.uiWhite} />
                </Badge>
              </AvatarWrap>
              <Flexbox direction="vertical" gap={2} alignment="center">
                <Title variant="body2" weight="medium">
                  {keyword.replace(/,전체/g, '')}
                </Title>
                <Description variant="small2">{splitFilter}</Description>
              </Flexbox>
            </Flexbox>
          );
        })}
      {!isLoading &&
        isMounted &&
        savedRecentSearchList.slice(0, 12 - content.slice(0, 12).length).map(({ keyword }) => (
          <Flexbox
            key={`home-saved-recent-search-${keyword}`}
            direction="vertical"
            alignment="center"
            gap={8}
            onClick={handleClickKeyword(keyword)}
            customStyle={{ width: 80 }}
          >
            <IconAvatar>
              <Icon name="SearchOutlined" color={common.ui80} />
            </IconAvatar>
            <Flexbox direction="vertical" gap={2} alignment="center">
              <Title variant="body2" weight="medium">
                {keyword}
              </Title>
              <Description variant="small2">최근검색어</Description>
            </Flexbox>
          </Flexbox>
        ))}
      <Flexbox
        direction="vertical"
        alignment="center"
        gap={8}
        onClick={handleClickFind}
        customStyle={{ width: 80 }}
      >
        <IconAvatar>
          <Icon name="FilterOutlined" color={common.ui80} />
        </IconAvatar>
        <Title variant="body2" weight="medium">
          매물 찾기
        </Title>
      </Flexbox>
    </List>
  );
}

const List = styled.section`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 4px;
  margin: 10px 0 20px;
  padding: 0 12px;
  min-height: 98px;
  overflow-x: auto;
`;

const AvatarWrap = styled(Flexbox)`
  position: relative;
  width: 48px;
  height: 48px;
`;

const GradiantBackground = styled.div<{ isNew: boolean }>`
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  ${({
    theme: {
      palette: { common }
    },
    isNew
  }): CSSObject => {
    if (isNew) {
      return {
        background:
          'radial-gradient( farthest-side, #1463ff , transparent) top right/200% 200%, radial-gradient( farthest-corner, #6314ff, transparent 200px) top left/200% 200%;',
        animation: 'rotate 3s infinite linear'
      };
    }
    return { border: `1px solid ${common.line01}` };
  }};
  @keyframes rotate {
    from {
      -webkit-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;

const Badge = styled.div<{ isNew: boolean }>`
  position: absolute;
  right: -5px;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  z-index: 1;
  background-color: ${({
    theme: {
      palette: { primary, common }
    },
    isNew
  }) => (isNew ? primary.main : common.ui20)};
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.overlay20};
  border-radius: 32px;
`;

const ImageAvatar = styled(Avatar)<{ isNew: boolean }>`
  width: 44px;
  height: 44px;
  padding: 2px;
  background: white;
  border-radius: 50%;
  position: relative;
  z-index: 1;
`;

const IconAvatar = styled.div<{ isNew?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ isNew }) => (isNew ? 44 : 48)}px;
  height: ${({ isNew }) => (isNew ? 44 : 48)}px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      },
      isNew
    }) => (isNew ? 'none' : common.line01)};
  border-radius: 32px;
  position: relative;
  z-index: 1;
  background: white;
`;

const Title = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
`;

const Description = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
  word-break: keep-all;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
`;

export default HomeProductKeywordList;
