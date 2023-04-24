import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import { Flexbox, Toast, Typography, TypographyVariant, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { AppDownloadDialog, MyShopAppDownloadDialog } from '@components/UI/organisms';
import {
  DuplicatedOverlay,
  HideOverlay,
  PriceDownOverlay,
  ProductDetailHeader,
  ReservingOverlay,
  SoldOutOverlay
} from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { UserShopProductDeleteConfirmDialog } from '@components/pages/userShop';
import {
  ProductActions,
  ProductBanner,
  ProductCTAButton,
  ProductDeletedCard,
  ProductDetailFooter,
  ProductDetailLegitBottomSheet,
  ProductImages,
  ProductInfo,
  // ProductInterfereKingBottomSheet,
  ProductMowebAppContents,
  ProductRedirect,
  ProductRelatedProductList,
  ProductSoldoutCard,
  ProductStructuredData
} from '@components/pages/product';

import type { AccessUser } from '@dto/userAuth';
import type { Product } from '@dto/product';

import UserTraceRecord from '@library/userTraceRecord';
import updateAccessUserOnBraze from '@library/updateAccessUserOnBraze';
import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';
import { fetchParentCategories } from '@api/category';

import { SELLER_STATUS, productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import {
  ID_FILTER,
  LABELS,
  PRODUCT_SITE,
  PRODUCT_SOURCE,
  productStatusCode
} from '@constants/product';
import { ACCESS_USER, DUPLICATED_PRODUCT_IDS, SAVED_LEGIT_REQUEST } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollEnable } from '@utils/scroll';
import { getMetaDescription, getProductType, productDetailAtt } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { getCookies } from '@utils/cookies';
import { checkAgent, commaNumber, getProductDetailUrl, getRandomNumber } from '@utils/common';

import { userShopSelectedProductState } from '@recoil/userShop';
import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { loginBottomSheetState, toastState } from '@recoil/common';
import useRedirectVC from '@hooks/useRedirectVC';
import useQueryUserData from '@hooks/useQueryUserData';
import useQueryProduct from '@hooks/useQueryProduct';
import useOsAlarm from '@hooks/useOsAlarm';
// import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

function ProductDetail() {
  const {
    push,
    query: { id: productId, redirect, chainPrice },
    asPath
  } = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const [toast, setToastState] = useRecoilState(toastState);
  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);
  const setOsAlarm = useOsAlarm();

  const { data: userData, set: setUserDate } = useQueryUserData();
  const {
    data,
    isLoading,
    mutatePostProductsAdd,
    mutatePostProductsRemove,
    mutateMetaInfo,
    refetch
  } = useQueryProduct();
  useRedirectVC(
    data?.product ? getProductDetailUrl({ product: data?.product }) : `/products/${productId}`
  );

  const [readyForOpenToast, setReadyForOpenToast] = useState(false);
  const [isShowAppDownloadDialog, setIsShowAppDownloadDialog] = useState(false);
  const [isCamelSellerProduct, setCamelSellerProduct] = useState(false);
  const [viewDetail, setViewDetail] = useState(false);
  const [{ isOpenPriceDownToast, isOpenDuplicatedToast }, setOpenToast] = useState({
    isOpenPriceDownToast: false,
    isOpenDuplicatedToast: false
  });
  const [targetProductUrl, setTargetProductUrl] = useState('');

  const loggedBrazeRef = useRef(false);

  const { isPriceDown, isDup, isPriceCrm, hasTarget, salePrice } = useMemo(() => {
    const newPrice = getTenThousandUnitPrice(data?.product.price || 0);
    const newTargetProductPrice = getTenThousandUnitPrice(data?.product?.targetProductPrice || 0);
    let newIsPriceDown = newTargetProductPrice < newPrice;
    let newIsDup = data?.product.targetProductStatus === 0;
    let newHasTarget = !!data?.product.targetProductId;
    let newSalePrice =
      newIsDup && newHasTarget && newIsPriceDown ? newPrice - newTargetProductPrice : 0;

    if (newSalePrice < 1) {
      newIsPriceDown = false;
    }

    if (chainPrice) {
      newSalePrice = Number(chainPrice) - (data?.product.price || 0);
      newIsDup = false;
      newHasTarget = false;
      newIsPriceDown = false;
    }

    return {
      isPriceDown: newIsPriceDown,
      isPriceCrm: newSalePrice >= 1,
      isDup: newIsDup,
      hasTarget: newHasTarget,
      salePrice: newSalePrice
    };
  }, [chainPrice, data]);

  const isNormalseller = data?.product.sellerType === productSellerType.normal;

  useEffect(() => {
    scrollEnable();
  }, [data]);

  useEffect(() => {
    if (toast.status === 'soldout' && isCamelSellerProduct) {
      refetch();
    }
  }, [refetch, isCamelSellerProduct, toast.status]);

  const isSafe = useMemo(() => {
    if (data) {
      return (
        Object.entries(PRODUCT_SITE).some(
          ([key, productSite]) =>
            ['HELLO', 'KREAM'].includes(key) &&
            productSite.id === data.product.productSeller.site.id
        ) ||
        data.product.labels.some(
          (label) =>
            label.codeId === ID_FILTER &&
            LABELS[ID_FILTER].some(
              ({ name, description }) => name === label.name && description === '안전'
            )
        )
      );
    }

    return false;
  }, [data]);

  const soldout = useMemo(
    () => data?.product.status === productStatusCode.soldOut && !(isDup && hasTarget),
    [data?.product.status, hasTarget, isDup]
  );
  const isSoldOutMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp()) && soldout;
  const isDeletedProduct = productStatusCode.deleted === data?.product.status;
  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);
  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);
  const product = !isLoading ? data?.product : undefined;
  const bulterTargetBrands = ['샤넬', '디올', '구찌', '보테가베네타', '루이비통', '고야드'];

  const isButlerBrand = bulterTargetBrands.includes(product?.brand.name || '');
  const categoryBag = product?.category.parentId === 45;
  const isButlerPrice = (product?.price || 0) >= 3000000;
  const isButlerBanner = isButlerBrand && categoryBag && isButlerPrice;

  const handleClickWish = useCallback(
    (isWish: boolean) => {
      if (!data?.product) return false;

      if (!accessUser) {
        setLoginBottomSheet({ open: true, returnUrl: '' });
        return false;
      }

      if (isWish) {
        mutatePostProductsRemove();
      } else {
        mutatePostProductsAdd();
        setOsAlarm();
      }

      return true;
    },
    [
      accessUser,
      data?.product,
      mutatePostProductsAdd,
      mutatePostProductsRemove,
      setLoginBottomSheet,
      setOsAlarm
    ]
  );

  const handleClickSMS = useCallback(
    ({
      siteId,
      sellerType,
      id,
      sellerPhoneNumber,
      conversionId
    }: {
      siteId?: number;
      sellerType?: number;
      id?: number;
      sellerPhoneNumber: string | null;
      conversionId?: number;
    }) => {
      if (!sellerPhoneNumber || !data) return;

      mutateMetaInfo({ isAddPurchaseCount: true });

      let message = '';

      if (
        siteId === PRODUCT_SITE.CAMEL.id ||
        (sellerType &&
          SELLER_STATUS[sellerType as keyof typeof SELLER_STATUS] === SELLER_STATUS['3']) ||
        isNormalseller
      ) {
        const { protocol, host } = window.location;
        const newConversionId =
          conversionId || Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`);
        message = `안녕하세요, 카멜에서 매물 보고 연락 드려요~! \n${protocol}//${host}/products/${id}?conversionId=${newConversionId}`;
      }

      if (checkAgent.isAndroidApp() && window.webview && window.webview.callSendMessage) {
        window.webview.callSendMessage(sellerPhoneNumber, message);
        return;
      }

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callSendMessage
      ) {
        window.webkit.messageHandlers.callSendMessage.postMessage(
          JSON.stringify({ sellerPhoneNumber, content: message })
        );
        return;
      }

      window.location.href = `sms:${sellerPhoneNumber}${
        checkAgent.isAndroid() ? '?' : '&'
      }body=${message}`;
    },
    [data, mutateMetaInfo, isNormalseller]
  );

  const getProductImageOverlay = useCallback(
    ({ status, variant }: { status: number; variant?: TypographyVariant }) => {
      if (status === productStatusCode.sale) {
        return null;
      }

      if (isDup && hasTarget) {
        return isPriceDown ? (
          <PriceDownOverlay variant={variant} />
        ) : (
          <DuplicatedOverlay variant={variant} />
        );
      }

      if (status === productStatusCode.reservation) {
        return <ReservingOverlay variant={variant} />;
      }

      if (status === productStatusCode.hidden) {
        return <HideOverlay variant={variant} />;
      }

      return <SoldOutOverlay variant={variant} />;
    },
    [hasTarget, isDup, isPriceDown]
  );

  const handleClickViewDetail = () => {
    logEvent(attrKeys.products.CLICK_SOLDOUT_DETAIL, {
      name: attrProperty.name.productDetail
    });

    setViewDetail(true);
  };

  const handleClickTransfer = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT_DETAIL,
      att: 'TRANSFER'
    });

    resetPlatformsState();
    resetDataState();

    if (!accessUser) {
      setLoginBottomSheet({
        open: true,
        returnUrl: '/mypage/settings/transfer'
      });
      return;
    }

    push('/mypage/settings/transfer');
  };

  const handleClickButler = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT_DETAIL,
      att: 'BUTLER'
    });

    SessionStorage.set(sessionStorageKeys.butlerSource, 'PRODUCT_DETAIL');

    push('/events/butlerIntro');
  };

  useEffect(() => {
    setUserShopSelectedProductState({ id: Number(productId) });

    if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(process.env.KAKAO_JS_KEY);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.roleSeller?.userId && accessUser?.userId) {
      setCamelSellerProduct(data?.roleSeller?.userId === accessUser?.userId);
    } else {
      setCamelSellerProduct(false);
    }
    if (data && data.showReviewPrompt) {
      if (checkAgent.isAndroidApp()) {
        if (window.webview && window.webview.callReviewRequest) {
          window.webview.callReviewRequest();
          logEvent(attrKeys.products.VIEW_APPREVIEW_PROMPT);
        }
      } else if (checkAgent.isIOSApp()) {
        if (
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.callReviewRequest
        ) {
          window.webkit.messageHandlers.callReviewRequest.postMessage(0);
          logEvent(attrKeys.products.VIEW_APPREVIEW_PROMPT);
        }
      }
    }
  }, [accessUser?.userId, data]);

  useEffect(() => {
    if (
      !checkAgent.isMobileApp() &&
      !SessionStorage.get(sessionStorageKeys.isFirstVisitProductDetail) &&
      !isRedirectPage
    ) {
      SessionStorage.set(sessionStorageKeys.isFirstVisitProductDetail, true);
      setIsShowAppDownloadDialog(true);
    }
  }, [isRedirectPage]);

  useEffect(() => {
    if (!isRedirectPage && data?.product.brand && data.product.brand.name) {
      const { source } =
        SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
        {};
      productDetailAtt({
        key: attrKeys.products.VIEW_PRODUCT_DETAIL,
        product: data.product,
        source
      });
    }
  }, [isRedirectPage, data]);

  useEffect(() => {
    const { product: { id: newProductId = 0 } = {} } = data || {};

    if (!newProductId) return;

    const duplicatedProductIds = LocalStorage.get<number[]>(DUPLICATED_PRODUCT_IDS) || [];

    if (
      !duplicatedProductIds.some(
        (duplicatedProductId) => duplicatedProductId === Number(newProductId)
      ) &&
      isDup &&
      hasTarget &&
      !chainPrice &&
      readyForOpenToast
    ) {
      if (isPriceDown) {
        logEvent(attrKeys.products.VIEW_PRODUCT_DETAIL_TOAST, {
          name: 'PRODUCT_DETAIL',
          att: 'PRICELOW'
        });
        setOpenToast((prevState) => ({ ...prevState, isOpenPriceDownToast: true }));
      } else {
        logEvent(attrKeys.products.VIEW_PRODUCT_DETAIL_TOAST, {
          name: 'PRODUCT_DETAIL',
          att: 'SAME'
        });
        setOpenToast((prevState) => ({ ...prevState, isOpenDuplicatedToast: true }));
      }

      LocalStorage.set(DUPLICATED_PRODUCT_IDS, duplicatedProductIds.concat([Number(newProductId)]));
    }
  }, [chainPrice, hasTarget, isDup, isPriceDown, data, readyForOpenToast]);

  useEffect(() => {
    setOpenToast({
      isOpenPriceDownToast: false,
      isOpenDuplicatedToast: false
    });
    setReadyForOpenToast(true);
  }, [productId]);

  useEffect(() => {
    scrollEnable();

    if (!data) return;

    setTargetProductUrl(getProductDetailUrl({ type: 'targetProduct', product: data.product }));
  }, [data]);

  useEffect(() => {
    loggedBrazeRef.current = false;
  }, [asPath]);

  useEffect(() => {
    if (!data || !data.product || !accessUser || loggedBrazeRef.current) return;

    loggedBrazeRef.current = true;

    const categories = [];

    const {
      product: { category: productCategory, productCategories = [], quoteTitle: productQuoteTitle }
    } = data;

    let quoteTitle = productQuoteTitle || '';

    if (productCategory) {
      categories.push(productCategory.name);
    }

    if (productCategories && !!productCategories.length) {
      productCategories.forEach(({ category: { name: categoryName } }) =>
        categories.push(categoryName)
      );
    }

    categories.forEach((c) => {
      quoteTitle = quoteTitle.replace(c, '');
    });

    quoteTitle = quoteTitle.replace('  ', ' ').replace('  ', ' ');

    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        quoteTitle += ` ${category}`;
      });
    }

    updateAccessUserOnBraze({ ...accessUser, lastProductModel: quoteTitle });
  }, [data, accessUser]);

  useEffect(() => {
    if (userData?.savedLegitRequest?.showToast) {
      setToastState({
        type: 'product',
        status: 'saleSuccess'
      });
      setUserDate({
        [SAVED_LEGIT_REQUEST]: {
          ...userData.savedLegitRequest,
          showToast: false
        }
      });
    }
  }, [setToastState, setUserDate, userData?.savedLegitRequest]);

  useEffect(() => {
    logEvent(attrKeys.products.VIEW_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT_DETAIL,
      att: 'TRANSFER'
    });
  }, []);

  useEffect(() => {
    UserTraceRecord.increasePageViewCount('product');
    UserTraceRecord.increasePageViewCount('exitProduct');
  }, []);

  const sizeParser = () => {
    const selectedMainSize = data?.product?.categorySizes?.map((size) => size.name) || [];
    const selectedOption = data?.sizeOptions?.map((size) => size.description) || [];
    return [...selectedMainSize, ...selectedOption];
  };

  return (
    <>
      <PageHead
        title={`${data?.product.title} | 카멜`}
        description={`${getMetaDescription(data?.product)}`}
        ogTitle={`${data?.product.title} | 카멜`}
        ogDescription={`${getMetaDescription(data?.product)}`}
        ogImage={data?.product.imageMain || data?.product.imageThumbnail}
        canonical={`https://mrcamel.co.kr${getProductDetailUrl({
          product: data?.product as Product
        })}`}
        keywords={`중고 ${data?.product.brand.name}, 중고 ${data?.product.category.name}, 중고 ${data?.product.quoteTitle}, ${data?.product.brand.name}, ${data?.product.category.name}, ${data?.product.quoteTitle}, 여자 ${data?.product.category.name}, 남자 ${data?.product.category.name}`}
        product={data?.product}
      />
      <ProductStructuredData
        product={data?.product}
        relatedProducts={data?.relatedProducts}
        url={`https://mrcamel.co.kr${getProductDetailUrl({
          product: data?.product as Product
        })}`}
      />
      <GeneralTemplate
        header={
          <ProductDetailHeader data={data} isWish={data?.wish} onClickWish={handleClickWish} />
        }
        footer={
          <ProductDetailFooter
            data={data}
            viewDetail={viewDetail}
            isRedirectPage={isRedirectPage}
            isCamelSellerProduct={isCamelSellerProduct}
            soldout={soldout}
            deleted={data?.product.status === productStatusCode.deleted}
            refresh={refetch}
            productButton={
              <ProductCTAButton
                product={data?.product}
                channels={data?.channels}
                roleSeller={data?.roleSeller}
                isBlockedUser={data?.blockUser || false}
                isAdminBlockedUser={data?.product?.productSeller?.type === 1}
                isDup={isDup}
                hasTarget={hasTarget}
                hasOrder={data?.hasOrder}
                isPriceCrm={isPriceCrm}
                salePrice={salePrice}
                isPriceDown={isPriceDown}
                onClickSMS={handleClickSMS}
                mutateMetaInfo={mutateMetaInfo}
                refetch={refetch}
                offers={data?.offers}
              />
            }
          />
        }
        hideAppDownloadBanner={isRedirectPage}
      >
        {isRedirectPage && data?.product && <ProductRedirect product={data.product} />}
        {!isRedirectPage && isDeletedProduct && (
          <>
            <ProductDeletedCard />
            <ProductRelatedProductList
              brandId={data?.product?.brand.id}
              categoryId={data?.product?.category.id}
              line={data?.product?.line}
              prevProduct={data?.product}
              quoteTitle={data?.product.quoteTitle}
              price={data?.product.price}
              productId={data?.product.id}
            />
          </>
        )}
        {!isRedirectPage && !isDeletedProduct && (
          <>
            {isSoldOutMoweb && !viewDetail ? (
              <ProductSoldoutCard
                product={data?.product}
                isSafe={isSafe}
                onClick={handleClickViewDetail}
              />
            ) : (
              <>
                <ProductImages
                  isLoading={isLoading}
                  product={data?.product}
                  getProductImageOverlay={getProductImageOverlay}
                  isProductLegit={data?.productLegit}
                />
                <ProductInfo
                  product={product}
                  isCamelSellerProduct={isCamelSellerProduct}
                  sizeData={sizeParser()}
                  unitText={data?.units[0]?.description}
                  storeText={data?.stores[0]?.description}
                  distanceText={data?.distances[0]?.description}
                  isWish={data?.wish}
                  onClickWish={handleClickWish}
                />
                <ProductActions
                  product={product}
                  hasRoleSeller={!!data?.roleSeller?.userId}
                  onClickSMS={handleClickSMS}
                  isCamelSellerProduct={isCamelSellerProduct}
                />
                {isButlerBanner ? (
                  <ProductBanner
                    handleClick={handleClickButler}
                    bannerColor="#161617"
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_banner.png`}
                    alt="사고싶은 가방 아직 찾지 못했다면?"
                  />
                ) : (
                  <ProductBanner
                    handleClick={handleClickTransfer}
                    bannerColor="#111A3D"
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/transfer-banner.png`}
                    alt="내 상품 가져오기로 한번에 판매 등록!"
                  />
                )}
              </>
            )}
            <ProductMowebAppContents data={data} />
            <ProductRelatedProductList
              brandId={data?.product?.brand.id}
              categoryId={data?.product?.category.id}
              line={data?.product?.line}
              prevProduct={data?.product}
              quoteTitle={data?.product.quoteTitle}
              price={data?.product.price}
              productId={data?.product.id}
            />
          </>
        )}
      </GeneralTemplate>
      <AppDownloadDialog
        variant="wish"
        open={isShowAppDownloadDialog}
        onClose={() => setIsShowAppDownloadDialog(false)}
        productId={data?.product.id}
      />
      <Toast
        open={isOpenDuplicatedToast}
        autoHideDuration={6000}
        onClose={() =>
          setOpenToast((prevState) => ({ ...prevState, isOpenDuplicatedToast: false }))
        }
      >
        <Flexbox alignment="center" justifyContent="space-between" gap={8}>
          <Typography
            weight="medium"
            customStyle={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              color: common.uiWhite
            }}
          >
            판매자가 같은 매물을 다시 올렸어요
          </Typography>
          <Typography
            weight="medium"
            customStyle={{
              textDecoration: 'underline',
              whiteSpace: 'nowrap',
              color: common.ui80
            }}
            onClick={() => {
              logEvent(attrKeys.products.clickProductDetail, {
                name: attrProperty.name.productDetail,
                att: isPriceDown ? 'TOASTPRICELOW' : 'TOASTSAME',
                productType: getProductType(
                  data?.product.productSeller.site.id || 0,
                  data?.product.productSeller.type || 0
                )
              });
            }}
          >
            <Link href={targetProductUrl}>확인하기</Link>
          </Typography>
        </Flexbox>
      </Toast>
      <Toast
        open={isOpenPriceDownToast}
        autoHideDuration={6000}
        onClose={() => setOpenToast((prevState) => ({ ...prevState, isOpenPriceDownToast: false }))}
      >
        <Flexbox alignment="center" justifyContent="space-between" gap={8}>
          <PriceDownText weight="medium">
            {`${commaNumber(salePrice)}만원 할인! 판매자가 가격을 내려서 다시 올렸어요`}
          </PriceDownText>
          <Typography
            weight="medium"
            customStyle={{
              textDecoration: 'underline',
              whiteSpace: 'nowrap',
              color: common.ui80
            }}
          >
            <Link href={targetProductUrl}>확인하기</Link>
          </Typography>
        </Flexbox>
      </Toast>
      <ProductDetailLegitBottomSheet product={data?.product} />
      <MyShopAppDownloadDialog />
      <UserShopProductDeleteConfirmDialog redirect />
      {/* <ProductInterfereKingBottomSheet /> */}
    </>
  );
}

export async function getServerSideProps({ req, res, query }: GetServerSidePropsContext) {
  const isGoBack = req.cookies.isGoBack ? JSON.parse(req.cookies.isGoBack) : false;
  if (isGoBack) {
    res.setHeader('Set-Cookie', 'isGoBack=false;path=/');

    return {
      props: {}
    };
  }

  try {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));

    const { id } = query;

    // TODO getServerSideProps 가 2번 호출되고, null 이 string 으로 들어옴
    if (!id || id === 'null') {
      return {
        props: {}
      };
    }

    if (id === 'undefined') {
      return {
        redirect: {
          destination: '/',
          statusCode: 301
        }
      };
    }

    const splitIds = String(id).split('-');
    const productId = Number(splitIds[splitIds.length - 1] || 0);

    const product = await queryClient.fetchQuery(
      queryKeys.products.product({ productId }),
      async () => {
        const resultProduct = await fetchProduct({ productId, source: PRODUCT_SOURCE.API });

        resultProduct.product.viewCount += 1;

        return resultProduct;
      }
    );

    const destination = encodeURI(getProductDetailUrl({ product: product.product }));
    const splitDestination = destination.split('/');
    const hasNewId = Number.isNaN(Number(splitDestination[splitDestination.length - 1]));

    if ((!Number.isNaN(Number(id)) && hasNewId) || id?.includes(' ')) {
      return {
        redirect: {
          destination,
          permanent: true
        }
      };
    }

    queryClient.setQueryData(queryKeys.products.product({ productId }), product);
    await queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories);

    return {
      props: {
        dehydratedState: dehydrate(queryClient)
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

const PriceDownText = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export default ProductDetail;
