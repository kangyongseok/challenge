import { useEffect, useRef, useState } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, IconName, Image, Toast, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { UserNoti } from '@dto/user';
import type { SearchParams } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserNoti, postNotiRead } from '@api/userHistory';
import { fetchProductKeywords, putProductKeywordView } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PROMOTION_ATT } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime } from '@utils/formats';

import { camelSellerIsMovedScrollState } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface LabelData {
  id: 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
  text:
    | '찜한매물'
    | '사진감정'
    | '가격하락'
    | '이벤트'
    | '카멜추천'
    | '가격조정'
    | '감정요청'
    | '내 매물 등록'
    | '끌올'
    | '카멜 알림';
  iconName: IconName;
  bgColor: string;
  color: string;
}

function ActivityNotificationPanel() {
  const router = useRouter();
  const {
    theme: {
      palette: { common, secondary, primary }
    }
  } = useTheme();
  const resetCamelSellerMoveScroll = useResetRecoilState(camelSellerIsMovedScrollState);

  const labelData: LabelData[] = [
    {
      id: 10,
      text: '찜한매물',
      iconName: 'HeartFilled',
      bgColor: secondary.red.highlight,
      color: secondary.red.light
    },
    { id: 20, text: '사진감정', iconName: 'LegitFilled', bgColor: common.ui95, color: common.ui20 },
    {
      id: 30,
      text: '가격하락',
      iconName: 'WonFilled',
      bgColor: primary.highlight,
      color: primary.light
    },
    {
      id: 40,
      text: '이벤트',
      iconName: 'StarFilled',
      bgColor: secondary.purple.bgLight,
      color: secondary.purple.light
    },
    {
      id: 50,
      text: '카멜추천',
      iconName: 'SafeFilled',
      bgColor: primary.highlight,
      color: secondary.blue.light
    },
    {
      id: 60,
      text: '가격조정',
      iconName: 'WonFilled',
      bgColor: primary.highlight,
      color: primary.light
    },
    {
      id: 70,
      text: '감정요청',
      iconName: 'LegitFilled',
      bgColor: primary.highlight,
      color: primary.light
    },
    {
      id: 80,
      text: '내 매물 등록',
      iconName: 'Arrow4UpFilled',
      bgColor: primary.highlight,
      color: primary.light
    },
    {
      id: 90,
      text: '끌올',
      iconName: 'Arrow4UpFilled',
      bgColor: primary.highlight,
      color: primary.light
    },
    {
      id: 100,
      text: '카멜 알림',
      iconName: 'Logo_45_45',
      bgColor: common.ui95,
      color: common.ui60
    }
  ];
  const params = {
    size: 20,
    sort: 'dateCreated,DESC',
    type: 0
  };
  const observerRef = useRef<IntersectionObserver>();
  const targetRef = useRef<HTMLDivElement>(null);
  const { data: accessUser } = useQueryAccessUser();
  const [openToast, setOpenToast] = useState(false);
  const { mutate: productKeywordViewMutate } = useMutation(putProductKeywordView);
  const { mutate: productNotiReadMutate } = useMutation(postNotiRead);
  const { data, fetchNextPage, refetch } = useInfiniteQuery(
    queryKeys.userHistory.userNoti(params, accessUser?.userId),
    ({ pageParam = 0 }) => fetchUserNoti({ ...params, page: pageParam as number }),
    {
      getNextPageParam: (nextData) => {
        const { number = 0 } = nextData || {};
        return number < 4 ? number + 1 : undefined;
      },
      enabled: !!accessUser
    }
  );
  const { data: { content: productKeywords = [] } = {} } = useQuery(
    queryKeys.users.userProductKeywords(),
    fetchProductKeywords,
    {
      enabled: !!accessUser
    }
  );

  useEffect(() => {
    logEvent(attrKeys.noti.VIEW_BEHAVIOR_LIST);
  }, []);

  // 이 함수를 살려서 써야하는건지 제거해도 되는건지??
  const isProductKeywordProcess = (activityInfo: UserNoti) => {
    const productKeywordId = Number(activityInfo.parameter.split('/?')[1].split('=')[1]);
    const findProductKeyword = productKeywords.find(({ id }) => id === productKeywordId);

    if (findProductKeyword) {
      const searchParams: SearchParams = JSON.parse(findProductKeyword.keywordFilterJson);
      const getViewType = () => {
        if (findProductKeyword.sourceType === 3) {
          return 'categories';
        }

        if (findProductKeyword.sourceType === 1 || findProductKeyword.sourceType === 2) {
          return 'brands';
        }

        return 'search';
      };
      const getKeywordByViewType = (viewType: string) => {
        if (viewType === 'categories') {
          return searchParams.categories;
        }
        if (viewType === 'brands') {
          return searchParams.requiredBrands;
        }
        return searchParams.keyword;
      };

      const viewType = getViewType();
      const keyword = getKeywordByViewType(viewType);

      if (findProductKeyword.isNew) {
        productKeywordViewMutate(findProductKeyword.id, {
          onSettled: () =>
            router.push({
              pathname: `/products/${viewType}/${encodeURIComponent(String(keyword))}`,
              query: { ...searchParams }
            })
        });
      } else {
        router.push({
          pathname: `/products/${viewType}/${encodeURIComponent(String(keyword))}`,
          query: { ...searchParams }
        });
      }

      return;
    }
    setOpenToast(true);
  };

  const handleClick = (activityInfo: UserNoti) => {
    const promotionNoti = activityInfo.type === 100;
    const logTitleParser = () => {
      const splitParameter = activityInfo.parameter.split('/');
      if (activityInfo.parameter.indexOf('productList') === 1)
        return attrProperty.title.PRODUCT_LIST;
      if (splitParameter.includes('products')) return attrProperty.title.PRODUCT_DETAIL;
      if (splitParameter.includes('wishes')) return attrProperty.title.WISH_LIST;
      if (splitParameter.includes('announces')) return attrProperty.title.ANNOUNCE_DETAIL;
      if (splitParameter.includes('legit')) return attrProperty.title.LEGIT_INFO;
      return 'undefined parameter';
    };

    const promotionAttParser = (text: string) => {
      if (text === '가격조정') return PROMOTION_ATT.PRICE;
      if (text === '감정요청') return PROMOTION_ATT.LEGIT;
      if (text === '내 매물 등록') return PROMOTION_ATT.INFO;
      if (text === '끌올') return PROMOTION_ATT.UPDATE;
      return 'undefined parameter';
    };

    if (
      activityInfo.label.description === '가격조정' ||
      activityInfo.label.description === '내 매물 등록'
    ) {
      resetCamelSellerMoveScroll();
    }

    if (promotionNoti) {
      logEvent(attrKeys.noti.CLICK_BEHAVIOR, {
        name: attrProperty.name.BEHAVIOR_NOTI_LIST,
        title: attrProperty.title.SALES_PROMOTION,
        att: promotionAttParser(activityInfo.label.description),
        id: activityInfo.id,
        targetId: activityInfo.targetId,
        type: activityInfo.type,
        keyword: activityInfo.keyword,
        parameter: activityInfo.parameter
      });
    } else {
      logEvent(attrKeys.noti.CLICK_BEHAVIOR, {
        title: logTitleParser(),
        id: activityInfo.id,
        targetId: activityInfo.targetId,
        type: activityInfo.type,
        keyword: activityInfo.keyword,
        parameter: activityInfo.parameter
      });
    }

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.HISTORY,
      title: attrProperty.productTitle.BEHAVIOR,
      type: attrProperty.productType.HISTORY
    });

    productNotiReadMutate(
      {
        targetId: activityInfo.id,
        typeName: 'NV'
      },
      {
        onSuccess() {
          refetch();
          if (activityInfo.parameter) {
            // productKeywordId 란 파라미터는 제거됨
            if (activityInfo.parameter.indexOf('productKeywordId') !== -1) {
              isProductKeywordProcess(activityInfo);
              return;
            }
            router.push(activityInfo.parameter);
          }
        }
      }
    );
  };

  const intersectionObserver = (entries: IntersectionObserverEntry[], io: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        io.unobserve(entry.target);
        fetchNextPage();
      }
    });
  };

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(intersectionObserver);
    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Flexbox direction="vertical" gap={32} customStyle={{ padding: '32px 20px' }}>
      {data?.pages.map((page, pageIndex) => {
        if (!page) {
          return (
            <Flexbox direction="vertical" gap={4} alignment="center" justifyContent="center">
              <Typography variant="h0">😮</Typography>
              <Typography variant="h3" weight="bold">
                활동알림이 없습니다!
              </Typography>
            </Flexbox>
          );
        }
        return page.content?.map((activityInfo, i) => {
          const findLabel = find(labelData, { id: Number(activityInfo.label.name) }) as LabelData;
          if (process.env.NODE_ENV === 'development') {
            if (!findLabel) {
              throw new Error(
                `FE에서 [${activityInfo.label.description}]케이스가 정의되지 않았습니다`
              );
            }
          }
          return (
            <Flexbox
              gap={20}
              alignment="center"
              justifyContent="space-between"
              key={`user-noti-${activityInfo.id}`}
              onClick={() => handleClick(activityInfo)}
              customStyle={{ opacity: activityInfo.isViewed ? 0.3 : 1 }}
              ref={
                page.content.length * pageIndex + i === data.pages.length * page.content.length - 1
                  ? targetRef
                  : null
              }
            >
              <Box>
                <ActivityNotiLabel
                  justifyContent="center"
                  alignment="center"
                  gap={3}
                  bgColor={findLabel.bgColor}
                >
                  {findLabel.id === 100 ? (
                    <CamelSybol />
                  ) : (
                    <Icon
                      name={findLabel.iconName}
                      width={10}
                      height={10}
                      customStyle={{ color: findLabel.color }}
                    />
                  )}
                  <Typography
                    variant="small2"
                    weight="medium"
                    customStyle={{ color: findLabel.color }}
                  >
                    {findLabel?.text}
                  </Typography>
                </ActivityNotiLabel>
                <ItemContentsText dangerouslySetInnerHTML={{ __html: activityInfo.message }} />
                <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                  {getFormattedDistanceTime(new Date(activityInfo.dateCreated.replace(/-/g, '/')))}
                </Typography>
              </Box>
              {activityInfo.image && (
                <Box
                  customStyle={{
                    minWidth: 64,
                    position: 'relative'
                  }}
                >
                  {!activityInfo.isViewed && (
                    <NewIcon
                      src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/badge_new.png`}
                      alt="Badge Img"
                      width={16}
                      height={16}
                      disableAspectRatio
                    />
                  )}
                  <ProductImage
                    src={activityInfo.image}
                    alt="ActivityInfo Img"
                    disableAspectRatio
                    width={64}
                    height={64}
                    round={8}
                  />
                </Box>
              )}
            </Flexbox>
          );
        });
      })}
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        지금은 존재하지 않는 매물 목록이에요.
      </Toast>
    </Flexbox>
  );
}

const ActivityNotiLabel = styled(Flexbox)<{ bgColor: string }>`
  min-width: fit-content;
  max-width: fit-content;
  padding: 3.5px 4px;
  border-radius: 4px;
  background: ${({ bgColor }) => bgColor};
  margin-bottom: 8px;
  div {
    line-height: 11px;
  }
`;

const NewIcon = styled(Image)`
  position: absolute;
  top: -5px;
  right: -5px;
  z-index: 1;
`;

const ItemContentsText = styled(Typography)`
  p:first-of-type {
    font-size: ${({ theme: { typography } }) => typography.h4.size};
    font-weight: ${({ theme: { typography } }) => typography.h4.weight.medium};
    margin-bottom: 4px;
  }
  p:last-child {
    color: ${({ theme: { palette } }) => palette.common.ui60};
    margin-bottom: 8px;
  }
`;

const ProductImage = styled(Image)`
  img {
    height: auto;
    min-height: 64px;
  }
`;

function CamelSybol() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.783447 5.15699L1.92945 2.00699C2.00026 1.81246 2.14545 1.65402 2.33308 1.56653C2.52071 1.47905 2.73541 1.46968 2.92995 1.54049C3.12448 1.61131 3.28292 1.7565 3.37041 1.94413C3.45789 2.13176 3.46726 2.34646 3.39645 2.54099L2.44995 5.15699H0.783447ZM4.68345 5.15699H3.01695L4.16295 2.00699C4.23376 1.81246 4.37895 1.65402 4.56658 1.56653C4.75421 1.47905 4.96891 1.46968 5.16345 1.54049C5.35798 1.61131 5.51642 1.7565 5.60391 1.94413C5.69139 2.13176 5.70076 2.34646 5.62995 2.54099L4.68345 5.15699ZM8.62995 2.38049L7.84995 2.58149L6.91095 5.15699H5.24895L6.66345 1.27349L8.24145 0.868492C8.44195 0.816974 8.65471 0.847215 8.83291 0.952564C9.01112 1.05791 9.14018 1.22974 9.1917 1.43024C9.24321 1.63075 9.21297 1.8435 9.10763 2.02171C9.00228 2.19992 8.83045 2.32897 8.62995 2.38049Z"
        fill="#313438"
      />
    </svg>
  );
}

export default ActivityNotificationPanel;
