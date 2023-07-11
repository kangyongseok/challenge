import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState } from 'recoil';
import LinesEllipsis from 'react-lines-ellipsis';
import { useRouter } from 'next/router';
import { debounce } from 'lodash-es';
import amplitude from 'amplitude-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import {
  Avatar,
  BottomSheet,
  Box,
  Button,
  Chip,
  Flexbox,
  Icon,
  Image,
  Label,
  Tooltip,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { OnBoardingSpotlight } from '@components/UI/organisms';
import { NewProductGridCard } from '@components/UI/molecules';
import { ProductInfoSkeleton } from '@components/pages/product';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedKeywords, fetchRelatedProducts, postSellerReport } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import {
  INITIAL_REPORT_OPTIONS,
  ORDER_FEE_TOOLTIP_MESSAGE,
  PRODUCT_SITE,
  REPORT_TYPE_COUNTERFEITER,
  REPORT_TYPE_FAKE_PRODUCT,
  REPORT_TYPE_PRICE,
  REPORT_TYPE_SWINDLER
} from '@constants/product';
import { APP_BANNER, IS_DONE_WISH_ON_BOARDING } from '@constants/localStorage';
import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { getProductType, productDetailAtt } from '@utils/products';
import { getFormattedDistanceTime, getTenThousandUnitPrice } from '@utils/formats';
import {
  checkAgent,
  commaNumber,
  getImageResizePath,
  getProductDetailUrl,
  removeTagAndAddNewLine
} from '@utils/common';

import type { AppBanner } from '@typings/common';
import { userOnBoardingTriggerState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryProduct from '@hooks/useQueryProduct';
import useProductType from '@hooks/useProductType';
import useProductSellerType from '@hooks/useProductSellerType';

type ReportType =
  | typeof REPORT_TYPE_FAKE_PRODUCT
  | typeof REPORT_TYPE_COUNTERFEITER
  | typeof REPORT_TYPE_SWINDLER
  | typeof REPORT_TYPE_PRICE;

interface ProductInfoProps {
  isMySelfProduct?: boolean;
  isWish?: boolean;
  onClickWish: (isWish: boolean) => boolean;
}

interface KeywordList {
  keyword: string;
  symbol?: string;
  icon?: string;
  name?: string;
}

function ProductInfoOperator({
  isMySelfProduct = false,
  isWish = false,
  onClickWish
}: ProductInfoProps) {
  const router = useRouter();
  const { source } = router.query;

  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const { data: { info: { value: { gender: userGender = '' } = {} } = {} } = {} } =
    useQueryUserInfo();
  const { data: productDetail } = useQueryProduct();
  const relatedKeywordParams = {
    quoteTitle: productDetail?.product.quoteTitle || '',
    brandIds: productDetail?.product.brand.id ? [productDetail.product.brand.id] : [],
    categoryIds: productDetail?.product.category.id ? [productDetail.product.category.id] : []
  };
  const { data: fetchKeywordsData } = useQuery(
    queryKeys.products.searchRelatedKeyword(relatedKeywordParams),
    () => fetchRelatedKeywords(relatedKeywordParams),
    {
      enabled: !!relatedKeywordParams.quoteTitle
    }
  );
  const { isCertificationSeller, isViewProductModifySellerType } = useProductSellerType({
    productSellerType: productDetail?.product.productSeller.type,
    site: productDetail?.product.site
  });
  const { isAllCrawlingProduct } = useProductType(productDetail?.product.sellerType);

  const [
    {
      productWish: { complete }
    },
    setUserOnBoardingTriggerState
  ] = useRecoilState(userOnBoardingTriggerState);

  const [isClamped, setIsClamped] = useState(false);
  const [isExpended, setIsExpended] = useState(false);
  const [isOpenReportTooltip, setIsOpenReportTooltip] = useState(false);
  const [keywordList, setKeywordList] = useState<KeywordList[]>([]);
  const [reportOptions, setReportOptions] = useState(INITIAL_REPORT_OPTIONS);
  const [isOpenRelatedProductListBottomSheet, setIsOpenRelatedProductListBottomSheet] =
    useState(false);
  const [isIntersecting, setIntersecting] = useState(false);
  const [isDoneWishOnBoarding, setIsDoneWishOnBoarding] = useState(true);
  const [isToggleDropDown, setIsToggleDropDown] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<0 | 1 | 2 | null>(null);

  const wishButtonRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const hasCheckedReportOption = Object.values(reportOptions).some(({ checked }) => checked);
  const platformId =
    (productDetail?.product?.siteUrl?.hasImage && productDetail?.product?.siteUrl.id) ||
    (productDetail?.product?.site.hasImage && productDetail?.product?.site?.id);
  const brandLogo = `https://${
    process.env.IMAGE_DOMAIN
  }/assets/images/brands/fit/${productDetail?.product?.brand?.nameEng
    .toLowerCase()
    .replace(/\s/g, '')}.jpg`;

  const convertedDescription = useMemo(() => {
    const newDescription = removeTagAndAddNewLine(
      productDetail?.product?.viewDescription || productDetail?.product?.description || ''
    );

    // TODO 트렌비 매물 설명이 css코드로 시작되는 경우 공백 표시하도록 임시처리
    return productDetail?.product?.site.id === PRODUCT_SITE.TRENBE.id &&
      newDescription.startsWith('.box')
      ? ''
      : newDescription;
  }, [
    productDetail?.product?.description,
    productDetail?.product?.site.id,
    productDetail?.product?.viewDescription
  ]);

  const { data: relatedProducts, isLoading: relatedLoading } = useQuery(
    queryKeys.products.relatedProducts(Number(productDetail?.product?.id || 0)),
    () => fetchRelatedProducts(Number(productDetail?.product?.id || 0)),
    { keepPreviousData: true, staleTime: 5 * 60 * 1000, enabled: !!productDetail?.product }
  );

  const { mutate: postSellerReportMutate } = useMutation(postSellerReport);

  const handleClickMoreInfo = () => {
    if (productDetail?.product) {
      logEvent(attrKeys.products.CLICK_EXPAND, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: productDetail?.product.id,
        site: productDetail?.product.site.name,
        brand: productDetail?.product.brand.name,
        category: productDetail?.product.category.name,
        parentId: productDetail?.product.category.parentId,
        parentCategory: FIRST_CATEGORIES[productDetail?.product.category.parentId as number],
        line: productDetail?.product.line,
        price: productDetail?.product.price,
        scoreTotal: productDetail?.product.scoreTotal,
        scoreStatus: productDetail?.product.scoreStatus,
        scoreSeller: productDetail?.product.scoreSeller,
        scorePrice: productDetail?.product.scorePrice,
        scorePriceAvg: productDetail?.product.scorePriceAvg,
        scorePriceCount: productDetail?.product.scorePriceCount,
        scorePriceRate: productDetail?.product.scorePriceRate
      });
    }
    setIsExpended(!isExpended);
  };

  const handleClickReport = () => {
    setIsOpenReportTooltip(!isOpenReportTooltip);
    if (!isOpenReportTooltip && productDetail?.product) {
      logEvent(attrKeys.products.CLICK_REPORT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: productDetail?.product.id,
        brand: productDetail?.product.brand.name,
        category: productDetail?.product.category.name,
        line: productDetail?.product.line
      });
    }
    if (isOpenReportTooltip) {
      setReportOptions((prevState) => {
        const newReportOptions = { ...prevState };
        Object.keys(prevState).forEach((reportType) => {
          newReportOptions[Number(reportType) as ReportType].checked = false;
        });

        return newReportOptions;
      });
    }
  };

  const handleClickReportOption =
    ({ reported, checked, type }: { reported: boolean; checked: boolean; type: number }) =>
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (reported || checked) return;
      logEvent(attrKeys.products.SELECT_REPORT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        value: type
      });
      setReportOptions((prevState) => {
        const newReportOptions = { ...prevState };
        Object.keys(prevState).forEach((reportType) => {
          const convertedReportType = Number(reportType) as ReportType;
          newReportOptions[convertedReportType].checked = convertedReportType === type;
        });

        return newReportOptions;
      });
    };

  const handleSubmitReport = async () => {
    if (!hasCheckedReportOption || !productDetail?.product) return;

    const checkedReportOption = Object.entries(reportOptions).find(([_, { checked }]) => checked);

    if (checkedReportOption) {
      const reportType = Number(checkedReportOption[0]);

      logEvent(attrKeys.products.CLICK_REPORTSUBMIT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: productDetail?.product.id,
        brand: productDetail?.product.brand.name,
        category: productDetail?.product.category.name,
        line: productDetail?.product.line,
        value: reportType
      });
      postSellerReportMutate(
        {
          reportType,
          productId: productDetail?.product.id,
          deviceId: amplitude.getInstance().getDeviceId()
        },
        {
          onSuccess: () => {
            setReportOptions((prevState) => {
              const newState = { ...prevState };
              newState[reportType as ReportType].reported = true;
              newState[reportType as ReportType].count += 1;

              return newState;
            });
            toastStack({
              children: '감사합니다! 신고 접수 완료되었습니다 😇',
              autoHideDuration: 1500
            });
          }
        }
      );
    }
  };

  const handleClickWish = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    logEvent(isWish ? attrKeys.products.clickWishCancel : attrKeys.products.clickWish, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.PRODUCT_DETAIL,
      id: productDetail?.product?.id,
      brand: productDetail?.product?.brand.name,
      category: productDetail?.product?.category.name,
      parentId: productDetail?.product?.category.parentId,
      line: productDetail?.product?.line,
      site: productDetail?.product?.site.name,
      price: productDetail?.product?.price,
      scoreTotal: productDetail?.product?.scoreTotal,
      cluster: productDetail?.product?.cluster,
      productType: getProductType(
        productDetail?.product?.productSeller.site.id || 0,
        productDetail?.product?.productSeller.type || 0
      )
    });

    if (onClickWish(isWish)) {
      if (isWish) {
        toastStack({
          children: '찜목록에서 삭제했어요.'
        });
      } else {
        const sessionId = amplitude.getInstance().getSessionId();
        const appBanner: AppBanner = LocalStorage.get<AppBanner>(APP_BANNER) || {
          sessionId,
          counts: {},
          isInit: !!sessionId,
          lastAction: '',
          isClosed: false,
          mainCloseTime: '',
          mainType: 0,
          isTooltipView: false,
          viewProductList: []
        };

        appBanner.counts.WISH = (appBanner.counts.WISH || 0) + 1;
        LocalStorage.set(APP_BANNER, appBanner);

        toastStack({
          children: '찜목록에 추가했어요!',
          action: {
            text: '찜목록 보기',
            onClick: () => router.push('/wishes')
          }
        });

        if ((relatedProducts?.content || []).length >= 6) {
          logEvent(attrKeys.products.VIEW_WISH_MODAL, {
            name: attrProperty.productName.PRODUCT_DETAIL
          });
          setIsOpenRelatedProductListBottomSheet(true);
          scrollDisable();
        }
      }
    }
  };

  const handleCloseRelatedProductListBottomSheet = () => {
    logEvent(attrKeys.products.CLICK_WISHMOAL_CLOSE, {
      name: attrProperty.productName.PRODUCT_DETAIL
    });

    setIsOpenRelatedProductListBottomSheet(false);
    scrollEnable();
  };

  const handleScroll = debounce(() => {
    logEvent(attrKeys.products.SWIP_X_CARD, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.WISH_MODAL
    });
  }, 300);

  const handleClickWishOnBoarding = () => {
    setIsDoneWishOnBoarding(true);
    setUserOnBoardingTriggerState((prevState) => ({
      ...prevState,
      productWish: {
        complete: true,
        step: 1
      }
    }));
    scrollEnable();
  };

  const handleClickChip = (item: KeywordList) => {
    let viewType = 'search';
    const productKeyword = item.name?.replace('(P)', '') || item.keyword;

    if (item.symbol) {
      viewType = 'brands';
    }
    if (item.icon) {
      viewType = 'categories';
    }

    if (viewType === 'brands') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: attrProperty.title.BRAND
      });
    } else if (viewType === 'categories') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: attrProperty.title.CATEGORY
      });
    } else {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: attrProperty.title.RECOMMKEYWORD
      });
    }

    router.push({
      pathname: `/products/${viewType}/${encodeURIComponent(String(productKeyword))}`
    });
  };

  const handleClickDropDownFeeOption = () => {
    setIsToggleDropDown((prev) => !prev);
  };

  const handleClickOutLink = () => {
    if (!productDetail?.product) return;
    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};
    productDetailAtt({
      key: attrKeys.products.CLICK_PURCHASE,
      product: productDetail?.product,
      source: productDetailSource || undefined,
      rest: { att: 'REDIRECT' }
    });

    let userAgent = 0;

    if (checkAgent.isIOSApp()) userAgent = 1;
    if (checkAgent.isAndroidApp()) userAgent = 2;

    if (productDetail.product)
      window.open(
        `${getProductDetailUrl({
          product: productDetail.product
        })}?redirect=1&userAgent=${userAgent}`,
        '_blank'
      );
  };

  // 기존 온보딩 완료 유저 대응
  useEffect(() => {
    if (LocalStorage.get(IS_DONE_WISH_ON_BOARDING)) {
      setUserOnBoardingTriggerState((prevState) => ({
        ...prevState,
        productWish: {
          complete: true,
          step: 1
        }
      }));
    }
  }, [setUserOnBoardingTriggerState]);

  useEffect(() => {
    if (
      !LocalStorage.get(IS_DONE_WISH_ON_BOARDING) &&
      checkAgent.isMobileApp() &&
      !complete &&
      !isMySelfProduct &&
      wishButtonRef.current &&
      isIntersecting &&
      source !== 'WISH_LIST'
    ) {
      LocalStorage.set(IS_DONE_WISH_ON_BOARDING, true);
      setIsDoneWishOnBoarding(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserOnBoardingTriggerState, isIntersecting, complete]);

  useEffect(() => {
    let observer: IntersectionObserver;

    try {
      observer = new IntersectionObserver(([e]) => setIntersecting(e.isIntersecting));

      if (descriptionRef.current) {
        observer.observe(descriptionRef.current);
      }
    } catch {
      if (wishButtonRef.current) {
        const { clientHeight } = wishButtonRef.current;
        window.scrollTo({
          top:
            wishButtonRef.current.getBoundingClientRect().top -
            (clientHeight + HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT),
          behavior: 'smooth'
        });

        scrollTimerRef.current = setTimeout(() => {
          setIntersecting(true);
        }, 1500);
      }
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [productDetail?.product]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const result = [
      {
        ...fetchKeywordsData?.brand,
        keyword: fetchKeywordsData?.brand?.nameEng.toUpperCase() || '',
        symbol: fetchKeywordsData?.brand?.nameEng[0].toUpperCase() || ''
      },
      {
        ...fetchKeywordsData?.category,
        keyword: fetchKeywordsData?.category?.name.replace('(P)', '') || '',
        icon: fetchKeywordsData?.categoryThumbnail || ''
      },
      ...(fetchKeywordsData?.relatedKeywords?.map((keyword) => ({ keyword })) || [])
    ];
    if (!relatedLoading && fetchKeywordsData) {
      setKeywordList(result);
    }
  }, [fetchKeywordsData, relatedLoading]);

  return !productDetail?.product ? (
    <ProductInfoSkeleton />
  ) : (
    <>
      <OnBoardingSpotlight
        open={!isDoneWishOnBoarding}
        onClose={handleClickWishOnBoarding}
        targetRef={wishButtonRef}
        customSpotlightPosition={{
          width: 6,
          height: 26,
          left: 10
        }}
        customStyle={{
          borderRadius: 8
        }}
      />
      <Box customStyle={{ marginTop: 20 }}>
        {brandLogo && (
          <Flexbox
            onClick={() => {
              const brandName = productDetail?.product?.brand?.name.replace(/\s/g, '');
              router.push({
                pathname: `/products/brands/${brandName}`,
                query:
                  !userGender || userGender === 'N'
                    ? {}
                    : { genders: userGender === 'M' ? 'male' : 'female' }
              });
            }}
            customStyle={{
              justifyContent: 'flex-start'
            }}
          >
            <Image
              height={32}
              src={getImageResizePath({
                imagePath: brandLogo,
                h: 32
              })}
              alt="Brand Logo Img"
              round={8}
              disableAspectRatio
              customStyle={{
                marginBottom: 8,
                '&:has(.fallback)': {
                  margin: '-16px 0'
                }
              }}
              fallbackElement={<Box className="fallback" />}
            />
          </Flexbox>
        )}
        <TitleWish alignment="flex-start" justifyContent="space-between" gap={20}>
          <Box>
            <Typography
              variant="h3"
              weight="medium"
              customStyle={{
                lineHeight: '24px',
                wordBreak: 'keep-all'
              }}
            >
              {productDetail?.product?.title}
            </Typography>
            <Flexbox alignment="flex-end" gap={4}>
              <Typography variant="h2" weight="bold" customStyle={{ marginTop: 4 }}>
                {commaNumber(getTenThousandUnitPrice(productDetail?.orderInfo?.totalPrice))}만원
              </Typography>
              <Flexbox alignment="center" onClick={handleClickDropDownFeeOption}>
                <Typography weight="medium" color="ui60">
                  카멜 구매대행가
                </Typography>
                <Icon name="QuestionCircleOutlined" width={20} height={20} color="ui80" />
              </Flexbox>
            </Flexbox>
          </Box>
          {!isMySelfProduct && (
            <Tooltip
              open={!isDoneWishOnBoarding}
              message="찜하면 가격이 내려갔을 때 알려드려요!"
              triangleLeft={179}
              customStyle={{
                top: 10,
                left: -55
              }}
            >
              <Wish onClick={handleClickWish}>
                <Icon
                  name={isWish ? 'HeartFilled' : 'HeartOutlined'}
                  width={28}
                  height={28}
                  color={isWish ? 'red-light' : undefined}
                />
                <Typography
                  variant="body2"
                  color={isWish ? 'red-light' : undefined}
                  textAlign="center"
                >
                  {productDetail?.product?.wishCount || 0}
                </Typography>
              </Wish>
            </Tooltip>
          )}
        </TitleWish>
        {isToggleDropDown && (
          <FeeOptionBox direction="vertical" gap={6}>
            <Flexbox alignment="center" justifyContent="space-between">
              <Typography variant="body2" color="ui60">
                매물가격
              </Typography>
              <Typography weight="medium" color="primary-light">
                {commaNumber(productDetail?.orderInfo?.price)}원
              </Typography>
            </Flexbox>
            {productDetail?.orderInfo?.orderFees
              ?.filter((orderInfo) => orderInfo.type !== 0)
              ?.map((orderInfo) => (
                <Flexbox
                  alignment="center"
                  justifyContent="space-between"
                  key={`product-operator-${orderInfo.name}`}
                >
                  <Typography
                    variant="body2"
                    color="ui60"
                    customStyle={{ display: 'flex', alignItems: 'center' }}
                  >
                    {orderInfo.name}
                    <Tooltip
                      open={openTooltip === orderInfo.type}
                      message={
                        <>
                          {ORDER_FEE_TOOLTIP_MESSAGE[orderInfo.type].map((message: string) => (
                            <TooltipText
                              key={message}
                              color="uiWhite"
                              variant="body2"
                              weight="medium"
                            >
                              {message}
                            </TooltipText>
                          ))}
                        </>
                      }
                      placement="bottom"
                      triangleLeft={18}
                      customStyle={{
                        top: 'auto',
                        bottom: 15,
                        left: 115,
                        zIndex: 5
                      }}
                    >
                      <Icon
                        name="QuestionCircleOutlined"
                        width={16}
                        height={16}
                        color="ui80"
                        onClick={() => {
                          if (orderInfo.type === openTooltip) {
                            setOpenTooltip(null);
                            return;
                          }
                          setOpenTooltip(orderInfo.type);
                        }}
                      />
                    </Tooltip>
                  </Typography>
                  <Flexbox alignment="center" gap={8}>
                    {orderInfo.fee - orderInfo.discountFee === 0 && (
                      <Label
                        text="무료"
                        variant="solid"
                        brandColor="primary"
                        round={10}
                        size="xsmall"
                      />
                    )}
                    {!!orderInfo.discountFee && (
                      <Typography color="ui80" customStyle={{ textDecoration: 'line-through' }}>
                        {commaNumber(orderInfo.discountFee)}원
                      </Typography>
                    )}
                    <Typography weight="medium" color="ui60">
                      + {commaNumber(orderInfo?.totalFee)}원
                    </Typography>
                  </Flexbox>
                </Flexbox>
              ))}
          </FeeOptionBox>
        )}
        <PlatformUpdateTime alignment="center" gap={4}>
          {!isMySelfProduct && !isCertificationSeller && !isViewProductModifySellerType && (
            <>
              <Flexbox alignment="center" onClick={handleClickOutLink} gap={2}>
                <Avatar
                  width={16}
                  height={16}
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platformId}.png`}
                  alt="Platform Logo Img"
                />
                <Typography
                  variant="body2"
                  color="ui60"
                  customStyle={{ textDecoration: 'underline' }}
                >
                  {productDetail?.product?.siteUrl?.name}
                </Typography>
                <OutLink />
              </Flexbox>
              <Typography variant="body2" color="ui60">
                •
              </Typography>
            </>
          )}
          <Typography variant="body2" color="ui60">
            {productDetail?.product.datePosted > productDetail?.product.dateFirstPosted
              ? '끌올 '
              : ''}
            {getFormattedDistanceTime(new Date(productDetail?.product.datePosted))}
          </Typography>
        </PlatformUpdateTime>
        <PurchasingAgentInfo>
          <Flexbox alignment="center" gap={4} customStyle={{ marginBottom: 12 }}>
            <Icon name="BoxFilled" color="primary-light" size="small" />
            <Typography weight="medium" variant="body2" color="primary-light">
              [카멜 구매대행] 하세요!
            </Typography>
            <Typography
              customStyle={{ marginLeft: 'auto', textDecoration: 'underline' }}
              color="ui60"
              variant="body2"
              onClick={() => {
                logEvent(attrKeys.productOrder.CLICK_CAMEL_GUIDE);
                router.push('/products/purchasingInfo');
              }}
            >
              구매대행이란?
            </Typography>
          </Flexbox>
          {productDetail?.product?.siteUrl.id === 103 && (
            <Flexbox alignment="flex-start" gap={4}>
              <Flexbox customStyle={{ minWidth: 16, height: 16 }}>
                <CheckBoxOutline />
              </Flexbox>
              <Typography variant="body2" color="ui20">
                카멜 네트워크를 통해 타지역 당근마켓 문의가 가능해요!
              </Typography>
            </Flexbox>
          )}
          <Flexbox alignment="flex-start" gap={4} customStyle={{ marginTop: 4 }}>
            <Flexbox customStyle={{ minWidth: 16, height: 16 }}>
              <CheckBoxOutline />
            </Flexbox>
            <Typography variant="body2" color="ui20">
              판매자의 막말, 안전결제 거부, 미발송이 걱정된다면? 모두 카멜이 대신 해드릴게요!
            </Typography>
          </Flexbox>
          <Flexbox alignment="flex-start" gap={4} customStyle={{ marginTop: 4 }}>
            <Flexbox customStyle={{ minWidth: 16, height: 16 }}>
              <CheckBoxOutline />
            </Flexbox>
            <Typography variant="body2" color="ui20">
              상태와 가격이 괜찮다면 주저말고 채팅해보세요 :)
            </Typography>
          </Flexbox>
        </PurchasingAgentInfo>
        {isExpended ? (
          <Typography
            variant="h4"
            dangerouslySetInnerHTML={{
              __html: convertedDescription !== 'null' ? convertedDescription : ''
            }}
            customStyle={{ marginTop: 24, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
          />
        ) : (
          <Content ref={descriptionRef} component="article" variant="h4" isClamped={isClamped}>
            <LinesEllipsis
              text={convertedDescription !== 'null' ? convertedDescription : ''}
              maxLine="10"
              ellipsis="..."
              basedOn="letters"
              component="p"
              onReflow={({ clamped }) => isClamped !== clamped && setIsClamped(clamped)}
            />
          </Content>
        )}
        {isClamped && (
          <MoreInfoButton
            isExpended={isExpended}
            fullWidth
            variant="solid"
            size="large"
            onClick={handleClickMoreInfo}
          >
            <Flexbox
              alignment="center"
              justifyContent="center"
              customStyle={{ padding: '8px 0' }}
              gap={8}
            >
              <Typography variant="h4">{isExpended ? '접어보기' : '펼쳐보기'}</Typography>
              <Icon name={isExpended ? 'CaretUpOutlined' : 'CaretDownOutlined'} color="uiBlack" />
            </Flexbox>
          </MoreInfoButton>
        )}
        {isAllCrawlingProduct && (
          <Typography variant="body2" color="ui60" customStyle={{ marginTop: 20 }}>
            * 카멜Ai검색엔진이 수집·분석한 매물정보입니다.
          </Typography>
        )}
        <Flexbox
          alignment="center"
          customStyle={{ flexWrap: 'wrap', marginTop: 32, gap: '8px 6px' }}
        >
          {keywordList
            .filter((list) => !!list.keyword)
            .map((item) => (
              <Chip
                key={`keyword-list-${item.keyword}`}
                size="medium"
                onClick={() => handleClickChip(item)}
                customStyle={{
                  padding: item.icon || item.symbol ? '4px 12px 4px 4px' : '6px 12px',
                  textAlign: 'left',
                  height: 'fit-content'
                }}
              >
                {item.icon && (
                  <CircleBg>
                    <Image
                      width={18}
                      height={18}
                      src={item.icon}
                      alt={item.keyword}
                      disableAspectRatio
                    />
                  </CircleBg>
                )}
                {item.symbol && (
                  <CircleBg>
                    <Typography weight="bold" variant="h4">
                      {item.symbol}
                    </Typography>
                  </CircleBg>
                )}
                {item && !item.icon && !item.symbol && '#'}
                {item.keyword}
              </Chip>
            ))}
        </Flexbox>
        <Flexbox
          justifyContent="space-between"
          gap={8}
          customStyle={{
            position: 'relative',
            marginTop: 32,
            padding: '12px 0'
          }}
        >
          <Flexbox alignment="center" gap={12}>
            {productDetail?.product?.viewCount > 0 && (
              <Typography color="ui60">
                조회&nbsp;
                {productDetail?.product.viewCount}
              </Typography>
            )}
            {productDetail?.product?.wishCount > 0 && (
              <Flexbox gap={4} alignment="center">
                <Icon
                  name="HeartFilled"
                  width={16}
                  height={16}
                  color="ui80"
                  customStyle={{ marginRight: 2 }}
                />
                <Typography color="ui60">{productDetail?.product.wishCount}</Typography>
              </Flexbox>
            )}
            {productDetail?.product?.purchaseCount > 0 && (
              <Flexbox gap={4} alignment="center">
                <Icon name="MessageFilled" width={16} height={16} color="ui80" />
                <Typography color="ui60">{productDetail?.product.purchaseCount}</Typography>
              </Flexbox>
            )}
          </Flexbox>
          {!isMySelfProduct && (
            <Flexbox gap={2} alignment="center" onClick={handleClickReport}>
              <Icon name="ReportFilled" width={20} height={20} color="ui80" />
              <Typography weight="medium" color="ui60">
                신고하기
              </Typography>
              <ReportTooltip open={isOpenReportTooltip}>
                {Object.values(reportOptions).map(({ type, label, count, checked, reported }) => (
                  <ReportOption
                    key={`report-option-${type}`}
                    variant="body1"
                    weight={reported || checked ? 'bold' : 'medium'}
                    onClick={handleClickReportOption({ reported, checked, type })}
                  >
                    <Flexbox
                      alignment="center"
                      customStyle={{ color: reported || checked ? primary.main : 'inherit' }}
                    >
                      {(reported || checked) && (
                        <Icon
                          name="CheckOutlined"
                          size="small"
                          color="primary"
                          customStyle={{ marginRight: 6 }}
                        />
                      )}
                      <Typography
                        variant="body1"
                        weight={reported || checked ? 'bold' : 'medium'}
                        brandColor={reported || checked ? 'primary' : 'black'}
                      >
                        {label}
                      </Typography>
                    </Flexbox>
                    <Typography variant="body2" weight="medium" color="ui60">
                      {count}
                    </Typography>
                  </ReportOption>
                ))}
                <Button
                  fullWidth
                  brandColor="black"
                  variant="solid"
                  customStyle={{ marginTop: 20 }}
                  disabled={!hasCheckedReportOption}
                  onClick={handleSubmitReport}
                >
                  제출하기
                </Button>
              </ReportTooltip>
            </Flexbox>
          )}
        </Flexbox>
      </Box>
      <BottomSheet
        open={isOpenRelatedProductListBottomSheet}
        disableSwipeable
        onClose={handleCloseRelatedProductListBottomSheet}
      >
        <Box customStyle={{ padding: '16px 20px 32px' }}>
          <Box customStyle={{ float: 'right' }}>
            <Icon name="CloseOutlined" onClick={handleCloseRelatedProductListBottomSheet} />
          </Box>
          <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 24 }}>
            같이 찜해두면 좋은 매물
          </Typography>
          <ProductCardList onScroll={handleScroll}>
            {relatedProducts?.content.map((relatedProduct, index) => (
              <NewProductGridCard
                key={`related-product-card-${relatedProduct.id}`}
                variant="swipeX"
                product={relatedProduct}
                hideAreaInfo
                attributes={{
                  name: attrProperty.name.PRODUCT_DETAIL,
                  title: attrProperty.title.RELATED_LIST,
                  index: index + 1,
                  source: attrProperty.source.PRODUCT_DETAIL_RELATED_LIST
                }}
              />
            ))}
          </ProductCardList>
        </Box>
      </BottomSheet>
    </>
  );
}

const Content = styled(Typography)<{ isClamped: boolean }>`
  margin-top: 24px;
  margin-bottom: ${({ isClamped }) => isClamped && '24px'};
  white-space: pre-wrap;
  overflow: hidden;
`;

const MoreInfoButton = styled(Button)<{ isExpended: boolean }>`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  ${({ isExpended }) =>
    !isExpended && {
      boxShadow: '1px -40px 28px 13px rgba(255, 255, 255, 0.8)'
    }}
  svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui20};
  }
`;

const ReportTooltip = styled.div<{ open: boolean }>`
  position: absolute;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-radius: 8px;
  padding: 20px 24px;
  top: 57px;
  left: 0;
  width: 100%;
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  opacity: ${({ open }) => Number(open)};
  transition: all 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};

  :before {
    content: '';
    position: absolute;
    top: -19px;
    right: 40px;
    width: 0;
    height: 0;
    z-index: 1;
    border-width: 12px 0 12px 15px;
    border-style: solid;
    border-color: transparent transparent transparent
      ${({
        theme: {
          palette: { common }
        }
      }) => common.uiWhite};
    border-image: initial;
    filter: drop-shadow(
      ${({
          theme: {
            palette: { common }
          }
        }) => common.ui90}
        1px 0px 0px
    );
    transform: rotate(270deg);
  }
`;

const ReportOption = styled(Typography)`
  padding: 8px 0;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  display: flex;
  justify-content: space-between;

  :first-of-type {
    padding: 0 0 8px;
  }
  :last-of-type {
    border-bottom: none;
    padding: 8px 0 0;
  }
`;

const ProductCardList = styled.div`
  margin: 0 -20px;
  padding: 0 20px;
  overflow-x: auto;
  display: grid;
  grid-auto-flow: column;

  grid-auto-columns: 120px;
  column-gap: 8px;
`;

const CircleBg = styled.div`
  width: 24px;
  height: 24px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 50%;
  margin-right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FeeOptionBox = styled(Flexbox)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  width: 100%;
`;

const TitleWish = styled(Flexbox)``;

const Wish = styled.div`
  cursor: pointer;
  padding-left: 10px;
  border-left: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
`;

const PlatformUpdateTime = styled(Flexbox)`
  margin-top: 12px;
`;

const PurchasingAgentInfo = styled.div`
  margin: 32px 0 20px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
`;

const TooltipText = styled(Typography)`
  text-align: left;
  width: 240px;
  white-space: pre-wrap;
`;

function OutLink() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3C2 2.44772 2.44772 2 3 2H4V3H3V9H9V8H10V9C10 9.55229 9.55228 10 9 10H3C2.44772 10 2 9.55228 2 9V3Z"
        fill="#7B7D85"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 2H10V6H9V3.70711L5.5 7.20711L4.79289 6.5L8.29289 3H6V2Z"
        fill="#7B7D85"
      />
    </svg>
  );
}

function CheckBoxOutline() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.19531 7.47145L5.13812 6.52865L7.33338 8.72391L10.862 5.19531L11.8048 6.13812L7.33338 10.6095L4.19531 7.47145Z"
        fill="#425BFF"
      />
    </svg>
  );
}

export default ProductInfoOperator;
