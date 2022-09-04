import { useCallback, useEffect, useMemo } from 'react';

import type { ParsedUrlQueryInput } from 'node:querystring';

import { useSetRecoilState } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CrazycurationFloatingButton,
  CrazycurationHeader,
  CrazycurationSeeMoreList,
  CrazycurationTabList,
  CrazycurationWeek
} from '@components/pages/crazycuration';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';
import { fetchContentsProducts } from '@api/common';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import checkAgent from '@utils/checkAgent';

import { dialogState } from '@recoil/common';

const eventStatus = {
  default: 0,
  ready: 1,
  progress: 2,
  closed: 3
};

const curationData: Record<
  '미친매력의급처매물' | '스캇프라그먼트자랑' | '샤넬클미자랑',
  {
    contentsId: 1 | 2 | 3;
    listType: 'a' | 'b';
    backgroundColor: string;
    brandData: { id: number; name: string }[];
    query: ParsedUrlQueryInput;
    weekData: number[];
    logEventTitle: string;
  }
> = {
  미친매력의급처매물: {
    contentsId: 1,
    listType: 'a',
    backgroundColor: '#000000',
    brandData: [
      { id: 0, name: '전체브랜드' },
      { id: 6, name: '구찌' },
      { id: 23, name: '보테가베네타' },
      { id: 25, name: '스톤아일랜드' },
      { id: 34, name: '디올' },
      { id: 44, name: '샤넬' },
      { id: 284, name: '에어팟' },
      { id: 125, name: '프라이탁' }
    ],
    query: {
      brandName: '',
      parentIds: [],
      lineIds: []
    },
    weekData: [2, 3, 4, 5, 6],
    logEventTitle: attrProperty.title.quick
  },
  스캇프라그먼트자랑: {
    contentsId: 2,
    listType: 'b',
    backgroundColor: '#FDF6E3',
    brandData: [],
    query: {
      brandName: '에어조던',
      parentIds: [14],
      subParentIds: [383],
      lineIds: [618, 137],
      requiredLineIds: [4705, 4458]
    },
    weekData: [4, 5, 6],
    logEventTitle: attrProperty.title.rare
  },
  샤넬클미자랑: {
    contentsId: 3,
    listType: 'b',
    backgroundColor: '#FDF6E3',
    brandData: [],
    query: {
      brandName: '샤넬',
      parentIds: [45],
      subParentIds: [327],
      lineIds: [579, 545, 1825],
      requiredLineIds: [3415, 4465, 3437]
    },
    weekData: [4, 5, 6],
    logEventTitle: attrProperty.title.rare
  }
};

function Crazycuration({
  isClosedEvent,
  nextEventUrl,
  nextEventTitle,
  isMobile
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isMobileWeb = isMobile && !checkAgent.isMobileApp();

  const router = useRouter();
  const { title = '' } = router.query;

  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo
  );
  const setDialogState = useSetRecoilState(dialogState);

  const currentCuration = useMemo(() => {
    const curationTitle = String(title)
      .replace(/[0-9-]/gim, '')
      .trim();

    if (curationTitle.length > 0) {
      const data = curationData[curationTitle as keyof typeof curationData];

      return {
        ...data,
        weekData: data.weekData.filter((id) => (gender === 'F' ? id !== 2 : id !== 3))
      };
    }

    return undefined;
  }, [gender, title]);

  const handleClickWishButtonEvent = useCallback(
    (
        {
          todayWishCount = 0,
          todayViewCount = 0,
          updatedCount = 0,
          priceDownCount = 0
        }: ProductResult,
        index: number
      ) =>
      () => {
        const eventParmas: Record<string, string | number> = {
          name: attrProperty.name.crazyWeek,
          title: currentCuration?.logEventTitle || '',
          index
        };

        if (todayWishCount > 0 || todayViewCount > 0) {
          eventParmas.att = todayWishCount > 0 ? 'WISH_HOT' : 'VIEW_HOT';
        }

        if (currentCuration?.listType === 'a' && (updatedCount > 0 || priceDownCount > 0)) {
          eventParmas.att2 = updatedCount > 0 ? 'UPDATE' : 'PRICE_LOW';
        }

        logEvent(attrKeys.crazycuration.clickWishList, eventParmas);
      },
    [currentCuration?.listType, currentCuration?.logEventTitle]
  );

  const handleProductAtt = useCallback(
    (
      {
        id,
        brand: { name: brandName },
        category: { name: categoryName, parentId },
        site: { name: siteName },
        price,
        todayWishCount = 0,
        todayViewCount = 0,
        updatedCount = 0,
        priceDownCount = 0
      }: ProductResult,
      index: number
    ) => {
      const eventParmas: Record<string, string | number> = {
        name: attrProperty.name.crazyWeek,
        title: currentCuration?.logEventTitle || '',
        index,
        id,
        brand: brandName,
        category: categoryName,
        parentCategory: FIRST_CATEGORIES[parentId as number],
        site: siteName,
        price,
        source: attrProperty.source.crazycuration
      };

      if (todayWishCount > 0 || todayViewCount > 0) {
        eventParmas.att = todayWishCount > 0 ? 'WISH_HOT' : 'VIEW_HOT';
      }

      if (currentCuration?.listType === 'a' && (updatedCount > 0 || priceDownCount > 0)) {
        eventParmas.att2 = updatedCount > 0 ? 'UPDATE' : 'PRICE_LOW';
      }

      return eventParmas;
    },
    [currentCuration?.listType, currentCuration?.logEventTitle]
  );

  const handleClickProduct = useCallback(
    (
        {
          id,
          todayWishCount = 0,
          todayViewCount = 0,
          updatedCount = 0,
          priceDownCount = 0
        }: ProductResult,
        index: number
      ) =>
      () => {
        const eventParmas: Record<string, string | number> = {
          name: attrProperty.name.crazyWeek,
          title: currentCuration?.logEventTitle || '',
          index
        };

        if (todayWishCount > 0 || todayViewCount > 0) {
          eventParmas.att = todayWishCount > 0 ? 'WISH_HOT' : 'VIEW_HOT';
        }

        if (currentCuration?.listType === 'a' && (updatedCount > 0 || priceDownCount > 0)) {
          eventParmas.att2 = updatedCount > 0 ? 'UPDATE' : 'PRICE_LOW';
        }

        logEvent(attrKeys.crazycuration.clickProductDetail, eventParmas);
        SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
          source: attrProperty.source.crazycuration
        });
        router.push(`/products/${id}`);
      },
    [currentCuration?.listType, currentCuration?.logEventTitle, router]
  );

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.KAKAO_JS_KEY);
    }

    if (currentCuration) {
      logEvent(attrKeys.crazycuration.view_crazyWeek, { att: currentCuration.logEventTitle });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isClosedEvent) return;

    logEvent(attrKeys.crazycuration.viewCrazyWeekPopup, { title: currentCuration?.logEventTitle });

    let content;
    let secondButtonUrl = '/search';

    if (nextEventUrl.length > 0 && nextEventTitle.length > 0) {
      content = (
        <Typography variant="h4" customStyle={{ marginBottom: 12 }}>
          오늘은 &lsquo;{nextEventTitle}&rsquo;이
          <br />
          준비되어 있는데 구경해보실래요?
        </Typography>
      );
      secondButtonUrl = nextEventUrl;
    }

    setDialogState({
      type: 'closedCrazyCuration',
      customStyleTitle: { marginTop: 12 },
      content,
      firstButtonAction() {
        logEvent(attrKeys.crazycuration.clickClose, {
          name: attrProperty.name.crazyWeek,
          title: attrProperty.title.popup
        });

        if (window.history.length > 2) {
          router.back();
        } else {
          router.push('/');
        }
      },
      secondButtonAction() {
        logEvent(attrKeys.crazycuration.clickCrazyWeek, {
          name: attrProperty.name.popup,
          title: currentCuration?.logEventTitle
        });
        router.push(secondButtonUrl);
      },
      disabledOnClose: true
    });
  }, [
    currentCuration?.logEventTitle,
    isClosedEvent,
    nextEventTitle,
    nextEventUrl,
    router,
    setDialogState
  ]);

  return currentCuration ? (
    <>
      <GeneralTemplate
        header={<CrazycurationHeader />}
        customStyle={{ '& > main': { backgroundColor: currentCuration.backgroundColor } }}
        disablePadding
      >
        <Flexbox component="section" justifyContent="center">
          <CurationImg
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/crazycuration/main${currentCuration.contentsId}.png`}
            alt={`${title}.png`}
          />
        </Flexbox>
        <Flexbox
          component="section"
          direction="vertical"
          justifyContent="center"
          gap={32}
          customStyle={{ padding: '52px 0 84px' }}
        >
          <Flexbox justifyContent="center" customStyle={{ padding: '0 20px' }}>
            <CurationImg
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/crazycuration/description${currentCuration.contentsId}.png`}
              alt={`${title} Description`}
            />
          </Flexbox>
          {currentCuration.listType === 'a' && (
            <CrazycurationTabList
              contentsId={currentCuration.contentsId}
              brandData={currentCuration.brandData}
              onProductAtt={handleProductAtt}
              onClickProduct={handleClickProduct}
              handleClickWishButtonEvent={handleClickWishButtonEvent}
            />
          )}
          {currentCuration.listType === 'b' && (
            <CrazycurationSeeMoreList
              contentsId={currentCuration.contentsId}
              urlQuery={currentCuration.query}
              onProductAtt={handleProductAtt}
              onClickProduct={handleClickProduct}
              handleClickWishButtonEvent={handleClickWishButtonEvent}
              logEventTitle={currentCuration.logEventTitle}
            />
          )}
        </Flexbox>
        <CrazycurationWeek
          weekData={currentCuration.weekData}
          isMobileWeb={isMobileWeb}
          logEventTitle={currentCuration.logEventTitle}
        />
      </GeneralTemplate>
      <CrazycurationFloatingButton
        contentsId={currentCuration.contentsId}
        listType={currentCuration.listType}
      />
    </>
  ) : null;
}

export async function getServerSideProps({
  req,
  query: { title = '' } = {}
}: GetServerSidePropsContext) {
  const userAgent = req.headers['user-agent'];
  const queryClient = new QueryClient();
  let isClosedEvent = false;
  let nextEventUrl = '';
  let nextEventTitle = '';

  const curationTitle = String(title)
    .replace(/[0-9-]/gim, '')
    .trim();
  const currentCuration =
    curationTitle.length > 0 ? curationData[curationTitle as keyof typeof curationData] : undefined;

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (currentCuration?.contentsId) {
    const { contents: { status: currentEventStatus } = {} } = await queryClient.fetchQuery(
      queryKeys.common.contentsProducts(currentCuration.contentsId),
      () => fetchContentsProducts(currentCuration.contentsId)
    );

    if (currentEventStatus === eventStatus.closed) {
      const { contents: { url: eventUrl = '', title: eventTitle = '' } = {} } =
        await queryClient.fetchQuery(queryKeys.common.contentsProducts(0), () =>
          fetchContentsProducts(0)
        );
      isClosedEvent = true;
      nextEventUrl = eventUrl;
      nextEventTitle = eventTitle;
    }
  }

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo);
  }

  return {
    props: {
      isClosedEvent,
      nextEventUrl,
      nextEventTitle,
      isMobile: checkAgent.isAllMobileWeb(userAgent),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

const CurationImg = styled.img``;

export default Crazycuration;
