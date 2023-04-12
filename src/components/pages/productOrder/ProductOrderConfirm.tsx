import { useState } from 'react';
import type { MutableRefObject } from 'react';

import { useRouter } from 'next/router';
import { Button, CheckboxGroup, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { useQuery } from '@tanstack/react-query';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';
import { fetchProductOrder } from '@api/order';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { commaNumber } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductOrderConfirmProps {
  paymentWidgetRef: MutableRefObject<PaymentWidgetInstance | null>;
}

function ProductOrderConfirm({ paymentWidgetRef }: ProductOrderConfirmProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const {
    data,
    data: {
      id: orderId,
      externalId = '',
      name = '',
      totalPrice = 0,
      deliveryInfo,
      status,
      result
    } = {},
    isLoading
  } = useQuery(
    queryKeys.orders.productOrder({ productId, isCreated: true }),
    () => fetchProductOrder({ productId, isCreated: true }),
    {
      enabled: !!accessUser && !!productId,
      refetchOnMount: true
    }
  );

  const { data: { product } = {}, isLoading: isLoadingProduct } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      refetchOnMount: true,
      enabled: !!productId
    }
  );

  const [checked, setChecked] = useState(false);

  const handleClick = () => {
    const { source } =
      SessionStorage.get<{ source?: string }>(
        sessionStorageKeys.productDetailOrderEventProperties
      ) || {};

    logEvent(attrKeys.productOrder.CLICK_ORDER_PAYMENT, {
      name: attrProperty.name.ORDER_PAYMENT,
      title: attrProperty.title.PAYMENT,
      data: {
        product: {
          id: product?.id,
          brand: product?.brand?.name,
          category: product?.category?.name,
          parentId: product?.category?.parentId,
          parentCategory:
            FIRST_CATEGORIES[product?.category?.parentId as keyof typeof FIRST_CATEGORIES],
          line: product?.line,
          price: product?.price,
          site: product?.site?.name,
          cluster: product?.cluster,
          scoreTotal: product?.scoreTotal,
          scoreStatus: product?.scoreStatus,
          scoreSeller: product?.scoreSeller,
          scorePrice: product?.scorePrice,
          scorePriceAvg: product?.scorePriceAvg,
          scorePriceCount: product?.scorePriceCount,
          scorePriceRate: product?.scorePriceRate,
          imageCount: product?.imageCount,
          isProductLegit: product?.isProductLegit,
          productType: getProductType(
            product?.productSeller?.site?.id,
            product?.productSeller?.type
          ),
          sellerType: product?.sellerType,
          productSellerId: product?.productSeller?.id,
          productSellerType: product?.productSeller?.type,
          productSellerAccount: product?.productSeller?.account
        },
        order: data
      },
      source
    });

    paymentWidgetRef.current?.requestPayment({
      orderId: externalId,
      orderName: name,
      successUrl: `${window.location.href}/success?camelOrderId=${orderId}`,
      failUrl: `${window.location.href}/fail`,
      customerName: deliveryInfo?.name,
      customerMobilePhone: deliveryInfo?.phone,
      customerEmail: accessUser?.email || undefined,
      useEscrow: false
    });
  };

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={20}
      customStyle={{
        padding: 20
      }}
    >
      <CheckboxGroup
        text="개인정보 제3자 제공 동의와 결제대행 서비스 이용약관에 동의합니다."
        size="large"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <Button
        variant="solid"
        brandColor="black"
        size="xlarge"
        fullWidth
        onClick={handleClick}
        disabled={
          !checked ||
          !accessUser ||
          isLoading ||
          isLoadingProduct ||
          !externalId ||
          !name ||
          !totalPrice ||
          !deliveryInfo ||
          status !== 0 ||
          result !== 0
        }
      >
        {commaNumber(totalPrice)}원 결제하기
      </Button>
      <Typography
        variant="body2"
        customStyle={{
          color: common.ui60
        }}
      >
        (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매자가 등록한 상품정보 및 거래에
        대해 책임을 지지 않습니다.
      </Typography>
    </Flexbox>
  );
}

export default ProductOrderConfirm;
