import { useEffect, useState } from 'react';
import type { MutableRefObject } from 'react';

import { useRouter } from 'next/router';
import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { useQuery } from '@tanstack/react-query';
import {
  BottomSheet,
  Box,
  Button,
  CheckboxGroup,
  Flexbox,
  Icon,
  Typography
} from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

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

import useSession from '@hooks/useSession';
import useProductType from '@hooks/useProductType';

interface ProductOrderConfirmProps {
  paymentWidgetRef: MutableRefObject<PaymentWidgetInstance | null>;
  includeLegit: boolean;
}

function ProductOrderConfirm({ paymentWidgetRef, includeLegit }: ProductOrderConfirmProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const {
    palette: { common }
  } = useTheme();

  const { isLoggedInWithSMS, data: accessUser } = useSession();

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
    queryKeys.orders.productOrder({
      productId,
      isCreated: true,
      includeLegit
    }),
    () =>
      fetchProductOrder({
        productId,
        isCreated: true,
        includeLegit
      }),
    {
      enabled: isLoggedInWithSMS && !!productId,
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

  const [toggle, setToggle] = useState(true);
  const [{ checkedAll, subChecked1, subChecked2, subChecked3 }, setCheckedGroup] = useState<{
    checkedAll: boolean;
    subChecked1: boolean;
    subChecked2: boolean;
    subChecked3: boolean;
  }>({
    checkedAll: false,
    subChecked1: false,
    subChecked2: false,
    subChecked3: false
  });
  const [checked, setChecked] = useState(false);
  const [operatorChecked, setOperatorChecked] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(false);
  const { isAllOperatorProduct } = useProductType(product?.sellerType);

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

  useEffect(() => {
    if (checkedAll) {
      setCheckedGroup({
        checkedAll,
        subChecked1: true,
        subChecked2: true,
        subChecked3: true
      });
    }
  }, [checkedAll]);

  useEffect(() => {
    if (subChecked1 && subChecked2 && subChecked3) {
      setCheckedGroup({
        checkedAll: true,
        subChecked1,
        subChecked2,
        subChecked3
      });
    } else {
      setCheckedGroup((prevState) => ({
        ...prevState,
        checkedAll: false
      }));
    }
  }, [subChecked1, subChecked2, subChecked3]);

  return (
    <>
      <Flexbox
        component="section"
        direction="vertical"
        gap={20}
        customStyle={{
          padding: '32px 20px 20px'
        }}
      >
        <Box>
          <Flexbox
            justifyContent="space-between"
            alignment="center"
            onClick={() => setToggle(!toggle)}
          >
            <CheckboxGroup
              text="개인정보 및 결제 대행 서비스 이용약관 동의"
              size="large"
              onChange={() =>
                setCheckedGroup((prevState) => ({
                  ...prevState,
                  checkedAll: !prevState.checkedAll,
                  subChecked1: prevState.checkedAll ? false : prevState.subChecked1,
                  subChecked2: prevState.checkedAll ? false : prevState.subChecked2,
                  subChecked3: prevState.checkedAll ? false : prevState.subChecked3
                }))
              }
              checked={checkedAll}
              customStyle={{
                gap: 4,
                fontWeight: 700
              }}
            />
            <Icon
              name={toggle ? 'Arrow2DownOutlined' : 'Arrow2UpOutlined'}
              width={20}
              height={20}
            />
          </Flexbox>
          <Flexbox
            direction="vertical"
            customStyle={{
              display: toggle ? 'none' : 'block',
              marginTop: 20
            }}
          >
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{
                padding: '6px 0'
              }}
            >
              <Flexbox
                alignment="center"
                gap={4}
                onClick={() =>
                  setCheckedGroup((prevState) => ({
                    ...prevState,
                    subChecked1: !prevState.subChecked1
                  }))
                }
              >
                <CheckboxCheckOutlinedIcon checked={subChecked1} />
                <Typography variant="body2">결제대행 서비스 이용약관 동의</Typography>
              </Flexbox>
              <Typography
                variant="body2"
                color="ui60"
                onClick={() => setOpenPolicy(true)}
                customStyle={{
                  textDecoration: 'underline'
                }}
              >
                보기
              </Typography>
            </Flexbox>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{
                padding: '6px 0'
              }}
            >
              <Flexbox
                alignment="center"
                gap={4}
                onClick={() =>
                  setCheckedGroup((prevState) => ({
                    ...prevState,
                    subChecked2: !prevState.subChecked2
                  }))
                }
              >
                <CheckboxCheckOutlinedIcon checked={subChecked2} />
                <Typography variant="body2">개인정보 제3자 제공 동의</Typography>
              </Flexbox>
              <Typography
                variant="body2"
                color="ui60"
                onClick={() => setOpenPolicy(true)}
                customStyle={{
                  textDecoration: 'underline'
                }}
              >
                보기
              </Typography>
            </Flexbox>
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{
                padding: '6px 0'
              }}
            >
              <Flexbox
                alignment="center"
                gap={4}
                onClick={() =>
                  setCheckedGroup((prevState) => ({
                    ...prevState,
                    subChecked3: !prevState.subChecked3
                  }))
                }
              >
                <CheckboxCheckOutlinedIcon checked={subChecked3} />
                <Typography variant="body2">개인정보 수집 및 이용 동의</Typography>
              </Flexbox>
              <Typography
                variant="body2"
                color="ui60"
                onClick={() => setOpenPolicy(true)}
                customStyle={{
                  textDecoration: 'underline'
                }}
              >
                보기
              </Typography>
            </Flexbox>
          </Flexbox>
        </Box>
        {accessUser?.snsType === 'sms' && (
          <CheckboxGroup
            text="주문 및 문의내역을 카카오 알림톡으로 받을게요."
            size="large"
            checked={checked}
            onChange={() => setChecked(!checked)}
            customStyle={{
              gap: 4,
              fontWeight: 700
            }}
          />
        )}
        {isAllOperatorProduct && (
          <>
            <CheckboxGroup
              text="결제하시면 즉시 구매대행이 진행되며, 단순 변심이나 실수에 따른 매물의 반품/환불은 불가능합니다. 매물정보를 꼼꼼히 확인해주세요."
              size="large"
              checked={operatorChecked}
              onChange={() => setOperatorChecked((prev) => !prev)}
              customStyle={{
                gap: 4,
                fontWeight: 700,
                alignItems: 'flex-start',
                wordBreak: 'keep-all'
              }}
            />
            <Typography
              customStyle={{ wordBreak: 'keep-all', marginLeft: 24, marginTop: -10 }}
              variant="body2"
              color="ui60"
            >
              본 거래는 개인간 거래로 전자상거래법(제17조)에 따른 청약철회(환불, 교환) 규정이
              적용되지 않습니다. 중고거래의 특성상 결제 전 충분한 사진/정보를 꼼꼼히 확인 후 결제를
              진행해주세요.
            </Typography>
          </>
        )}
        <Button
          variant="solid"
          brandColor="black"
          size="xlarge"
          fullWidth
          onClick={handleClick}
          disabled={
            !checkedAll ||
            (accessUser?.snsType === 'sms' ? !checked : false) ||
            !accessUser ||
            isLoading ||
            isLoadingProduct ||
            !externalId ||
            !name ||
            !totalPrice ||
            !deliveryInfo ||
            status !== 0 ||
            result !== 0 ||
            (isAllOperatorProduct ? !operatorChecked : false)
          }
          customStyle={{
            marginTop: 20
          }}
        >
          {commaNumber(totalPrice)}원 결제하기
        </Button>
        <Typography variant="small2" color="ui60" customStyle={{ wordBreak: 'keep-all' }}>
          (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매 회원과 구매 회원 간의
          상품정보 및 거래에 대해 책임을 지지 않습니다. 또한 상품에 직접 관여하지 않으며, 상품 주문,
          배송 및 환불의 의무와 책임은 각 판매자에게 있습니다.
        </Typography>
      </Flexbox>
      <BottomSheet
        open={openPolicy}
        onClose={() => setOpenPolicy(false)}
        fullScreen
        disableSwipeable
      >
        <Flexbox
          direction="vertical"
          customStyle={{
            height: '100%'
          }}
        >
          <Flexbox
            justifyContent="space-between"
            customStyle={{
              padding: '20px 16px',
              borderBottom: `1px solid ${common.line01}`
            }}
          >
            <Typography variant="h3" weight="bold">
              결제대행 서비스 이용약관 동의
            </Typography>
            <Icon name="CloseOutlined" onClick={() => setOpenPolicy(false)} />
          </Flexbox>
          <Flexbox
            direction="vertical"
            gap={8}
            customStyle={{
              flexGrow: 1,
              padding: '20px 20px 0'
            }}
          >
            <Typography color="ui60">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              가. "개인정보"라 함은 생존하는 개인에 관한 정보로서 성명/휴대폰번호 등에 의하여 특정한
              개인을 알아볼 수 있는 부호/문자/음성/음향 및 영상 등의 정보(해당 정보만으로는 특정
              개인을 알아볼 수 없어도 다른 정보와 쉽게 결합하여 알아볼 수 있는 경우는 그 정보를
              포함)를 말합니다.
            </Typography>
            <Typography color="ui60">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              나. "이용자"라 함은 미스터카멜에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는
              회원 및 비회원을 말합니다.
            </Typography>
            <Typography color="ui60">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              다. "회원"이라 함은 회사에 개인정보를 제공하여 회원등록을 한 자를 말합니다.
            </Typography>
            <Typography color="ui60">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              라. "비회원"이라 함은 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를
              말합니다.
            </Typography>
          </Flexbox>
          <Box
            customStyle={{
              padding: '20px'
            }}
          >
            <Button
              variant="solid"
              brandColor="black"
              size="xlarge"
              fullWidth
              onClick={() => setOpenPolicy(false)}
            >
              확인
            </Button>
          </Box>
        </Flexbox>
      </BottomSheet>
    </>
  );
}

// TODO UI 라이브러리 추가
function CheckboxCheckOutlinedIcon({ checked }: { checked?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="checkbox-check-outlined">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.29297 11.2072L7.70718 9.79297L11.0001 13.0859L16.293 7.79297L17.7072 9.20718L11.0001 15.9143L6.29297 11.2072Z"
          fill={checked ? '#425BFF' : '#C6C7CC'}
        />
      </g>
    </svg>
  );
}

export default ProductOrderConfirm;
