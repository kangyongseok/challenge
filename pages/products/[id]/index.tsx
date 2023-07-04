import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import dayjs from 'dayjs';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import Toast, { useToastStack } from '@mrcamelhub/camel-ui-toast';
import type { TypographyVariant } from '@mrcamelhub/camel-ui';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';
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
import {
  ProductActions,
  ProductButlerContents,
  ProductDetailBannerGroup,
  ProductDetailFooter,
  ProductDetailLegitBottomSheet,
  ProductImages,
  ProductInActiveCard,
  ProductInfo,
  ProductMowebAppContents,
  ProductNonMemberPaymentBottomSheet,
  ProductRedirect,
  ProductRelatedProductList,
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
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';
import { checkAgent, commaNumber, getProductDetailUrl, getRandomNumber } from '@utils/common';

import { userShopSelectedProductState } from '@recoil/userShop';
import { loginBottomSheetState } from '@recoil/common';
import useSession from '@hooks/useSession';
import useQueryUserData from '@hooks/useQueryUserData';
import useQueryProduct from '@hooks/useQueryProduct';
import useProductType from '@hooks/useProductType';
import useProductState from '@hooks/useProductState';
import useOsAlarm from '@hooks/useOsAlarm';
import useHistoryManage from '@hooks/useHistoryManage';

function ProductDetail() {
  const {
    query: { id: productId, redirect, chainPrice },
    asPath,
    replace,
    push
  } = useRouter();

  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const { checkOsAlarm, openOsAlarmDialog, handleCloseOsAlarmDialog } = useOsAlarm();

  const toastStack = useToastStack();
  const { data: userData, set: setUserDate } = useQueryUserData();
  const { data, isLoading, mutatePostProductsAdd, mutatePostProductsRemove, mutateMetaInfo } =
    useQueryProduct();
  const { isLoggedIn } = useSession();
  const { isPopStateEvent } = useHistoryManage();

  const [readyForOpenToast, setReadyForOpenToast] = useState(false);
  const [isShowAppDownloadDialog, setIsShowAppDownloadDialog] = useState(false);
  const [isMySelfProduct, setMySelfProduct] = useState(false);
  const [viewDetailProduct, setViewDetailProduct] = useState(false);
  const [{ isOpenPriceDownToast, isOpenDuplicatedToast }, setOpenToast] = useState({
    isOpenPriceDownToast: false,
    isOpenDuplicatedToast: false
  });
  const [targetProductUrl, setTargetProductUrl] = useState('');

  const loggedBrazeRef = useRef(false);

  const {
    isDuplicate,
    isPriceDown,
    isForSale,
    isReservation,
    isHidden,
    isDeleted,
    isTargetProduct,
    isSoldOut,
    discountedPrice
  } = useProductState({ productDetail: data, product: data?.product });
  const { isCamelButlerProduct } = useProductType(data?.product.sellerType);

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

  const isSoldOutMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp()) && isSoldOut;
  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);
  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);
  const product = !isLoading ? data?.product : undefined;

  const handleClickWish = useCallback(
    (isWish: boolean) => {
      if (!data?.product) return false;

      if (!isLoggedIn) {
        setLoginBottomSheet({ open: true, returnUrl: '' });
        return false;
      }

      if (isWish) {
        mutatePostProductsRemove();
      } else {
        mutatePostProductsAdd();
        checkOsAlarm();
      }

      return true;
    },
    [
      isLoggedIn,
      data?.product,
      mutatePostProductsAdd,
      mutatePostProductsRemove,
      setLoginBottomSheet,
      checkOsAlarm
    ]
  );

  const handleClickSMS = useCallback(
    ({
      id,
      sellerPhoneNumber,
      conversionId
    }: {
      id?: number;
      sellerPhoneNumber: string | null;
      conversionId?: number;
    }) => {
      if (!sellerPhoneNumber || !data) return;

      mutateMetaInfo({ isAddPurchaseCount: true });

      let message = '';

      const { protocol, host } = window.location;
      const newConversionId =
        conversionId || Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`);
      message = `안녕하세요, 카멜에서 매물 보고 연락 드려요~! \n${protocol}//${host}/products/${id}?conversionId=${newConversionId}`;

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
    [data, mutateMetaInfo]
  );

  const getProductImageOverlay = useCallback(
    ({ variant }: { variant?: TypographyVariant }) => {
      if (isForSale) {
        return null;
      }

      if (isDuplicate && isTargetProduct) {
        return isPriceDown ? (
          <PriceDownOverlay variant={variant} />
        ) : (
          <DuplicatedOverlay variant={variant} />
        );
      }

      if (isReservation) {
        return <ReservingOverlay variant={variant} />;
      }

      if (isHidden) {
        return <HideOverlay variant={variant} />;
      }

      return <SoldOutOverlay variant={variant} />;
    },
    [isForSale, isDuplicate, isTargetProduct, isReservation, isHidden, isPriceDown]
  );

  useEffect(() => {
    setUserShopSelectedProductState({ id: Number(productId) });

    if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(process.env.KAKAO_JS_KEY);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.roleSeller?.userId && accessUser?.userId) {
      setMySelfProduct(data?.roleSeller?.userId === accessUser?.userId);
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
      !isRedirectPage &&
      isForSale
    ) {
      SessionStorage.set(sessionStorageKeys.isFirstVisitProductDetail, true);
      setIsShowAppDownloadDialog(true);
    }
  }, [isRedirectPage, isForSale]);

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
      isDuplicate &&
      isTargetProduct &&
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
  }, [chainPrice, isTargetProduct, isDuplicate, isPriceDown, data, readyForOpenToast]);

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
    if (!data || !data.product || !isLoggedIn || !accessUser || loggedBrazeRef.current) return;

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
  }, [data, isLoggedIn, accessUser]);

  useEffect(() => {
    if (userData?.savedLegitRequest?.showToast) {
      toastStack({
        children: (
          <>
            <p>내 매물이 등록되었어요! 판매시작!</p>
            <p>(검색결과 반영까지 1분 정도 걸릴 수 있습니다)</p>
          </>
        )
      });
      setUserDate({
        [SAVED_LEGIT_REQUEST]: {
          ...userData.savedLegitRequest,
          showToast: false
        }
      });
    }
  }, [setUserDate, userData?.savedLegitRequest, toastStack]);

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

  useEffect(() => {
    scrollEnable();
  }, [data]);

  const handlePopState = useCallback(() => {
    replace(
      `/products/brands/${data?.product.brand.name}?parentIds=${
        data?.product.category.parentId
      }&categorySizeIds=${data?.product.categorySizes.map((item) => item.categorySizeId)}`
    ).then(() => {
      toastStack({
        children: (
          <>
            <p>전국의 중고명품을 모두 모았어요.</p>
            <p>원하는 매물을 둘러보세요!</p>
          </>
        )
      });
    });
    window.history.replaceState(
      { prevPage: 'productDetail' },
      '',
      `/products/brands/${data?.product.brand.name}?parentIds=${
        data?.product.category.parentId
      }&categorySizeIds=${data?.product.categorySizes.map((item) => item.categorySizeId)}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.product.brand.name,
    data?.product.category.parentId,
    data?.product.categorySizes,
    replace
  ]);

  useEffect(() => {
    const isSession = SessionStorage.get(sessionStorageKeys.isProductDetailPopState);
    if (isPopStateEvent && !isSession) {
      SessionStorage.set(sessionStorageKeys.isProductDetailPopState, true);
      window.history.pushState('', '', '/');
      window.history.pushState('', '', asPath);
      window.addEventListener('popstate', handlePopState);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [asPath, handlePopState, isPopStateEvent]);

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
          <ProductDetailHeader
            data={data}
            isWish={data?.wish}
            hideWishButton={(isSoldOut || isDeleted) && !viewDetailProduct}
            onClickWish={handleClickWish}
          />
        }
        footer={
          <ProductDetailFooter
            isRedirectPage={isRedirectPage}
            isMySelfProduct={isMySelfProduct}
            soldout={isSoldOut && !viewDetailProduct}
            deleted={data?.product.status === productStatusCode.deleted}
          />
        }
        hideAppDownloadBanner={isRedirectPage}
      >
        {isRedirectPage && data?.product && <ProductRedirect product={data.product} />}
        {!isRedirectPage && isDeleted && !isLoading && (
          <>
            <ProductInActiveCard variant="delete" product={data?.product} isSafe={isSafe} />
            <ProductRelatedProductList
              brandId={data?.product?.brand.id}
              categoryId={data?.product?.category.id}
              line={data?.product?.line}
              prevProduct={data?.product}
              quoteTitle={data?.product.quoteTitle}
              price={data?.product.price}
              productId={data?.product.id}
              isSoldOut={isSoldOut}
              isDeleted={isDeleted}
            />
          </>
        )}
        {!isRedirectPage && !isDeleted && (
          <>
            {isSoldOutMoweb && !viewDetailProduct && !isLoading ? (
              <ProductInActiveCard
                product={data?.product}
                isSafe={isSafe}
                setViewDetailProduct={setViewDetailProduct}
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
                  isMySelfProduct={isMySelfProduct}
                  sizeData={sizeParser()}
                  unitText={data?.units[0]?.description}
                  storeText={data?.stores[0]?.description}
                  distanceText={data?.distances[0]?.description}
                  isWish={data?.wish}
                  onClickWish={handleClickWish}
                />
                {isCamelButlerProduct && <ProductButlerContents />}
                {!isCamelButlerProduct && (
                  <>
                    <ProductActions product={product} onClickSMS={handleClickSMS} />
                    <ProductDetailBannerGroup product={product} />
                  </>
                )}
              </>
            )}
            {!isCamelButlerProduct && (
              <>
                <ProductRelatedProductList
                  brandId={data?.product?.brand.id}
                  categoryId={data?.product?.category.id}
                  line={data?.product?.line}
                  prevProduct={data?.product}
                  quoteTitle={data?.product.quoteTitle}
                  price={data?.product.price}
                  productId={data?.product.id}
                  parentId={data?.product?.category.parentId}
                  size={data?.product.size}
                  isSoldOut={isSoldOut}
                  isDeleted={isDeleted}
                />
                {(!isSoldOutMoweb || viewDetailProduct) && <ProductMowebAppContents data={data} />}
              </>
            )}
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
        action={{
          text: '확인하기',
          onClick: () => {
            logEvent(attrKeys.products.clickProductDetail, {
              name: attrProperty.name.productDetail,
              att: isPriceDown ? 'TOASTPRICELOW' : 'TOASTSAME',
              productType: getProductType(
                data?.product.productSeller.site.id || 0,
                data?.product.productSeller.type || 0
              )
            });
            push(targetProductUrl);
          }
        }}
        onClose={() =>
          setOpenToast((prevState) => ({ ...prevState, isOpenDuplicatedToast: false }))
        }
      >
        판매자가 같은 매물을 다시 올렸어요
      </Toast>
      <Toast
        open={isOpenPriceDownToast}
        autoHideDuration={6000}
        action={{
          text: '확인하기',
          onClick: () => push(targetProductUrl)
        }}
        onClose={() => setOpenToast((prevState) => ({ ...prevState, isOpenPriceDownToast: false }))}
      >
        {`${commaNumber(
          getTenThousandUnitPrice(discountedPrice)
        )}만원 할인! 판매자가 가격을 내려서 다시 올렸어요`}
      </Toast>
      <ProductDetailLegitBottomSheet product={data?.product} />
      <MyShopAppDownloadDialog />
      <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
      <ProductNonMemberPaymentBottomSheet />
    </>
  );
}

export async function getServerSideProps({ req, res, query }: GetServerSidePropsContext) {
  const isGoBack = req.cookies.isGoBack ? JSON.parse(req.cookies.isGoBack) : false;
  const accessUser = getAccessUserByCookies(getCookies({ req }));

  if (isGoBack) {
    res.setHeader('Set-Cookie', 'isGoBack=false;path=/');

    return {
      props: {
        accessUser
      }
    };
  }

  try {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));

    const { id } = query;

    // TODO getServerSideProps 가 2번 호출되고, null 이 string 으로 들어옴
    if (!id || id === 'null') {
      return {
        props: {
          accessUser
        }
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

    await queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories);

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        accessUser
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default ProductDetail;
