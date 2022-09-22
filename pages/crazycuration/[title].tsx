import { useCallback, useEffect } from 'react';

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

import { checkAgent, executedShareURl } from '@utils/common';

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
    imageCardStyle: {
      backgroundColor: '#D7BE7D',
      border: '2px solid #1D2915',
      boxShadow: '4px 6px 0px #1D2915'
    },
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
  },
  6: {
    backgroundColor: '#C6AB8E',
    buttonColor: '#2C455E',
    imageCardStyle: {
      backgroundColor: '#2C455E',
      border: '3px solid #2C455E',
      borderRadius: '8px 8px 100px 100px'
    },
    infoStyle: {
      titleStyle: { color: '#000000', fontWeight: 500 },
      highlightColor: '#FFFFFF'
    },
    productCardStyle: {
      todayWishViewLabelCustomStyle: {
        color: '#FFFFFF',
        backgroundColor: '#2C455E'
      },
      areaWithDateInfoCustomStyle: { color: '#000000', opacity: 0.5 },
      metaCamelInfoCustomStyle: {
        '& > svg,div': { color: ' !important #000000', opacity: 0.5 }
      }
    },
    wishButtonStyle: {
      button: {
        color: '#2C455E',
        backgroundColor: '#FFFFFF'
      },
      selectedButton: {
        color: '#2C455E',
        backgroundColor: '#B1977A',
        border: 'none'
      }
    },
    floatingButtonStyle: {
      color: '#2C455E',
      backgroundColor: '#FFD12D',
      badgeColor: '#FFD12D',
      badgeBackgroundColor: '#2C455E'
    }
  }
};

const curationData: Record<
  string,
  {
    contentsId: number;
    listType: 'a' | 'b' | 'c' | 'c-1';
    backgroundColor: string;
    buttonColor?: string;
    brandData: { id: number; name: string }[];
    weekData: number[];
    showDescription?: boolean;
    showCountLabel?: boolean;
    nextEventDateLabel?: string;
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
    imageCardStyle?: CustomStyle;
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
    weekData: [2, 3, 4, 5, 6],
    showDescription: true,
    showCountLabel: true,
    logEventTitle: attrProperty.title.quick,
    ...colorData['1']
  },
  스캇프라그먼트자랑: {
    contentsId: 2,
    listType: 'b',
    brandData: [],
    weekData: [4, 5, 6],
    showDescription: true,
    logEventTitle: attrProperty.title.rare,
    ...colorData['2']
  },
  샤넬클미자랑: {
    contentsId: 3,
    listType: 'b',
    brandData: [],
    showDescription: true,
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
    weekData: [5, 6],
    logEventTitle: attrProperty.title.lowPrice,
    ...colorData['3']
  },
  최강시세방어: {
    contentsId: 5,
    listType: 'c',
    brandData: [],
    weekData: [6, 7, 8, 9, 10, 11, 12],
    logEventTitle: attrProperty.title.priceDefense,
    ...colorData['4']
  },
  캠프사랑산악회대모집: {
    contentsId: 6,
    listType: 'c-1',
    brandData: [],
    nextEventDateLabel: '9/12 월',
    weekData: [7, 8, 9, 10, 11, 12],
    logEventTitle: attrProperty.title.camping,
    ...colorData['5']
  },
  7: {
    contentsId: 7,
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
    showDescription: true,
    weekData: [8, 9, 10, 11, 12],
    showCountLabel: true,
    logEventTitle: attrProperty.title.quick,
    ...colorData['1']
  },
  8: {
    contentsId: 8,
    listType: 'b',
    brandData: [],

    showDescription: true,
    weekData: [10, 11, 12],
    logEventTitle: attrProperty.title.rare,
    ...colorData['2']
  },
  9: {
    contentsId: 9,
    listType: 'b',
    brandData: [],
    showDescription: true,
    weekData: [10, 11, 12],
    logEventTitle: attrProperty.title.rare,
    ...colorData['2']
  },
  10: {
    contentsId: 10,
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
    weekData: [11, 12],
    logEventTitle: attrProperty.title.lowPrice,
    ...colorData['3']
  },
  11: {
    contentsId: 11,
    listType: 'c',
    brandData: [],
    weekData: [12],
    logEventTitle: attrProperty.title.priceDefense,
    ...colorData['4']
  },
  12: {
    contentsId: 12,
    listType: 'c',
    brandData: [],
    weekData: [],
    logEventTitle: attrProperty.title.padding,
    ...colorData['6']
  }
};

function Crazycuration({
  curationTitle,
  currentCuration,
  isClosedEvent,
  hasNextEvent,
  nextEventUrl,
  nextEventTitle,
  isMobile
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isMobileWeb = isMobile && !checkAgent.isMobileApp();
  const router = useRouter();

  const setDialogState = useSetRecoilState(dialogState);

  const {
    data: {
      contents: {
        title: ogTitle,
        description: ogDescription,
        imageThumbnail: ogImage,
        url: ogUrl
      } = {}
    }
  } = useContentsProducts(currentCuration?.contentsId || 0);

  const handleClickShare = useCallback(() => {
    const shareData = {
      title: ogTitle ? `${ogTitle} | 카멜 최저가 가격비교` : '카멜 최저가 가격비교',
      description: ogDescription || '',
      image: (ogImage || '').replace('thumbnail', 'weekOn'),
      url: `${
        typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'
      }${ogUrl}`
    };

    if (
      !executedShareURl({
        url: shareData.url,
        title: shareData.title,
        text: shareData.description
      })
    ) {
      setDialogState({ type: 'SNSShare', shareData });
    }
  }, [ogDescription, ogImage, ogTitle, ogUrl, setDialogState]);

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

    // // 진입한 이벤트 마감, 진행중 이벤트 있음
    if (hasNextEvent && nextEventUrl.length > 0 && nextEventTitle.length > 0) {
      logEvent(attrKeys.crazycuration.viewCrazyWeekPopup, {
        title: currentCuration?.logEventTitle
      });
      setDialogState({
        type: 'closedCrazyCuration',
        customStyleTitle: { marginTop: 12 },
        content: (
          <Typography variant="h4" customStyle={{ marginBottom: 12, textAlign: 'center' }}>
            오늘은 &lsquo;{nextEventTitle}&rsquo;이
            <br />
            준비되어 있는데 구경해보실래요?
          </Typography>
        ),
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
            name: attrProperty.name.crazyWeekPopup,
            title: currentCuration?.logEventTitle
          });
          router.push(nextEventUrl);
        },
        disabledOnClose: true
      });
      // 진입한 이벤트 마감, 진행중 이벤트 없음, 다음 이벤트 대기중
    } else if (hasNextEvent) {
      logEvent(attrKeys.crazycuration.viewCrazyWeekPopup, { title: attrProperty.title.none });
      setDialogState({
        type: 'readyNextCrazyCuration',
        customStyleTitle: { marginTop: 12 },
        firstButtonAction() {
          logEvent(attrKeys.crazycuration.clickMain, {
            name: attrProperty.name.crazyWeekPopup,
            title: attrProperty.title.none
          });
          router.push('/');
        },
        secondButtonAction() {
          logEvent(attrKeys.crazycuration.clickSearchModal, {
            name: attrProperty.name.crazyWeekPopup,
            title: attrProperty.title.none
          });
          router.push('/search');
        },
        disabledOnClose: true
      });
      // 모든 이벤트 종료
    } else {
      logEvent(attrKeys.crazycuration.viewCrazyWeekPopup, { title: attrProperty.title.end });
      setDialogState({
        type: 'endCrazyCuration',
        customStyleTitle: { marginTop: 12 },
        firstButtonAction() {
          logEvent(attrKeys.crazycuration.clickMain, {
            name: attrProperty.name.crazyWeekPopup,
            title: attrProperty.title.end
          });

          if (window.history.length > 2) {
            router.back();
          } else {
            router.push('/');
          }
        },
        secondButtonAction() {
          logEvent(attrKeys.crazycuration.clickSearchModal, {
            name: attrProperty.name.crazyWeekPopup,
            title: attrProperty.title.end
          });
          router.push('/search');
        },
        disabledOnClose: true
      });
    }
  }, [
    currentCuration?.logEventTitle,
    hasNextEvent,
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
        ogUrl={`${
          typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'
        }${ogUrl}`}
      />
      <GeneralTemplate
        header={<CrazycurationHeader onClickShare={handleClickShare} />}
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
          {!!currentCuration.showDescription && (
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
              showMainImage={currentCuration.listType === 'c-1'}
              logEventTitle={currentCuration.logEventTitle}
              buttonColor={currentCuration.buttonColor}
              infoStyle={currentCuration.infoStyle}
              imageCardStyle={currentCuration.imageCardStyle}
              productCardStyle={currentCuration.productCardStyle}
              wishButtonStyle={currentCuration.wishButtonStyle}
              onProductAtt={handleProductAtt}
              onClickProduct={handleClickProduct}
              handleClickWishButtonEvent={handleClickWishButtonEvent}
            />
          )}
        </Flexbox>
        <CrazycurationWeek
          weekData={currentCuration.weekData}
          nextEventDateLabel={currentCuration.nextEventDateLabel}
          isMobileWeb={isMobileWeb}
          logEventTitle={currentCuration.logEventTitle}
          onClickShare={handleClickShare}
        />
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
  const curationTitle =
    title.slice(title.lastIndexOf('-') + 1).length === 6
      ? String(Number(title.slice(title.lastIndexOf('-') + 1).slice(-2)))
      : String(title)
          .replace(/[0-9-]/gim, '')
          .trim();
  const currentCuration =
    curationTitle.length > 0 && Object.keys(curationData).includes(curationTitle)
      ? curationData[curationTitle as keyof typeof curationData]
      : null;
  let isClosedEvent = false;
  let hasNextEvent = false;
  let nextEventUrl = '';
  let nextEventTitle = '';
  let gender = 'M';

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    const { info: { value: { gender: userGender = '' } = {} } = {} } = await queryClient.fetchQuery(
      queryKeys.users.userInfo(),
      fetchUserInfo
    );

    if (userGender.length > 0) gender = userGender;
  }

  if (currentCuration) {
    try {
      const { contents: { status: currentEventStatus, targetContents } = {} } =
        await queryClient.fetchQuery(
          queryKeys.common.contentsProducts(currentCuration.contentsId),
          () => fetchContentsProducts(currentCuration.contentsId)
        );
      const { status = 0, url: eventUrl = '', title: eventTitle = '' } = targetContents || {};

      if (currentEventStatus === eventStatus.closed) {
        isClosedEvent = true;

        switch (status) {
          // 진입한 이벤트 마감, 진행중 이벤트 없음, 다음 이벤트 대기중
          case eventStatus.ready: {
            hasNextEvent = true;
            break;
          }
          // 진입한 이벤트 마감, 진행중 이벤트가 있음
          case eventStatus.progress: {
            hasNextEvent = true;
            nextEventUrl = encodeURI(eventUrl);
            nextEventTitle = eventTitle;
            break;
          }
          // 모든 이벤트 종료
          default:
            break;
        }
      }

      return {
        props: {
          curationTitle,
          currentCuration: {
            ...currentCuration,
            weekData: currentCuration.weekData.filter((id) =>
              gender === 'F' ? ![2, 8].includes(id) : ![3, 9].includes(id)
            )
          },
          isClosedEvent,
          hasNextEvent,
          nextEventUrl,
          nextEventTitle,
          isMobile: checkAgent.isAllMobileWeb(userAgent),
          dehydratedState: dehydrate(queryClient)
        }
      };
    } catch {
      return {
        redirect: {
          permanent: false,
          destination: encodeURI('/')
        }
      };
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: '/crazycuration'
    }
  };
}

const CurationImg = styled.img`
  min-width: 100%;
  image-orientation: from-image;
`;

export default Crazycuration;
