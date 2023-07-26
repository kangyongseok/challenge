import type { GetServerSidePropsContext } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  OrdersDetailCancelDialog,
  OrdersDetailCancelInfo,
  OrdersDetailCancelRequestApproveDialog,
  OrdersDetailCancelRequestDialog,
  OrdersDetailCancelRequestRefuseDialog,
  OrdersDetailCancelRequestWithdrawDialog,
  OrdersDetailDeliveryCompleteConfirmDialog,
  OrdersDetailDeliveryInfo,
  OrdersDetailDeliveryStatusFrame,
  OrdersDetailEmptyInvoiceNumberDialog,
  OrdersDetailFooter,
  OrdersDetailHeader,
  OrdersDetailInvoiceNumberDialog,
  OrdersDetailPaymentInfo,
  OrdersDetailPolicy,
  OrdersDetailProductInfo,
  OrdersDetailPurchaseConfirmDialog,
  OrdersDetailRefundInfo,
  OrdersDetailSalesApproveDialog,
  OrdersDetailSalesCancelDialog,
  OrdersDetailSettleInfo,
  OrdersDetailStatus,
  OrdersDetailTransactionInfo
} from '@components/pages/ordersDetail';

import Initializer from '@library/initializer';

import { fetchOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

function OrdersDetail() {
  return (
    <>
      <GeneralTemplate
        header={<OrdersDetailHeader />}
        footer={<OrdersDetailFooter />}
        disablePadding
      >
        <OrdersDetailStatus />
        <OrdersDetailProductInfo />
        <OrdersDetailPaymentInfo />
        <OrdersDetailRefundInfo />
        <OrdersDetailSettleInfo />
        <OrdersDetailDeliveryInfo />
        <OrdersDetailCancelInfo />
        <OrdersDetailTransactionInfo />
        <OrdersDetailPolicy />
      </GeneralTemplate>
      <OrdersDetailSalesApproveDialog />
      <OrdersDetailInvoiceNumberDialog />
      <OrdersDetailPurchaseConfirmDialog />
      <OrdersDetailCancelDialog />
      <OrdersDetailCancelRequestDialog />
      <OrdersDetailCancelRequestApproveDialog />
      <OrdersDetailCancelRequestWithdrawDialog />
      <OrdersDetailSalesCancelDialog />
      <OrdersDetailEmptyInvoiceNumberDialog />
      <OrdersDetailCancelRequestRefuseDialog />
      <OrdersDetailDeliveryStatusFrame />
      <OrdersDetailDeliveryCompleteConfirmDialog />
    </>
  );
}

export async function getServerSideProps({ req, query: { id } }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  const queryClient = new QueryClient();

  try {
    await queryClient.fetchQuery(queryKeys.orders.order(Number(id)), () => fetchOrder(Number(id)));
  } catch {
    return {
      notFound: true
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      accessUser: getAccessUserByCookies(getCookies({ req }))
    }
  };
}

export default OrdersDetail;
