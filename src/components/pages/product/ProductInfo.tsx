import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import LinesEllipsis from 'react-lines-ellipsis';
import { useRouter } from 'next/router';
import {
  Avatar,
  BottomSheet,
  Box,
  Button,
  Flexbox,
  Icon,
  Image,
  Label,
  Tooltip,
  Typography,
  useTheme
} from 'mrcamel-ui';
import { debounce, find } from 'lodash-es';
import amplitude from 'amplitude-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { OnBoardingSpotlight } from '@components/UI/organisms';
import { NewProductGridCard } from '@components/UI/molecules';
import { ProductInfoSkeleton } from '@components/pages/product';

import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedProducts, postSellerReport } from '@api/product';

import { productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import {
  INITIAL_REPORT_OPTIONS,
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
import { getProductType } from '@utils/products';
import { getFormattedDistanceTime, getProductArea } from '@utils/formats';
import { checkAgent, removeTagAndAddNewLine } from '@utils/common';

import type { AppBanner } from '@typings/common';
import { toastState, userOnBoardingTriggerState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

import ProductInfoColorIcon from './ProductInfoColorIcon';

type ReportType =
  | typeof REPORT_TYPE_FAKE_PRODUCT
  | typeof REPORT_TYPE_COUNTERFEITER
  | typeof REPORT_TYPE_SWINDLER
  | typeof REPORT_TYPE_PRICE;

interface ProductInfoProps {
  product?: Product;
  isCamelSellerProduct?: boolean;
  sizeData?: string[];
  unitText?: string;
  storeText?: string;
  distanceText?: string;
  isWish?: boolean;
  onClickWish: (isWish: boolean) => boolean;
}

function ProductInfo({
  product,
  isCamelSellerProduct = false,
  sizeData,
  unitText,
  storeText,
  distanceText,
  isWish = false,
  onClickWish
}: ProductInfoProps) {
  const router = useRouter();
  const { source } = router.query;

  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();
  const { data: { info: { value: { gender: userGender = '' } = {} } = {} } = {} } =
    useQueryUserInfo();

  const [getToastState] = useRecoilState(toastState);
  const setToastState = useSetRecoilState(toastState);
  const [
    {
      productWish: { complete }
    },
    setUserOnBoardingTriggerState
  ] = useRecoilState(userOnBoardingTriggerState);

  const [isClamped, setIsClamped] = useState(false);
  const [isExpended, setIsExpended] = useState(false);
  const [hoistingState, setHoistingState] = useState(false);
  const [isOpenReportTooltip, setIsOpenReportTooltip] = useState(false);
  const [reportOptions, setReportOptions] = useState(INITIAL_REPORT_OPTIONS);
  const [isOpenRelatedProductListBottomSheet, setIsOpenRelatedProductListBottomSheet] =
    useState(false);
  const [isIntersecting, setIntersecting] = useState(false);
  const [isDoneWishOnBoarding, setIsDoneWishOnBoarding] = useState(true);

  const wishButtonRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const isCertificationSeller =
    product?.sellerType === productSellerType.certification ||
    product?.sellerType === productSellerType.legit;
  // 카멜에서 수정/삭제 등이 가능한 매물 (카멜에서 업로드한 매물 포함)
  const isTransferred =
    (product?.productSeller?.type === 0 && product?.site?.id === 34) ||
    product?.productSeller?.type === 4;
  const hasCheckedReportOption = Object.values(reportOptions).some(({ checked }) => checked);
  const platformId =
    (product?.siteUrl?.hasImage && product?.siteUrl.id) ||
    (product?.site.hasImage && product?.site?.id);
  const brandLogo = `https://${
    process.env.IMAGE_DOMAIN
  }/assets/images/brands/fit/${product?.brand?.nameEng.toLowerCase().replace(/\s/g, '')}.jpg`;
  const isCrawlingProduct = ![1, 2, 3].includes(product?.sellerType || NaN);
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

  const convertedDescription = useMemo(() => {
    const newDescription = removeTagAndAddNewLine(
      product?.viewDescription || product?.description || ''
    );

    // TODO 트렌비 매물 설명이 css코드로 시작되는 경우 공백 표시하도록 임시처리
    return product?.site.id === PRODUCT_SITE.TRENBE.id && newDescription.startsWith('.box')
      ? ''
      : newDescription;
  }, [product?.description, product?.site.id, product?.viewDescription]);

  const productStatusData = product?.labels.filter((label) => label.codeId === 14)[0];

  const { data: relatedProducts } = useQuery(
    queryKeys.products.relatedProducts(Number(product?.id || 0)),
    () => fetchRelatedProducts(Number(product?.id || 0)),
    { keepPreviousData: true, staleTime: 5 * 60 * 1000, enabled: !!product }
  );

  const { mutate: postSellerReportMutate } = useMutation(postSellerReport);

  const templateInfoData = [
    {
      label: '상태',
      value: `${productStatusData?.synonyms} ${productStatusData?.name}`,
      isView: !!product?.labels.filter((label) => label.codeId === 14)[0].name
    },
    { label: '사이즈', value: sizeData?.join(' ∙ '), isView: !!sizeData },
    {
      label: '색상',
      value: <ProductInfoColorIcon colorData={product?.colors} />,
      isView: !!product?.color
    },
    { label: '구성품', value: unitText, isView: !!unitText },
    { label: '구입처', value: storeText, isView: !!storeText }
  ];

  const handleClickMoreInfo = () => {
    if (product) {
      logEvent(attrKeys.products.CLICK_EXPAND, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: product.id,
        site: product.site.name,
        brand: product.brand.name,
        category: product.category.name,
        parentId: product.category.parentId,
        parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
        line: product.line,
        price: product.price,
        scoreTotal: product.scoreTotal,
        scoreStatus: product.scoreStatus,
        scoreSeller: product.scoreSeller,
        scorePrice: product.scorePrice,
        scorePriceAvg: product.scorePriceAvg,
        scorePriceCount: product.scorePriceCount,
        scorePriceRate: product.scorePriceRate
      });
    }
    setIsExpended(!isExpended);
  };

  const handleClickReport = () => {
    setIsOpenReportTooltip(!isOpenReportTooltip);
    if (!isOpenReportTooltip && product) {
      logEvent(attrKeys.products.CLICK_REPORT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: product.id,
        brand: product.brand.name,
        category: product.category.name,
        line: product.line
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
    if (!hasCheckedReportOption || !product) return;

    const checkedReportOption = Object.entries(reportOptions).find(([_, { checked }]) => checked);

    if (checkedReportOption) {
      const reportType = Number(checkedReportOption[0]);

      logEvent(attrKeys.products.CLICK_REPORTSUBMIT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: product.id,
        brand: product.brand.name,
        category: product.category.name,
        line: product.line,
        value: reportType
      });
      postSellerReportMutate(
        {
          reportType,
          productId: product.id,
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
            setToastState({
              type: 'product',
              status: 'successReport',
              hideDuration: 1500
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
      id: product?.id,
      brand: product?.brand.name,
      category: product?.category.name,
      parentId: product?.category.parentId,
      line: product?.line,
      site: product?.site.name,
      price: product?.price,
      scoreTotal: product?.scoreTotal,
      cluster: product?.cluster,
      productType: getProductType(
        product?.productSeller.site.id || 0,
        product?.productSeller.type || 0
      )
    });

    if (onClickWish(isWish)) {
      if (isWish) {
        setToastState({ type: 'product', status: 'successRemoveWish' });
      } else {
        appBanner.counts.WISH = (appBanner.counts.WISH || 0) + 1;
        LocalStorage.set(APP_BANNER, appBanner);

        setToastState({
          type: 'product',
          status: 'successAddWish',
          action: () => router.push('/wishes')
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

  useEffect(() => {
    if (getToastState.status === 'hoisting') {
      setHoistingState(true);
    }
  }, [getToastState]);

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
      !isCamelSellerProduct &&
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
  }, [product]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const renderCertificationBanner = () => {
    if (!isTransferred && isCamelSellerProduct) {
      return (
        <Flexbox
          alignment="center"
          gap={4}
          customStyle={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            backgroundColor: common.bg02
          }}
        >
          <Icon name="Rotate2Outlined" width={16} height={16} color={primary.light} />
          <Typography variant="body2" weight="medium">
            {product?.site?.name} 플랫폼과 동기화된 매물이에요.
          </Typography>
        </Flexbox>
      );
    }
    if (isCertificationSeller) {
      return (
        <CertificationCard>
          <Flexbox alignment="center" gap={6} customStyle={{ marginBottom: 4 }}>
            <Icon name="ShieldFilled" width={16} height={16} color={primary.light} />
            <Typography variant="body2" weight="medium">
              카멜이 직접 인증한 판매자의 상품입니다.
            </Typography>
          </Flexbox>
          <Flexbox gap={6} alignment="center">
            <Box customStyle={{ padding: '0 4px' }}>
              <CheckedIcon />
            </Box>
            <Typography variant="body2" weight="medium">
              계좌, 신분증, 전화번호, 더치트 인증
            </Typography>
          </Flexbox>
          <Flexbox gap={6} alignment="center">
            <Box customStyle={{ padding: '0 4px' }}>
              <CheckedIcon />
            </Box>
            <Typography variant="body2" weight="medium">
              상품 미발송 시 <span style={{ color: primary.main }}>카멜이 200% 보상</span>
            </Typography>
          </Flexbox>
          <Flexbox gap={6} alignment="center">
            <Box customStyle={{ padding: '0 4px' }}>
              <CheckedIcon />
            </Box>
            <Typography variant="body2" weight="medium">
              <span style={{ color: primary.main }}>가품시 200% 환불</span> 보장
            </Typography>
          </Flexbox>
        </CertificationCard>
      );
    }
    return null;
  };

  return !product ? (
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
              const brandName = product?.brand?.name.replace(/\s/g, '');
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
              src={brandLogo}
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
        <Flexbox alignment="flex-start" justifyContent="space-between" gap={20}>
          <Flexbox direction="vertical" gap={8}>
            <Typography
              variant="h1"
              weight="bold"
              customStyle={{
                fontSize: 20,
                lineHeight: '26px'
              }}
            >
              {product?.title}
            </Typography>
            <Flexbox
              justifyContent="space-between"
              alignment="center"
              customStyle={{ color: common.ui60 }}
            >
              <Flexbox>
                {!isCamelSellerProduct && !isCertificationSeller && !isTransferred && (
                  <>
                    <Flexbox gap={2} alignment="center">
                      <Avatar
                        width={16}
                        height={16}
                        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platformId}.png`}
                        alt="Platform Logo Img"
                      />
                      <Typography
                        variant="body2"
                        customStyle={{
                          color: common.ui60
                        }}
                      >
                        {product?.siteUrl?.name}
                      </Typography>
                    </Flexbox>
                    <Typography
                      variant="body2"
                      customStyle={{
                        margin: '0 4px',
                        color: common.ui60
                      }}
                    >
                      •
                    </Typography>
                  </>
                )}
                <Typography variant="body2" customStyle={{ color: common.ui60 }}>
                  {isCamelSellerProduct && product.datePosted > product.dateFirstPosted
                    ? '끌올 '
                    : ''}
                  {getFormattedDistanceTime(
                    hoistingState ? new Date() : new Date(product.datePosted)
                  )}
                </Typography>
              </Flexbox>
            </Flexbox>
          </Flexbox>
          {!isCamelSellerProduct && (
            <Tooltip
              open={!isDoneWishOnBoarding}
              message="찜하면 가격이 내려갔을 때 알려드려요!"
              triangleLeft={179}
              customStyle={{
                top: -3,
                left: -48
              }}
            >
              <Flexbox
                ref={wishButtonRef}
                direction="vertical"
                gap={2}
                onClick={handleClickWish}
                customStyle={{
                  position: 'relative',
                  cursor: 'pointer',
                  paddingLeft: 18,
                  borderLeft: `1px solid ${common.line01}`
                }}
              >
                {isWish ? (
                  <>
                    <Icon name="HeartFilled" width={28} height={28} color={secondary.red.light} />
                    <Typography
                      variant="body2"
                      weight="bold"
                      customStyle={{
                        textAlign: 'center',
                        color: secondary.red.light
                      }}
                    >
                      {product?.wishCount || 0}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Icon name="HeartOutlined" width={28} height={28} />
                    <Typography
                      variant="body2"
                      weight="bold"
                      customStyle={{
                        textAlign: 'center'
                      }}
                    >
                      {product?.wishCount || 0}
                    </Typography>
                  </>
                )}
              </Flexbox>
            </Tooltip>
          )}
        </Flexbox>
        {renderCertificationBanner()}
        {(!!product?.area || !!distanceText || find(product.labels, { name: '33' })) && (
          <Flexbox
            alignment="center"
            gap={4}
            customStyle={{
              margin: renderCertificationBanner() ? '20px 0' : '32px 0 20px'
            }}
          >
            {!!product.labels.length && find(product.labels, { name: '33' }) ? (
              <Label variant="ghost" brandColor="gray" text="배송비 포함" />
            ) : (
              <Label variant="ghost" brandColor="gray" text="배송비 별도" />
            )}
            {distanceText === '직거래' && (
              <Label variant="ghost" brandColor="gray" text={distanceText} />
            )}
            {product?.area && (
              <Label
                variant="ghost"
                brandColor="gray"
                startIcon={<Icon name="PinFilled" />}
                text={getProductArea(product.area)}
              />
            )}
          </Flexbox>
        )}
        {product?.site.code === 'CAMELSELLER' && (
          <Flexbox direction="vertical" gap={8}>
            {templateInfoData.map((stateData) => (
              <Flexbox
                gap={8}
                key={`product-status-data-${stateData.label}`}
                customStyle={{ display: stateData.isView ? 'flex' : 'none' }}
              >
                <Typography variant="h4" customStyle={{ minWidth: 60, color: common.ui60 }}>
                  {stateData.label}
                </Typography>
                <Typography variant="h4">{stateData.value}</Typography>
              </Flexbox>
            ))}
          </Flexbox>
        )}
        {isExpended ? (
          <Typography
            variant="h4"
            dangerouslySetInnerHTML={{
              __html: convertedDescription !== 'null' ? convertedDescription : ''
            }}
            customStyle={{ marginTop: 24, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          />
        ) : (
          <Content ref={descriptionRef} component="article" variant="h4" isClamped={isClamped}>
            <LinesEllipsis
              text={convertedDescription !== 'null' ? convertedDescription : ''}
              maxLine="20"
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
              <Icon
                customStyle={{ color: common.uiBlack }}
                name={isExpended ? 'CaretUpOutlined' : 'CaretDownOutlined'}
              />
            </Flexbox>
          </MoreInfoButton>
        )}
        {isCrawlingProduct && (
          <Typography variant="body2" customStyle={{ color: common.ui60, marginTop: 20 }}>
            * 카멜Ai검색엔진이 수집·분석한 매물정보입니다.
          </Typography>
        )}
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
            {product?.viewCount > 0 && (
              <Typography customStyle={{ color: common.ui60 }}>
                조회&nbsp;
                {product.viewCount}
              </Typography>
            )}
            {product?.wishCount > 0 && (
              <Flexbox gap={4} alignment="center">
                <Icon
                  name="HeartFilled"
                  width={16}
                  height={16}
                  customStyle={{ color: common.ui80, marginRight: 2 }}
                />
                <Typography customStyle={{ color: common.ui60 }}>{product.wishCount}</Typography>
              </Flexbox>
            )}
            {product?.purchaseCount > 0 && (
              <Flexbox gap={4} alignment="center">
                <Icon
                  name="MessageFilled"
                  width={16}
                  height={16}
                  customStyle={{ color: common.ui80 }}
                />
                <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
                  {product.purchaseCount}
                </Typography>
              </Flexbox>
            )}
          </Flexbox>
          {!isCamelSellerProduct && (
            <Flexbox gap={2} alignment="center" onClick={handleClickReport}>
              <Icon name="ReportFilled" width={20} height={20} color={common.ui80} />
              <Typography
                weight="medium"
                customStyle={{
                  color: common.ui60
                }}
              >
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
                          customStyle={{ marginRight: 6, color: primary.main }}
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
                    <Typography
                      variant="body2"
                      weight="medium"
                      customStyle={{ color: common.ui60 }}
                    >
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

const CertificationCard = styled.div`
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 24px;
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

function CheckedIcon() {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.195312 2.47145L1.13812 1.52865L3.33338 3.72391L6.86198 0.195312L7.80479 1.13812L3.33338 5.60953L0.195312 2.47145Z"
        fill="#313438"
      />
    </svg>
  );
}

export default ProductInfo;
