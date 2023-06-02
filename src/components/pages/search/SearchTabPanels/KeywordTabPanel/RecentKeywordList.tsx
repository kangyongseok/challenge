import { useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Avatar, Box, Chip, Flexbox, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import type { ProductKeywordsContent } from '@dto/user';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { deleteProductKeywords, fetchProductKeywords } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { SEARCH_TIME_FOR_EXIT_BOTTOM_SHEET } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchTabPanelsSwiperThresholdState } from '@recoil/search';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function RecentKeywordList() {
  const router = useRouter();

  const {
    palette: { common }
  } = useTheme();

  const [keywords] = useState([
    '샤넬 클래식 미디움',
    '나이키 범고래',
    '스톤 맨투맨',
    '루이비통 지갑',
    '구찌 마몬트 숄더백',
    '나이키 조던1'
  ]);

  const setSearchTabPanelsSwiperThresholdState = useSetRecoilState(
    searchTabPanelsSwiperThresholdState
  );

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: { content = [] } = {},
    isInitialLoading,
    refetch
  } = useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
    refetchOnMount: true,
    enabled: !!accessUser
  });

  const { mutate, isLoading } = useMutation(deleteProductKeywords);

  const handleClick =
    ({
      keyword,
      index,
      keywordFilterJson,
      sourceType
    }: ProductKeywordsContent & {
      index: number;
    }) =>
    () => {
      const title = () => {
        if (sourceType === 3) {
          return 'CATEGORY';
        }
        if (sourceType === 1 || sourceType === 2) {
          return 'BRAND';
        }
        return 'SEARCH';
      };

      logEvent(attrKeys.search.CLICK_RECENT, {
        name: attrProperty.name.SEARCH,
        title: title(),
        index,
        keyword
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.RECENT,
        type: attrProperty.type.INPUT
      });

      LocalStorage.set(SEARCH_TIME_FOR_EXIT_BOTTOM_SHEET, dayjs());

      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.RECENT,
        type: attrProperty.type.INPUT,
        keyword
      });

      let viewType = 'search';
      let productKeyword = keyword;
      const query = JSON.parse(keywordFilterJson);

      if (sourceType === 3) {
        viewType = 'categories';
        productKeyword = query.categories;

        delete query.categories;
      } else if (sourceType === 1 || sourceType === 2) {
        viewType = 'brands';
        productKeyword = query.requiredBrands;

        // 콜라보 브랜드 케이스 처리
        if (Array.isArray(productKeyword)) {
          productKeyword = keyword.replace(/,전체/g, '').replace(/X/g, '-');
        }

        delete query.requiredBrands;
      } else {
        delete query.keyword;
      }

      router.push({
        pathname: `/products/${viewType}/${encodeURIComponent(String(productKeyword))}`,
        query
      });
    };

  const handleClickRecommendKeyword = (keyword: string) => () => {
    logEvent(attrKeys.search.CLICK_RECOMMTAG, {
      name: attrProperty.name.SEARCH,
      keyword
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.SEARCH,
      title: attrProperty.title.RECOMMTAG,
      type: attrProperty.type.GUIDED
    });

    LocalStorage.set(SEARCH_TIME_FOR_EXIT_BOTTOM_SHEET, dayjs());

    router.push(`/products/search/${keyword}`);
  };

  const handleClickAllDelete = () => {
    logEvent(attrKeys.search.CLICK_RECENT_DELETE, {
      name: attrProperty.name.SEARCH,
      att: 'ALL'
    });

    if (isLoading) return;

    mutate(undefined, {
      async onSuccess() {
        await refetch();
      }
    });
  };

  if (!isInitialLoading && !content.length) {
    return (
      <Box
        component="section"
        customStyle={{
          marginTop: 12
        }}
      >
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{
            padding: '20px 20px 0'
          }}
        >
          추천 검색어
        </Typography>
        <Flexbox
          gap={6}
          customStyle={{
            padding: 20,
            flexWrap: 'wrap'
          }}
        >
          {keywords.map((keyword) => (
            <Chip
              key={`search-recommend-keyword-${keyword}`}
              onClick={handleClickRecommendKeyword(keyword)}
            >
              {keyword}
            </Chip>
          ))}
        </Flexbox>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 12
      }}
    >
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        gap={2}
        customStyle={{
          padding: '20px 20px 0'
        }}
      >
        <Typography variant="h3" weight="bold">
          최근 본 검색어
        </Typography>
        <Typography variant="body2" weight="medium" onClick={handleClickAllDelete}>
          전체삭제
        </Typography>
      </Flexbox>
      <List
        onTouchStart={() => setSearchTabPanelsSwiperThresholdState(1000)}
        onTouchEnd={() => setSearchTabPanelsSwiperThresholdState(5)}
      >
        {isInitialLoading &&
          Array.from({ length: 8 })
            .map((_, index) => index)
            .map((index) => (
              <Skeleton
                key={`search-recent-keyword-skeleton-${index}`}
                width={80}
                height={32}
                round={16}
                disableAspectRatio
              />
            ))}
        {!isInitialLoading &&
          content
            .slice(0, 10)
            .map(
              (
                { keyword, keywordFilterJson, imageThumbnail, sourceType, brand, ...props },
                index
              ) => (
                <Chip
                  // eslint-disable-next-line react/no-array-index-key
                  key={`search-recent-keyword-${keyword}-${index}`}
                  startIcon={
                    <>
                      {sourceType > 1 && imageThumbnail && (
                        <Avatar
                          width={24}
                          height={24}
                          src={imageThumbnail}
                          alt={keyword}
                          round="50%"
                          customStyle={{
                            padding: '2px',
                            backgroundColor: common.bg02
                          }}
                        />
                      )}
                      {sourceType === 1 && brand && (
                        <Typography
                          variant="h4"
                          weight="bold"
                          customStyle={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: common.bg02
                          }}
                        >
                          {brand?.nameEng.charAt(0).toUpperCase()}
                        </Typography>
                      )}
                    </>
                  }
                  onClick={handleClick({
                    keyword,
                    keywordFilterJson,
                    imageThumbnail,
                    sourceType,
                    brand,
                    index,
                    ...props
                  })}
                  customStyle={{
                    gap: 6,
                    padding:
                      (sourceType > 1 && imageThumbnail) || (sourceType === 1 && brand)
                        ? '4px 12px 4px 4px'
                        : '6px 12px'
                  }}
                >
                  {sourceType === 3 &&
                    JSON.parse(keywordFilterJson)?.genders &&
                    JSON.parse(keywordFilterJson)?.genders[0] &&
                    (JSON.parse(keywordFilterJson)?.genders[0] === 'male' ? '남성 ' : '여성 ')}
                  {keyword.replace(/,전체/g, '').replace(/-/g, ' ').replace(/\(P\)/g, '')}
                </Chip>
              )
            )}
      </List>
    </Box>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 6px;
  padding: 20px;
  overflow-x: auto;
`;

export default RecentKeywordList;
