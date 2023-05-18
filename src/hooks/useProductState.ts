import { useRouter } from 'next/router';

import type { Product, ProductDetail } from '@dto/product';

import { productStatusCode } from '@constants/product';

import { checkAgent } from '@utils/common';

import useProductType from './useProductType';

function useProductState({
  productDetail,
  product
}: {
  productDetail?: ProductDetail;
  product?: Product;
}) {
  const { isChannelProduct, isAllOperatorProduct, isOperatorB2CProduct, isOperatorC2CProduct } =
    useProductType(product?.sellerType);

  const price = product?.price || 0;
  const targetProductPrice = product?.targetProductPrice; // 재 등록된 매물의 가격
  const targetProductStatus = product?.targetProductStatus;
  const targetProductId = product?.targetProductId; // 재 등록된 매물의 아이디
  const productSeller = product?.productSeller;
  const status = product?.status;

  const {
    query: { chainPrice }
  } = useRouter();

  let isDuplicate = targetProductStatus === 0;
  let isPriceDown = targetProductPrice ? targetProductPrice < price : false;

  // 기존에 쓰던 sale 은 판매 / 할인 이라는 두가지 뜻을 갖고 있음
  // sale 을 쓰려면 on sale 의 전치사가 붙어야 우리가 아는 할인 이라는 뜻
  // 좀더 명확한 의미 전달을 위해 discounted 라는 단어를 사용
  // 판매는 forSale 할인은 discount 사용
  let discountedPrice =
    isDuplicate && targetProductId && isPriceDown && targetProductPrice
      ? price - targetProductPrice
      : 0;

  let isTargetProduct = !!targetProductId;
  const isReRegisterProduct = isDuplicate && !!targetProductId;
  const isAdminBlockedUser = productSeller?.type === 1;
  const isDiscountCrm = discountedPrice >= 1;
  const isAlreadyOrder = productDetail?.hasOrder;
  const isBlockedUser = productDetail?.blockUser;

  if (discountedPrice < 1) {
    isPriceDown = false;
  }

  if (chainPrice) {
    // chainPrice 이거 뭔지 모르겠음...
    discountedPrice = Number(chainPrice) - (price || 0);
    isDuplicate = false;
    isTargetProduct = false;
    isPriceDown = false;
  }

  const isReservation = productStatusCode.reservation === status;
  const isHidden = productStatusCode.hidden === status;
  const isForSale = productStatusCode.forSale === status;
  const isDeleted = productStatusCode.deleted === status;
  const isSoldOut =
    productStatusCode.soldOut === status ||
    (!isForSale && !isReservation && !isHidden && targetProductStatus !== 0);

  const isViewReservationState = !isReservation && !isHidden;
  const isMowebSoldout = checkAgent.isMobileWeb() && !isReRegisterProduct && isSoldOut;
  const isDisabledState =
    (!isDuplicate || !isTargetProduct) &&
    (isAdminBlockedUser || isBlockedUser || isHidden || isSoldOut || isDeleted || !product);

  const isPriceOfferStatus = productDetail?.offers.filter((offer) =>
    [1, 2, 4].includes(offer.status)
  );
  const isSafePayment = isChannelProduct || isAllOperatorProduct;
  const isPriceOffer = !!(
    !!productDetail?.offers &&
    isPriceOfferStatus &&
    isPriceOfferStatus.length < 3 &&
    (isSafePayment || !isOperatorB2CProduct) &&
    !isBlockedUser &&
    !isAdminBlockedUser &&
    !isOperatorB2CProduct &&
    !isOperatorC2CProduct
  );

  // 여기서 만단위 절삭한 금액을 바로 적용하기 보다는 해당 값을 가져다 쓰는곳에서 판단해서 getTenThousandUnitPrice 를 사용할지 말지 결정

  return {
    isDuplicate,
    isPriceDown,
    isReRegisterProduct,
    isBlockedUser,
    isAdminBlockedUser,
    isTargetProduct,
    isReservation,
    isHidden,
    isForSale,
    isDeleted,
    isSoldOut,
    isMowebSoldout,
    isViewReservationState,
    isDiscountCrm,
    isAlreadyOrder,
    isSafePayment,
    isPriceOffer,
    isDisabledState,
    discountedPrice
  };
}

export default useProductState;
