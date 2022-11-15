import { useEffect, useRef, useState } from 'react';

import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import * as SvgIcons from 'mrcamel-ui/dist/assets/icons';
import { Box, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

import type { UserNoti } from '@dto/user';
import type { SearchParams } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserNoti, postNotiRead } from '@api/userHistory';
import { fetchProductKeywords, putProductKeywordView } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface LabelData {
  id: 10 | 20 | 30 | 40 | 50;
  text: '찜한매물' | '사진감정' | '가격하락' | '이벤트' | '카멜추천';
  iconName: keyof typeof SvgIcons;
  bgColor: string;
  color: string;
}

function ActivityNotificationPanel({ allRead }: { allRead: boolean }) {
  const router = useRouter();
  const {
    theme: {
      palette: { common, secondary, primary }
    }
  } = useTheme();
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
    queryKeys.userHistory.userNoti(params),
    ({ pageParam = 0 }) => fetchUserNoti({ ...params, page: pageParam as number }),
    {
      getNextPageParam: (nextData) => {
        const { number = 0 } = nextData || {};
        return number < 4 ? number + 1 : undefined;
      }
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

  useEffect(() => {
    if (allRead) {
      refetch();
    }
  }, [allRead, refetch]);

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
    logEvent(attrKeys.noti.CLICK_BEHAVIOR, {
      id: activityInfo.id,
      targetId: activityInfo.targetId,
      type: activityInfo.type,
      keyword: activityInfo.keyword
    });
    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.HISTORY,
      title: attrProperty.productTitle.BEHAVIOR,
      type: attrProperty.productType.HISTORY
    });
    const productKeywordId = Number(activityInfo.parameter.split('/?')[1].split('=')[1]);
    const findProductKeyword = productKeywords.find(({ id }) => id === productKeywordId);
    if (findProductKeyword) {
      logEvent(attrKeys.noti.CLICK_PRODUCT_LIST, {
        name: attrProperty.name.ALARM_LIST
      });
    }
    if (!findProductKeyword && activityInfo.parameter.split('/').includes('products')) {
      logEvent(attrKeys.noti.CLICK_PRODUCT_DETAIL, {
        name: attrProperty.name.ALARM_LIST
      });
    }
    if (activityInfo.parameter.split('/').includes('wishes')) {
      logEvent(attrKeys.noti.CLICK_WISH_LIST, {
        name: attrProperty.name.ALARM_LIST
      });
    }
    if (activityInfo.parameter.split('/').includes('announces')) {
      logEvent(attrKeys.noti.CLICK_ANNOUNCE_DETAIL, {
        name: attrProperty.name.ALARM_LIST
      });
    }
    if (activityInfo.parameter.split('/').includes('legit')) {
      logEvent(attrKeys.noti.CLICK_LEGIT_INFO, {
        name: attrProperty.name.ALARM_LIST
      });
    }

    productNotiReadMutate(
      {
        targetId: activityInfo.id,
        typeName: 'NV'
      },
      {
        onSuccess() {
          refetch();
          if (activityInfo.parameter) {
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
    <Flexbox direction="vertical" gap={32} customStyle={{ padding: '32px 0' }}>
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
                  <Icon
                    name={findLabel.iconName}
                    width={10}
                    height={10}
                    customStyle={{ color: findLabel.color }}
                  />
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
                      width={16}
                      height={16}
                      disableAspectRatio
                    />
                  )}
                  <Image
                    src={activityInfo.image}
                    disableAspectRatio
                    width={64}
                    height={64}
                    customStyle={{ borderRadius: 8 }}
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
  max-width: 59px;
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
  p:first-child {
    font-size: ${({ theme: { typography } }) => typography.h4.size};
    font-weight: ${({ theme: { typography } }) => typography.h4.weight.medium};
    margin-bottom: 4px;
  }
  p:last-child {
    color: ${({ theme: { palette } }) => palette.common.ui60};
    margin-bottom: 8px;
  }
`;

export default ActivityNotificationPanel;
