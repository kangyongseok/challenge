import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  BottomSheet,
  Box,
  Button,
  Flexbox,
  Icon,
  Image,
  Typography
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  OrderBeforeApproval,
  OrderInvoiceNumberDialog,
  OrderPaymentInfo,
  OrderProductCard,
  OrderProductCardSkeleton,
  OrderRefuseDialog,
  OrderSingleAcceptDialog,
  OrderSingleButtonGroup
} from '@components/pages/order';
import LogoutDialog from '@components/pages/mypage/LogoutDialog';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import { fetchUserAccounts } from '@api/user';
import { fetchProduct } from '@api/product';
import { fetchOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';
import { orderResult, orderStatus } from '@constants/order';
import { ACCESS_USER } from '@constants/localStorage';

import { getImagePathStaticParser } from '@utils/common';

import { loginBottomSheetState } from '@recoil/common';

function OrderSingle() {
  const { query, replace } = useRouter();
  const [openInvoiceDialog, setInvoiceDialog] = useState(false);
  const [openSafePaymentBanner, setSafePaymentBanner] = useState(false);
  const [openProfile, setProfile] = useState(false);
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
  const [isApproval, setApproval] = useState(false);
  const [logoutToggle, setLogoutToggle] = useState(false);

  const [isDelivery, setDelivery] = useState(false);
  const [isReturned] = useState(false);
  const [isReturning] = useState(false);
  const [isCalculated, setCalculated] = useState(false);
  const [isNotApproval, setNotApproval] = useState(false);
  const [isSaveApprovalState, setSaveApprovalState] = useState(false);

  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);

  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);

  const { data: userAccounts = [] } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: !!accessUser
    }
  );

  const {
    data: {
      orderDetails = [],
      price,
      totalPrice,
      id,
      dateExpired,
      firstProductId,
      status = 0,
      result,
      orderDelivery
    } = {},
    isLoading
  } = useQuery(queryKeys.orders.order(Number(query.id)), () => fetchOrder(Number(query.id)), {
    enabled: !!query.id
  });

  const { data: { product } = {} } = useQuery(
    queryKeys.products.product({ productId: firstProductId || 0 }),
    () => fetchProduct({ productId: firstProductId || 0 }),
    {
      enabled: !!firstProductId
    }
  );

  const isLoginAccountUser = !!accessUser && userAccounts.length !== 0;
  const isHideButtonGroup = isCalculated || isNotApproval || isReturning || isReturned;

  useEffect(() => {
    if (status === orderStatus.calculate && result === orderResult.success) {
      setCalculated(true);
    }

    if (status === orderStatus.refund && result === orderResult.wait) {
      setNotApproval(true);
      setApproval(false);
    }

    if (status > orderStatus.payment && status !== orderStatus.refund) {
      setApproval(true);
      setSaveApprovalState(true);
    }

    if (status === orderStatus.delivery && result === orderResult.process) {
      setDelivery(true);
    }
  }, [result, status]);

  const handleClickProfile = () => {
    setProfile(true);
  };

  const paymentDetailState = () => {
    if (!accessUser && isSaveApprovalState) {
      return {
        title: (
          <Typography weight="bold" variant="h2">
            로그인 후<br /> 주문확인이 가능합니다.
          </Typography>
        ),
        subTitle: ''
      };
    }

    if (isReturned) {
      return {
        title: (
          <Typography weight="bold" variant="h2">
            반품완료
          </Typography>
        ),
        subTitle: ''
      };
    }
    if (isReturning) {
      return {
        title: (
          <Typography weight="bold" variant="h2">
            반품중
          </Typography>
        ),
        subTitle: ''
      };
    }
    if (isCalculated) {
      return {
        title: (
          <Typography weight="bold" variant="h2">
            정산완료
          </Typography>
        ),
        subTitle: (
          <Typography customStyle={{ marginTop: 8 }} color="ui60">
            정산계좌로 판매대금이 입금되었어요.
          </Typography>
        )
      };
    }
    if (isDelivery) {
      return {
        title: (
          <Typography weight="bold" variant="h2">
            배송중
          </Typography>
        ),
        subTitle: (
          <Typography customStyle={{ marginTop: 8 }} color="ui60">
            상품의 배송이 시작되었어요.
          </Typography>
        )
      };
    }
    if (isApproval) {
      return {
        title: (
          <Typography weight="bold" variant="h2">
            안전결제 요청 수락
          </Typography>
        ),
        subTitle: (
          <Typography customStyle={{ marginTop: 8 }} color="ui60">
            택배를 보낸 뒤 송장번호를 입력해주세요.
          </Typography>
        )
      };
    }

    if (isNotApproval) {
      return {
        title: (
          <Typography weight="bold" variant="h2">
            안전결제 요청 거절
          </Typography>
        ),
        subTitle: ''
      };
    }

    return {
      title: (
        <Typography weight="bold" variant="h2">
          안전결제 요청
        </Typography>
      ),
      subTitle: (
        <Typography customStyle={{ marginTop: 8 }} color="ui60">
          판매자님의 매물에 안전결제 요청이 도착했어요.
          <br />
          {dayjs(dateExpired).format('M월 D일(ddd)')}까지 결제요청을 수락해주세요.
        </Typography>
      )
    };
  };

  return (
    <>
      <GeneralTemplate
        hideAppDownloadBanner
        header={
          <Flexbox alignment="center" customStyle={{ minHeight: 56, padding: '0 20px' }} gap={3}>
            <Icon name="LogoText_96_20" height={13} width={70} />
            <SafePaymentText />
            {accessUser && !isLoading && (
              <Flexbox
                alignment="center"
                customStyle={{ marginLeft: 'auto' }}
                gap={5}
                onClick={handleClickProfile}
              >
                <Avatar
                  src={getImagePathStaticParser(accessUser.image)}
                  alt="Profile Image"
                  round="50%"
                />
                <Icon name="DropdownFilled" size="large" customStyle={{ marginRight: -15 }} />
              </Flexbox>
            )}
            {!accessUser && !isLoading && (
              <Button
                variant="ghost"
                brandColor="black"
                customStyle={{ marginLeft: 'auto' }}
                onClick={() => setLoginBottomSheet({ open: true, returnUrl: '' })}
              >
                로그인
              </Button>
            )}
          </Flexbox>
        }
        footer={
          <Flexbox direction="vertical" gap={12} customStyle={{ padding: 20 }}>
            <Typography color="ui60" variant="body2">
              (주)미스터카멜은 통신판매중개자로서 거래 당사자가 아니며, 판매자가 등록한 상품정보 및
              거래에 대해 책임을 지지 않습니다.
            </Typography>
          </Flexbox>
        }
      >
        <Box customStyle={{ paddingTop: 32 }}>
          {paymentDetailState().title}
          {paymentDetailState().subTitle}
          <Box customStyle={{ height: 32 }} />
          {isLoading ? (
            <OrderProductCardSkeleton />
          ) : (
            <OrderProductCard
              product={product}
              orderDetail={orderDetails[0]}
              platform={{
                id:
                  (product?.siteUrl.hasImage && product?.siteUrl.id) ||
                  (product?.site.hasImage && product?.site.id) ||
                  0,
                name: product?.siteUrl.name || ''
              }}
            />
          )}
          {!isHideButtonGroup && (
            <OrderSingleButtonGroup
              isApproval={isApproval}
              setOpenAcceptDialog={setOpenAcceptDialog}
              setInvoiceDialog={setInvoiceDialog}
              isLoginAccountUser={isLoginAccountUser}
              isDelivery={isDelivery}
              isViewLogin={!accessUser && isSaveApprovalState}
            />
          )}
          {accessUser && !isLoading && (isApproval || isNotApproval) && (
            <BannerWrap onClick={() => setSafePaymentBanner(true)}>
              <Image
                disableAspectRatio
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/order/camel_safe_payment_banner.png`}
                alt="카멜 안전결제 알아보기"
              />
            </BannerWrap>
          )}
        </Box>
        <Gap />
        {accessUser && (isApproval || isNotApproval) ? (
          <OrderPaymentInfo
            price={price}
            totalPrice={totalPrice}
            id={id}
            dateExpired={dateExpired}
            userAccounts={userAccounts}
            isDelivery={isDelivery}
            isReturn={isReturned || isReturning}
            isNotApproval={isNotApproval}
            orderDelivery={orderDelivery}
          />
        ) : (
          <OrderBeforeApproval />
        )}
      </GeneralTemplate>

      <OrderInvoiceNumberDialog open={openInvoiceDialog} setInvoiceDialog={setInvoiceDialog} />
      <OrderRefuseDialog orderId={id} />
      <OrderSingleAcceptDialog
        open={openAcceptDialog}
        setOpenAcceptDialog={setOpenAcceptDialog}
        setApproval={setApproval}
      />
      <BottomSheet
        open={openSafePaymentBanner}
        onClose={() => setSafePaymentBanner(false)}
        disableSwipeable
        customStyle={{ padding: '0 20px' }}
      >
        <OrderBeforeApproval isBottomSheet setSafePaymentBanner={setSafePaymentBanner} />
      </BottomSheet>
      <BottomSheet
        open={openProfile}
        onClose={() => setProfile(false)}
        disableSwipeable
        customStyle={{ padding: '32px 20px 20px' }}
      >
        <Flexbox gap={34} alignment="center" justifyContent="center" direction="vertical">
          <Typography variant="h3" onClick={() => replace('/')}>
            중고거래 플랫폼 카멜로 이동하기
          </Typography>
          <Typography
            variant="h3"
            color="red-light"
            onClick={() => {
              setLogoutToggle(true);
              setProfile(false);
            }}
          >
            로그아웃
          </Typography>
          <Button
            fullWidth
            size="xlarge"
            onClick={() => setProfile(false)}
            brandColor="black"
            variant="ghost"
          >
            취소
          </Button>
        </Flexbox>
      </BottomSheet>
      <LogoutDialog status={logoutToggle} setLogoutToggle={setLogoutToggle} />
    </>
  );
}

const Gap = styled.div`
  height: 8px;
  width: calc(100% + 40px);
  margin-left: -20px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
`;

const BannerWrap = styled.div`
  background: #313438;
  margin-left: -20px;
  width: calc(100% + 40px);
  padding: 0 27px;
  margin-top: 32px;
  border-top: 8px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui95};
`;

function SafePaymentText() {
  return (
    <svg width="63" height="17" viewBox="0 0 63 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.447 0.808H11.288V12.555H13.447V6.537H15.759V4.565H13.447V0.808ZM9.197 5.551C9.197 2.542 7.276 1.148 4.913 1.148C2.516 1.148 0.612 2.542 0.612 5.551V5.806C0.612 8.781 2.516 10.175 4.913 10.175C7.276 10.175 9.197 8.781 9.197 5.806V5.551ZM2.788 5.551C2.788 3.851 3.74 3.052 4.913 3.052C6.052 3.052 7.021 3.851 7.021 5.551V5.789C7.021 7.489 6.052 8.271 4.913 8.271C3.74 8.271 2.788 7.489 2.788 5.789V5.551ZM3.009 11.552V16.686H14.195V14.714H5.185V11.552H3.009ZM25.3511 6.639H28.1221V12.555H30.2981V0.808H28.1221V4.786H25.3511V6.639ZM25.3171 10.6L26.5241 8.9L22.2911 5.755C22.5121 5.041 22.6311 4.293 22.6311 3.494H25.9291V1.573H17.2761V3.494H20.5061C20.4891 5.704 19.3501 7.421 16.6471 9.189L17.7861 10.855C19.4011 9.869 20.5911 8.798 21.3901 7.608L25.3171 10.6ZM21.6961 11.552H19.5201V16.686H30.8761V14.714H21.6961V11.552ZM44.0722 4.514V5.772H40.8762V7.506H44.0722V8.543H46.2482V0.808H44.0722V2.797H41.2332C41.2502 2.661 41.2502 2.508 41.2502 2.372V1.488H33.5492V3.409H39.0572C38.7002 4.871 36.6772 6.197 33.1242 7.047L33.8552 8.985C37.4252 8.101 39.9072 6.741 40.8422 4.514H44.0722ZM37.6462 13.898H46.2482V9.41H35.4022V11.178H44.0722V12.147H35.4872V16.771H46.7582V14.952H37.6462V13.898ZM60.3624 16.686H62.4704V0.808H60.3624V16.686ZM54.6674 6.384V8.356H56.9114V16.312H58.9684V1.063H56.9114V6.384H54.6674ZM53.1884 3.97H55.7384V1.981H48.7854V3.97H51.2164V4.616C51.2164 7.88 50.2474 10.566 48.2074 13.303L49.8564 14.561C50.8254 13.252 51.5734 11.892 52.1174 10.481L54.5654 14.391L56.2484 13.235L52.8994 7.761C53.0864 6.741 53.1884 5.687 53.1884 4.616V3.97Z"
        fill="#7B7D85"
      />
    </svg>
  );
}

export default OrderSingle;
