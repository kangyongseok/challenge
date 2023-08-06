import { forwardRef, useEffect, useState } from 'react';
import type { HTMLAttributes, MouseEvent } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Flexbox, Icon, Image, Label, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { HideOverlay, ReservingOverlay, SoldOutOverlay } from '@components/UI/molecules';

import type { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsRemove } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductCardImageResizePath, getProductDetailUrl } from '@utils/common';

import type { WishAtt } from '@typings/product';
import { openDeleteToastState, removeIdState } from '@recoil/wishes';
import { deviceIdState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useProductState from '@hooks/useProductState';
import useProductCardState from '@hooks/useProductCardState';

interface ProductWishesCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product;
  wishAtt?: WishAtt;
  productAtt?: object;
  index?: number;
  source?: string;
  onWishAfterChangeCallback?: () => void;
}

const ProductWishesCard = forwardRef<HTMLDivElement, ProductWishesCardProps>(
  function ProductWishesCard(
    { product, wishAtt, productAtt, index, source, onWishAfterChangeCallback },
    ref
  ) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const [isWish, setIsWish] = useState(false);

    const {
      imageUrl,
      showPriceDown,
      showDuplicateUploadAlert,
      isPopular,
      salePrice,
      productLegitStatusText,
      discountedPrice
    } = useProductCardState(product);
    const { isPriceDown, isReRegisterProduct } = useProductState({ product });
    const toastStack = useToastStack();

    const deviceId = useRecoilValue(deviceIdState);
    const setRemoveId = useSetRecoilState(removeIdState);
    const setDeleteToast = useSetRecoilState(openDeleteToastState);

    const { data: { userWishIds = [] } = {}, refetch: refetchCategoryWishes } =
      useQueryCategoryWishes({ deviceId });
    const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove);

    const {
      id,
      quoteTitle,
      targetProductId,
      brand: { name: brandName, nameEng } = {},
      category: { name: categoryName } = {},
      line,
      site: { name: siteName } = {},
      targetProductPrice,
      scoreTotal,
      price = 0,
      wishCount = 0,
      purchaseCount = 0,
      status
    } = product;

    const handleClickWish = (e: MouseEvent<SVGElement>) => {
      e.stopPropagation();

      if (isWish && router.query.tab !== 'history') {
        logEvent(attrKeys.wishes.CLICK_WISH_CANCEL, {
          ...productAtt,
          productType: getProductType(product.productSeller.site.id, product.productSeller.type)
        });
        setRemoveId(id);
        mutatePostProductsRemove(
          {
            productId: id,
            deviceId
          },
          {
            async onSuccess() {
              await queryClient.refetchQueries(queryKeys.products.product({ productId: id }));
              await refetchCategoryWishes();
              setDeleteToast(true);
              if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
                onWishAfterChangeCallback();
              }
            }
          }
        );
      }
      if (isWish && router.query.tab === 'history') {
        logEvent(isWish ? attrKeys.home.CLICK_WISH_CANCEL : attrKeys.home.CLICK_WISH, {
          ...wishAtt,
          productType: getProductType(product.productSeller.site.id, product.productSeller.type)
        });

        mutatePostProductsRemove(
          { productId: id, deviceId },
          {
            async onSuccess() {
              await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
                exact: true
              });
              await refetchCategoryWishes();
              toastStack({
                children: '찜목록에서 삭제했어요.'
              });
            }
          }
        );
      }
    };

    const handleClickStatusLabel = (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, {
        ...productAtt,
        name: 'WISH_LIST',
        att: isPriceDown ? 'PRICELOW' : 'SAME',
        index,
        id: targetProductId,
        brand: brandName,
        category: categoryName,
        line,
        site: siteName,
        price: targetProductPrice,
        scoreTotal,
        productType: getProductType(product.productSeller.site.id, product.productSeller.type)
      });

      if (!showDuplicateUploadAlert && isReRegisterProduct) {
        logEvent(attrKeys.products.CLICK_CLOSE, {
          name: 'MAIN',
          title: 'WISHPRICE_TOOLTIP'
        });
      }

      router.push(getProductDetailUrl({ type: 'targetProduct', product }));
    };

    const handleClickProductDetail = () => {
      logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, {
        ...productAtt,
        productType: getProductType(product.productSeller.site.id, product.productSeller.type)
      });

      if (source) {
        SessionStorage.set(sessionStorageKeys.productDetailEventProperties, { source });
      }

      router.push(getProductDetailUrl({ product }));
    };

    useEffect(() => {
      setIsWish(userWishIds.includes(id));
    }, [id, userWishIds]);

    return (
      <Flexbox direction="vertical" gap={12} ref={ref}>
        <Flexbox alignment="flex-start" gap={16} onClick={handleClickProductDetail}>
          <ProductImage>
            <Image
              src={getProductCardImageResizePath(imageUrl)}
              alt={imageUrl?.slice(imageUrl.lastIndexOf('/') + 1)}
              disableAspectRatio
              customStyle={{ borderRadius: 8 }}
              width={120}
              height={144}
            />
            {PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] && (
              <>
                {status === 4 && <ReservingOverlay variant="h4" style={{ fontWeight: 700 }} />}
                {status === 8 ? (
                  <HideOverlay variant="h4" style={{ fontWeight: 700 }} />
                ) : (
                  <SoldOutOverlay variant="h4" style={{ fontWeight: 700 }} />
                )}
              </>
            )}
          </ProductImage>
          <ProductContents direction="vertical">
            <Typography weight="bold" variant="body3">
              {nameEng
                ?.split(' ')
                .map(
                  (splitNameEng) =>
                    `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                      1,
                      splitNameEng.length
                    )}`
                )
                .join(' ')}
            </Typography>
            <Typography color="ui60" variant="body3">
              {quoteTitle}
            </Typography>
            <Typography weight="bold" variant="h3" customStyle={{ marginTop: 4 }}>
              {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
            </Typography>
            <Typography variant="small2" color="ui60" customStyle={{ marginTop: 8 }}>
              categoryWishes api 에 주소 정보 필요
            </Typography>
            {(!!wishCount || !!purchaseCount) && (
              <Flexbox gap={12} alignment="center" customStyle={{ marginTop: 6 }}>
                {!!wishCount && (
                  <Flexbox gap={2} alignment="center">
                    <Icon name="HeartFilled" width={12} height={12} color="ui80" />
                    <Typography color="ui80" variant="small2">
                      {wishCount}
                    </Typography>
                  </Flexbox>
                )}
                {!!purchaseCount && (
                  <Flexbox gap={2} alignment="center">
                    <Icon name="MessageFilled" width={12} height={12} color="ui80" />
                    <Typography color="ui80" variant="small2">
                      {purchaseCount}
                    </Typography>
                  </Flexbox>
                )}
              </Flexbox>
            )}
            <Flexbox alignment="center" gap={2} customStyle={{ marginTop: 12 }}>
              {isPopular && <Label variant="solid" size="xsmall" brandColor="black" text="인기" />}
              {!!productLegitStatusText && (
                <Label
                  text={
                    <Typography variant="small2" color="uiBlack">
                      {productLegitStatusText}
                    </Typography>
                  }
                  variant="outline"
                  brandColor="black"
                  size="xsmall"
                />
              )}
              {!!showPriceDown && (
                <Label
                  brandColor="red"
                  variant="outline"
                  size="xsmall"
                  text={
                    <Flexbox alignment="center">
                      <Icon name="Arrow4DownFilled" width={12} height={12} />
                      <Typography weight="medium" variant="small2" color="red">
                        {commaNumber(Math.round(discountedPrice / 10000))}만원
                      </Typography>
                    </Flexbox>
                  }
                />
              )}
            </Flexbox>
          </ProductContents>
          <Icon
            name="HeartFilled"
            color="red-light"
            width={24}
            height={24}
            customStyle={{ marginLeft: 'auto' }}
            onClick={handleClickWish}
          />
        </Flexbox>
        {showDuplicateUploadAlert && (
          <StatusLabel alignment="center" gap={4} onClick={handleClickStatusLabel}>
            <Typography weight="bold" variant="body2" color="primary-light">
              중복
            </Typography>
            <Typography weight="medium" variant="body2">
              같은매물을 다시 올렸어요
            </Typography>
            <Icon
              name="Arrow2RightOutlined"
              color="ui60"
              width={12}
              height={12}
              customStyle={{ marginLeft: 'auto' }}
            />
          </StatusLabel>
        )}
        {!showDuplicateUploadAlert && isReRegisterProduct && (
          <StatusLabel alignment="center" gap={4} onClick={handleClickStatusLabel}>
            <Typography weight="bold" variant="body2" color="red-light">
              가격하락
            </Typography>
            <Typography weight="medium" variant="body2">
              {commaNumber(Math.round(salePrice / 10000))}만원 내려서 다시 올렸어요!
            </Typography>
            <Icon
              name="Arrow2RightOutlined"
              color="ui60"
              width={12}
              height={12}
              customStyle={{ marginLeft: 'auto' }}
            />
          </StatusLabel>
        )}
      </Flexbox>
    );
  }
);

const ProductImage = styled.div`
  min-width: 120px;
  height: 144px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
`;

const ProductContents = styled(Flexbox)``;

const StatusLabel = styled(Flexbox)`
  padding: 12px;
  border-radius: 0px 8px 8px 8px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
`;

export default ProductWishesCard;

// import { forwardRef, useEffect, useState } from 'react';
// import type { HTMLAttributes, MouseEvent } from 'react';

// import { useRecoilValue, useSetRecoilState } from 'recoil';
// import { useRouter } from 'next/router';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useToastStack } from '@mrcamelhub/camel-ui-toast';
// import {
//   Alert,
//   Avatar,
//   Box,
//   Flexbox,
//   Icon,
//   Image,
//   Label,
//   Typography,
//   useTheme
// } from '@mrcamelhub/camel-ui';

// import { HideOverlay, ReservingOverlay, SoldOutOverlay } from '@components/UI/molecules';

// import SessionStorage from '@library/sessionStorage';
// import { logEvent } from '@library/amplitude';

// import { postProductsAdd, postProductsRemove } from '@api/user';

// import { productType } from '@constants/user';
// import sessionStorageKeys from '@constants/sessionStorageKeys';
// import queryKeys from '@constants/queryKeys';
// import { PRODUCT_STATUS } from '@constants/product';
// import { IMG_CAMEL_PLATFORM_NUMBER } from '@constants/common';
// import attrKeys from '@constants/attrKeys';

// import { getProductType } from '@utils/products';
// import { commaNumber, getTenThousandUnitPrice } from '@utils/formats';
// import { getProductCardImageResizePath, getProductDetailUrl } from '@utils/common';

// import type { WishAtt } from '@typings/product';
// import { openDeleteToastState, removeIdState } from '@recoil/wishes';
// import { deviceIdState } from '@recoil/common';
// import useSession from '@hooks/useSession';
// import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
// import useProductState from '@hooks/useProductState';
// import useProductCardState from '@hooks/useProductCardState';

// import { Content, PriceDownLabel, Title } from './ProductWishesCard.styles';

// interface ProductWishesCardProps extends HTMLAttributes<HTMLDivElement> {
//   product: Product;
//   index?: number;
//   iconType?: string;
//   wishAtt?: WishAtt;
//   name?: string;
//   source?: string;
//   productAtt?: object;
//   onWishAfterChangeCallback?: () => void;
// }

// const ProductWishesCard = forwardRef<HTMLDivElement, ProductWishesCardProps>(
//   function ProductWishesCard(
//     {
//       product,
//       index,
//       iconType,
//       wishAtt,
//       name,
//       source,
//       productAtt,
//       onWishAfterChangeCallback,
//       ...props
//     },
//     ref
//   ) {
//     const {
//       theme: {
//         palette: { common, primary, secondary }
//       }
//     } = useTheme();

//     const toastStack = useToastStack();

//     const queryClient = useQueryClient();
//     const { isLoggedIn } = useSession();

//     const [isWish, setIsWish] = useState(false);
//     const setDeleteToast = useSetRecoilState(openDeleteToastState);
//     const setRemoveId = useSetRecoilState(removeIdState);
//     const router = useRouter();
//     const deviceId = useRecoilValue(deviceIdState);
// const { data: { userWishIds = [] } = {}, refetch: refetchCategoryWishes } =
//   useQueryCategoryWishes({ deviceId });
//     const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove);
//     const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
//       async onSuccess() {
//         await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
//           exact: true
//         });
//         await refetchCategoryWishes();
//         toastStack({
//           children: '찜목록에 추가했어요!',
//           action: {
//             text: '찜목록 보기',
//             onClick: () => {
//               logEvent(attrKeys.products.clickWishList, { name, type: 'TOAST' });
//               router.push('/wishes');
//             }
//           }
//         });
//       }
//     });
// const {
//   imageUrl,
//   showPriceDown,
//   showDuplicateUploadAlert,
//   isPopular,
//   salePrice,
//   productLegitStatusText,
//   discountedPrice
// } = useProductCardState(product);
// const { isPriceDown, isReRegisterProduct } = useProductState({ product });

//     const [loadFailed, setLoadFailed] = useState(false);

// const {
//   id,
//   title,
//   site: { id: siteId } = {},
//   siteUrl,
//   targetProductId,
//   brand: { name: brandName } = {},
//   category: { name: categoryName } = {},
//   line,
//   site: { name: siteName } = {},
//   targetProductPrice,
//   scoreTotal,
//   price = 0,
//   wishCount = 0,
//   purchaseCount = 0,
//   status
// } = product;

//     const isNormalseller = product.sellerType === productType.normal;

// useEffect(() => {
//   setIsWish(userWishIds.includes(id));
// }, [id, userWishIds]);

// const handleClickProductDetail = () => {
//   logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, {
//     ...productAtt,
//     productType: getProductType(product.productSeller.site.id, product.productSeller.type)
//   });

//   if (source) {
//     SessionStorage.set(sessionStorageKeys.productDetailEventProperties, { source });
//   }

//   router.push(getProductDetailUrl({ product }));
// };

//     return (
//       <>
//         <Flexbox
//           alignment="flex-start"
//           gap={12}
//           customStyle={{ position: 'relative' }}
//           ref={ref}
//           onClick={handleClickProductDetail}
//           {...props}
//         >
//           <Content isTimeline={router.query.tab === 'history'}>
//             <Image
// src={loadFailed ? imageUrl : getProductCardImageResizePath(imageUrl)}
// alt={imageUrl?.slice(imageUrl.lastIndexOf('/') + 1)}
//               round={8}
//               onError={() => setLoadFailed(true)}
//             />
//             {/* <Avatar
//               width={20}
//               height={20}
//               src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
//                 isNormalseller ? IMG_CAMEL_PLATFORM_NUMBER : (siteUrl || {}).id || siteId
//               }.png`}
//               alt="Platform Img"
//               disableSkeleton
//               customStyle={{ position: 'absolute', top: 10, left: 10 }}
//             /> */}
// {PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] && (
//   <>
//     {status === 4 && <ReservingOverlay card variant="body2" />}
//     {status === 8 ? (
//       <HideOverlay card variant="body2" />
//     ) : (
//       <SoldOutOverlay card variant="body2" />
//     )}
//   </>
// )}
//           </Content>
//           <Flexbox
//             alignment="flex-start"
//             justifyContent="space-between"
//             customStyle={{ flex: 1, marginTop: 5 }}
//             gap={10}
//           >
//             <Box>
//               <Title variant="body2" weight="medium" customStyle={{ marginBottom: 4 }}>
//                 {title}
//               </Title>
//               <Flexbox
//                 alignment="center"
//                 gap={6}
//                 customStyle={{ marginBottom: 4, flexWrap: 'wrap' }}
//               >
//                 <Typography variant="h4" weight="bold">
//                   {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
//                 </Typography>
// {productLegitStatusText && (
//   <Label
// variant="outline"
// size="xsmall"
//     brandColor="black"
//     text={productLegitStatusText}
//   />
// )}
// {isPopular && (
//   <Label variant="solid" size="xsmall" brandColor="black" text="인기" />
// )}
// {showPriceDown && (
//   <PriceDownLabel>
//     <Icon name="DropdownFilled" />
//     {commaNumber(Math.round(discountedPrice / 10000))}만원
//   </PriceDownLabel>
// )}
//               </Flexbox>
//               {(wishCount > 0 || purchaseCount > 0) && (
//                 <Flexbox gap={6}>
//                   {wishCount > 0 && (
//                     <Flexbox alignment="center" gap={3}>
//                       <Icon name="HeartOutlined" width={14} height={14} color={common.ui60} />
//                       <Typography
//                         variant="small2"
//                         weight="medium"
//                         customStyle={{ color: common.ui60 }}
//                       >
//                         {wishCount}
//                       </Typography>
//                     </Flexbox>
//                   )}
//                   {purchaseCount > 0 && (
//                     <Flexbox alignment="center" gap={3}>
//                       <Icon name="MessageOutlined" width={14} height={14} color={common.ui60} />
//                       <Typography
//                         variant="small2"
//                         weight="medium"
//                         customStyle={{ color: common.ui60 }}
//                       >
//                         {purchaseCount}
//                       </Typography>
//                     </Flexbox>
//                   )}
//                 </Flexbox>
//               )}
//             </Box>
//             <Box
//               onClick={handleClickWish}
//               customStyle={{ padding: '0 10px 10px 10px', marginRight: -10 }}
//             >
//               {iconType === 'heart' && isWish && (
//                 <Icon name="HeartFilled" color={secondary.red.main} size="small" />
//               )}
//               {iconType === 'heart' && !isWish && (
//                 <Icon name="HeartOutlined" color={common.ui80} size="small" />
//               )}
//               {iconType !== 'heart' && (
//                 <Icon
//                   name="CloseOutlined"
//                   width={16}
//                   height={16}
//                   customStyle={{ color: common.ui80 }}
//                 />
//               )}
//             </Box>
//           </Flexbox>
//         </Flexbox>
//         <>
//           {showDuplicateUploadAlert && (
//             <Alert
//               onClick={handleClickAlert}
//               customStyle={{
//                 padding: '10px 20px',
//                 marginTop: -8,
//                 backgroundColor: primary.bgLight
//               }}
//             >
//               <Flexbox alignment="center" gap={20}>
//                 <Typography variant="body2" weight="bold" customStyle={{ color: primary.light }}>
//                   중복
//                 </Typography>
//                 <Typography variant="body2" weight="bold">
//                   판매자가 같은 매물을 다시 올렸어요
//                 </Typography>
//                 <Icon name="CaretRightOutlined" size="small" customStyle={{ marginLeft: 'auto' }} />
//               </Flexbox>
//             </Alert>
//           )}
//           {!showDuplicateUploadAlert && isReRegisterProduct && (
//             <Alert
//               onClick={handleClickAlert}
//               customStyle={{
//                 padding: '10px 20px',
//                 marginTop: -8,
//                 background: common.bg03
//               }}
//             >
//               <Flexbox gap={20} alignment="center">
//                 <Typography
//                   variant="body2"
//                   weight="bold"
//                   customStyle={{ color: secondary.red.main, minWidth: 44 }}
//                 >
//                   가격하락
//                 </Typography>
//                 <Typography variant="body2" weight="bold">
//                   {commaNumber(Math.round(salePrice / 10000))}만원 내려서 다시 올렸어요!
//                 </Typography>
//                 <Icon name="CaretRightOutlined" size="small" customStyle={{ marginLeft: 'auto' }} />
//               </Flexbox>
//             </Alert>
//           )}
//         </>
//       </>
//     );
//   }
// );

// export default ProductWishesCard;
