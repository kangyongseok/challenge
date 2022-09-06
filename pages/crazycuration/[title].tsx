import { useCallback, useEffect } from 'react';

import type { ParsedUrlQueryInput } from 'node:querystring';

import { useSetRecoilState } from 'recoil';
import { QueryClient, dehydrate } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { CustomStyle, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import CrazycurationMultiList from '@components/pages/crazycuration/CrazycurationMultiList';
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
import useContentsProducts from '@hooks/useContentsProducts';

const eventStatus = {
  default: 0,
  ready: 1,
  progress: 2,
  closed: 3
};

const colorData = {
  1: {
    backgroundColor: '#000000',
    // tabStyle: {
    //   // color: '#313438',
    //   // backgroundColor: '#7B7D85',
    //   // activeColor: '#000000',
    //   // activeBackgroundColor: '#ACFF25'
    // },
    productCardStyle: {
      areaWithDateInfoCustomStyle: {
        color: '#FFFFFF',
        opacity: 0.6
      },
      metaCamelInfoCustomStyle: {
        '& > svg,div': { color: '#FFFFFF !important', opacity: 0.6 }
      }
    },
    wishButtonStyle: {
      button: {
        color: '#FFFFFF',
        backgroundColor: '#313438'
      },
      selectedButton: {
        color: '#ACFF25',
        backgroundColor: '#000000',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }
    },
    floatingButtonStyle: { color: '#000000', backgroundColor: '#ACFF25' }
  },
  2: {
    backgroundColor: '#FDF6E3',
    buttonColor: '#507C44',
    productCardStyle: {
      todayWishViewLabelCustomStyle: {
        color: '#FFFFFF',
        backgroundColor: '#507C44'
      },
      areaWithDateInfoCustomStyle: { color: '#000000', opacity: 0.5 },
      metaCamelInfoCustomStyle: {
        '& > svg,div': { color: '#000000 !important', opacity: 0.5 }
      }
    },
    wishButtonStyle: {
      button: {
        color: '#313438',
        backgroundColor: '#FFFFFF',
        boxShadow:
          '0px 1px 2px rgba(194, 102, 53, 0.3), inset 0px -1px 2px rgba(0, 0, 0, 0.08), inset 0px 1px 2px rgba(255, 255, 255, 0.5)'
      },
      selectedButton: {
        color: '#313438',
        backgroundColor: '#EFE3C9',
        border: 'none'
      }
    },
    floatingButtonStyle: { color: '#FFFFFF', backgroundColor: '#507C44' }
  },
  3: {
    backgroundColor: '#00AD7F',
    buttonColor: '#507C44',
    tabStyle: {
      color: '#FFFFFF',
      backgroundColor: '#05936D',
      activeColor: '#00533D',
      activeBackgroundColor: '#FFE344'
    },
    productCardStyle: {
      todayWishViewLabelCustomStyle: {
        color: '#00533D',
        backgroundColor: '#FFE344'
      },
      areaWithDateInfoCustomStyle: { color: '#FFFFFF', opacity: 0.6 },
      metaCamelInfoCustomStyle: {
        '& > svg,div': { color: '#FFFFFF !important', opacity: 0.6 }
      }
    },
    wishButtonStyle: {
      button: {
        color: '#313438',
        backgroundColor: '#FFFFFF'
      },
      selectedButton: {
        color: '#FFE344',
        backgroundColor: '#05936D',
        border: 'none'
      }
    },
    floatingButtonStyle: { color: '#00AD7F', backgroundColor: '#FFFFFF' }
  },
  4: {
    backgroundColor: '#FFFFFF',
    buttonColor: '#007AF7',
    infoStyle: {
      titleStyle: { color: '#BEAB78', fontWeight: 700 },
      highlightColor: '#007AF7'
    },
    productCardStyle: {
      todayWishViewLabelCustomStyle: {
        color: '#FFFFFF',
        backgroundColor: '#007AF7'
      },
      areaWithDateInfoCustomStyle: { color: '#000000', opacity: 0.5 },
      metaCamelInfoCustomStyle: {
        '& > svg,div': { color: '#000000 !important', opacity: 0.5 }
      }
    },
    wishButtonStyle: {
      button: {
        color: '#313438',
        backgroundColor: '#EFF0F2'
      },
      selectedButton: {
        color: '#007AF7',
        backgroundColor: '#FFFFFF',
        border: '2px solid #EFF0F2'
      }
    },
    floatingButtonStyle: {
      color: '#FFFFFF',
      backgroundColor: '#007AF7',
      borderColor: '#000000'
    }
  },
  5: {
    backgroundColor: '#A2C163',
    buttonColor: '#4A603B',
    infoStyle: {
      titleStyle: { color: '#000000', fontWeight: 500 },
      highlightColor: '#4A603B'
    },
    productCardStyle: {
      todayWishViewLabelCustomStyle: {
        color: '#FFFFFF',
        backgroundColor: '#1D2915'
      },
      areaWithDateInfoCustomStyle: { color: '#000000', opacity: 0.5 },
      metaCamelInfoCustomStyle: {
        '& > svg,div': { color: '#000000 !important', opacity: 0.5 }
      }
    },
    wishButtonStyle: {
      button: {
        color: '#313438',
        backgroundColor: '#FFFFFF',
        border: '2px solid #1D2915',
        boxShadow: '1px 2px 0px #1D2915'
      },
      selectedButton: {
        color: '#FFFFFF',
        backgroundColor: '#8EAC50',
        border: 'none'
      }
    },
    floatingButtonStyle: {
      color: '#4A603B',
      backgroundColor: '#FDEB14',
      badgeColor: '#4A603B',
      badgeBackgroundColor: '#FFFFFF',
      borderColor: '#000000',
      boxShadow: '1px 2px 0px #000000'
    }
  }
};

const curationData: Record<
  string,
  {
    contentsId: 1 | 2 | 3 | 4 | 5 | 6;
    listType: 'a' | 'b' | 'c' | 'c-1';
    backgroundColor: string;
    buttonColor?: string;
    brandData: { id: number; name: string }[];
    query: ParsedUrlQueryInput;
    weekData: number[];
    showCountLabel?: boolean;
    logEventTitle: string;
    infoStyle?: {
      titleStyle: CustomStyle;
      highlightColor: string;
    };
    tabStyle?: {
      color: string;
      backgroundColor: string;
      activeColor: string;
      activeBackgroundColor: string;
    };
    productCardStyle: {
      todayWishViewLabelCustomStyle?: CustomStyle;
      areaWithDateInfoCustomStyle?: CustomStyle;
      metaCamelInfoCustomStyle?: CustomStyle;
    };
    wishButtonStyle: {
      button: CustomStyle;
      selectedButton: CustomStyle;
    };
    floatingButtonStyle: {
      color: string;
      backgroundColor: string;
      badgeColor?: string;
      badgeBackgroundColor?: string;
      borderColor?: string;
      boxShadow?: string;
    };
  }
> = {
  미친매력의급처매물: {
    contentsId: 1,
    listType: 'a',
    brandData: [
      { id: 0, name: '전체브랜드' },
      { id: 6, name: '구찌' },
      { id: 34, name: '디올' },
      { id: 11, name: '루이비통' },
      { id: 14, name: '메종키츠네' },
      { id: 17, name: '무스너클' },
      { id: 23, name: '보테가베네타' },
      { id: 25, name: '스톤아일랜드' },
      { id: 53, name: '아미' },
      { id: 27, name: '알렉산더맥퀸' },
      { id: 32, name: '톰브라운' }
    ],
    query: {},
    weekData: [2, 3, 4, 5, 6],
    showCountLabel: true,
    logEventTitle: attrProperty.title.quick,
    ...colorData['1']
  },
  스캇프라그먼트자랑: {
    contentsId: 2,
    listType: 'b',
    brandData: [],
    query: {
      brandName: '에어조던',
      parentIds: [14],
      subParentIds: [383],
      lineIds: [618, 137],
      requiredLineIds: [4705, 4458]
    },
    weekData: [4, 5, 6],
    logEventTitle: attrProperty.title.rare,
    ...colorData['2']
  },
  샤넬클미자랑: {
    contentsId: 3,
    listType: 'b',
    brandData: [],
    query: {
      brandName: '샤넬',
      parentIds: [45],
      subParentIds: [327],
      lineIds: [579, 545, 1825],
      requiredLineIds: [3415, 4465, 3437]
    },
    weekData: [4, 5, 6],
    logEventTitle: attrProperty.title.rare,
    ...colorData['2']
  },
  명품이이가격에: {
    contentsId: 4,
    listType: 'a',
    brandData: [
      { id: 0, name: '전체브랜드' },
      { id: 6, name: '구찌' },
      { id: 34, name: '디올' },
      { id: 11, name: '루이비통' },
      { id: 14, name: '메종키츠네' },
      { id: 17, name: '무스너클' },
      { id: 23, name: '보테가베네타' },
      { id: 44, name: '샤넬' },
      { id: 25, name: '스톤아일랜드' },
      { id: 53, name: '아미' },
      { id: 27, name: '알렉산더맥퀸' },
      { id: 32, name: '톰브라운' }
    ],
    query: {},
    weekData: [5, 6],
    logEventTitle: attrProperty.title.lowPrice,
    ...colorData['3']
  },
  최강시세방어: {
    contentsId: 5,
    listType: 'c',
    brandData: [],
    query: {},
    weekData: [6],
    logEventTitle: attrProperty.title.priceDefense,
    ...colorData['4']
  },
  캠프사랑산악회대모집: {
    contentsId: 6,
    listType: 'c-1',
    brandData: [],
    query: {},
    weekData: [],
    logEventTitle: attrProperty.title.camping,
    ...colorData['5']
  }
};

function Crazycuration({
  curationTitle,
  currentCuration,
  isClosedEvent,
  nextEventUrl,
  nextEventTitle,
  isMobile
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isMobileWeb = isMobile && !checkAgent.isMobileApp();
  const router = useRouter();

  const setDialogState = useSetRecoilState(dialogState);

  const {
    data: {
      contents: { title: ogTitle, description: ogDescription, imageThumbnail: ogImage, url: ogUrl }
    }
  } = useContentsProducts(currentCuration?.contentsId || 0);

  const handleClickWishButtonEvent = useCallback(
    (
        {
          isWish,
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

        logEvent(
          isWish ? attrKeys.crazycuration.clickWishCancel : attrKeys.crazycuration.clickWish,
          eventParmas
        );
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
      logEvent(attrKeys.crazycuration.viewCrazyWeek, { att: currentCuration.logEventTitle });
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
      <PageHead
        title={`${ogTitle} | 카멜 최저가 가격비교`}
        description={ogDescription}
        ogTitle={`${ogTitle} | 카멜 최저가 가격비교`}
        ogDescription={ogDescription}
        ogImage={ogImage}
        ogUrl={`${(typeof window !== 'undefined' && window.location.protocol) || 'https:'}//${
          (typeof window !== 'undefined' && window.location.host) || 'mrcamel.co.kr'
        }${ogUrl}`}
      />
      <GeneralTemplate
        header={<CrazycurationHeader />}
        customStyle={{ '& > main': { backgroundColor: currentCuration.backgroundColor } }}
        disablePadding
      >
        <Flexbox component="section" justifyContent="center">
          <CurationImg
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/crazycuration/main${currentCuration.contentsId}.png`}
            alt={`${curationTitle}.png`}
          />
        </Flexbox>
        <Flexbox
          component="section"
          direction="vertical"
          justifyContent="center"
          gap={32}
          customStyle={{ padding: '52px 0 84px' }}
        >
          {[1, 2, 3].includes(currentCuration.contentsId) && (
            <Flexbox justifyContent="center" customStyle={{ padding: '0 20px' }}>
              <CurationImg
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/crazycuration/description${currentCuration.contentsId}.png`}
                alt={`${curationTitle} Description`}
              />
            </Flexbox>
          )}
          {currentCuration.listType === 'a' && (
            <CrazycurationTabList
              contentsId={currentCuration.contentsId}
              brandData={currentCuration.brandData}
              tabStyle={currentCuration.tabStyle}
              productCardStyle={currentCuration.productCardStyle}
              wishButtonStyle={currentCuration.wishButtonStyle}
              showCountLabel={currentCuration.showCountLabel}
              onProductAtt={handleProductAtt}
              onClickProduct={handleClickProduct}
              handleClickWishButtonEvent={handleClickWishButtonEvent}
            />
          )}
          {currentCuration.listType === 'b' && (
            <CrazycurationSeeMoreList
              contentsId={currentCuration.contentsId}
              urlQuery={currentCuration.query}
              logEventTitle={currentCuration.logEventTitle}
              buttonColor={currentCuration.buttonColor}
              productCardStyle={currentCuration.productCardStyle}
              wishButtonStyle={currentCuration.wishButtonStyle}
              onProductAtt={handleProductAtt}
              onClickProduct={handleClickProduct}
              handleClickWishButtonEvent={handleClickWishButtonEvent}
            />
          )}
          {['c', 'c-1'].includes(currentCuration.listType) && (
            <CrazycurationMultiList
              contentsId={currentCuration.contentsId}
              showSectionImage={currentCuration.listType === 'c-1'}
              logEventTitle={currentCuration.logEventTitle}
              buttonColor={currentCuration.buttonColor}
              infoStyle={currentCuration.infoStyle}
              productCardStyle={currentCuration.productCardStyle}
              wishButtonStyle={currentCuration.wishButtonStyle}
              onProductAtt={handleProductAtt}
              onClickProduct={handleClickProduct}
              handleClickWishButtonEvent={handleClickWishButtonEvent}
            />
          )}
        </Flexbox>
        {currentCuration.weekData.length > 0 && (
          <CrazycurationWeek
            weekData={currentCuration.weekData}
            isMobileWeb={isMobileWeb}
            logEventTitle={currentCuration.logEventTitle}
          />
        )}
      </GeneralTemplate>
      <CrazycurationFloatingButton
        contentsId={currentCuration.contentsId}
        buttonStyle={currentCuration.floatingButtonStyle}
      />
    </>
  ) : null;
}

export async function getServerSideProps({
  req,
  query: { title = '' } = {}
}: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const userAgent = req.headers['user-agent'];
  const curationTitle = String(title)
    .replace(/[0-9-]/gim, '')
    .trim();
  const currentCuration =
    curationTitle.length > 0 ? curationData[curationTitle as keyof typeof curationData] : null;
  let isClosedEvent = false;
  let nextEventUrl = '';
  let nextEventTitle = '';
  let gender = 'M';

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (currentCuration?.contentsId) {
    const { contents: { status: currentEventStatus, targetContents } = {} } =
      await queryClient.fetchQuery(
        queryKeys.common.contentsProducts(currentCuration.contentsId),
        () => fetchContentsProducts(currentCuration.contentsId)
      );
    const { url: eventUrl = '', title: eventTitle = '' } = targetContents || {};

    if (currentEventStatus === eventStatus.closed) {
      isClosedEvent = true;
      nextEventUrl = eventUrl;
      nextEventTitle = eventTitle;
    }
  }

  if (req.cookies.accessToken) {
    const { info: { value: { gender: userGender = '' } = {} } = {} } = await queryClient.fetchQuery(
      queryKeys.users.userInfo(),
      fetchUserInfo
    );

    if (userGender.length > 0) gender = userGender;
  }

  return {
    props: {
      curationTitle,
      currentCuration: currentCuration
        ? {
            ...currentCuration,
            weekData: currentCuration.weekData.filter((id) =>
              gender === 'F' ? id !== 2 : id !== 3
            )
          }
        : currentCuration,
      isClosedEvent,
      nextEventUrl,
      nextEventTitle,
      isMobile: checkAgent.isAllMobileWeb(userAgent),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

const CurationImg = styled.img`
  min-width: 100%;
`;

export default Crazycuration;
