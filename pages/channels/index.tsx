import { useCallback, useMemo } from 'react';

import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Typography } from 'mrcamel-ui';

import { BottomNavigation, FixedProductInfo, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ChannelsFilteredMessagesPanel,
  ChannelsMessagesPanel,
  ChannelsTabs
} from '@components/pages/channels';
import { ChannelProductStatusBottomSheet } from '@components/pages/channel';

import SessionStorage from '@library/sessionStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { locales } from '@constants/common';
import { channelType } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductDetailUrl } from '@utils/common';
import { getLogEventTitle } from '@utils/channel';

import useRedirectVC from '@hooks/useRedirectVC';

const labels = Object.entries(channelType).map(([key, value]) => ({ key, value }));

function Channels() {
  const router = useRouter();
  useRedirectVC('/channels');

  const { type, productId, isSelectTargetUser } = useMemo(
    () => ({
      type: Number(router.query.type || labels[0].key) as keyof typeof channelType,
      productId: Number(router.query.productId || 0),
      isSelectTargetUser: Boolean(router.query.isSelectTargetUser)
    }),
    [router.query.isSelectTargetUser, router.query.productId, router.query.type]
  );

  const {
    data: { product, noSellerReviewAndHasTarget } = {},
    isLoading,
    refetch
  } = useQuery(queryKeys.products.product({ productId }), () => fetchProduct({ productId }), {
    enabled: !!productId
  });

  const handleClickProduct = useCallback(() => {
    if (!product || product.isDeleted) return;

    SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
      source: attrProperty.source.CHANNEL
    });

    router.push(getProductDetailUrl({ product }));
  }, [product, router]);

  return (
    <GeneralTemplate
      header={
        <Header showLeft={!!productId}>
          <Typography variant="h3" weight="bold">
            {isSelectTargetUser ? '거래자 선택' : '채팅'}
          </Typography>
        </Header>
      }
      footer={<BottomNavigation />}
      disablePadding
      subset
    >
      {productId ? (
        <>
          <FixedProductInfo
            isLoading={isLoading}
            isEditableProductStatus={!isSelectTargetUser}
            isChannel={false}
            image={product?.imageThumbnail || product?.imageMain || ''}
            status={product?.status || 0}
            title={product?.title || ''}
            price={product?.price || 0}
            onClick={handleClickProduct}
            onClickStatus={() =>
              logEvent(attrKeys.channel.CLICK_PRODUCT_MANAGE, {
                name: attrProperty.name.MY_STORE,
                title: getLogEventTitle(product?.status || 0)
              })
            }
          />
          <ChannelsMessagesPanel
            type={1}
            productId={productId}
            isSelectTargetUser={isSelectTargetUser}
          />
          {!!product && (
            <ChannelProductStatusBottomSheet
              id={product.id}
              status={product.status}
              isNoSellerReviewAndHasTarget={noSellerReviewAndHasTarget || false}
              isChannel={false}
              onSuccessProductUpdateStatus={refetch}
            />
          )}
        </>
      ) : (
        <>
          <ChannelsTabs labels={labels} value={type.toString()} />
          {type === +labels[0].key && <ChannelsMessagesPanel type={0} />}
          {type === +labels[1].key && <ChannelsFilteredMessagesPanel />}
          {type === +labels[2].key && <ChannelsMessagesPanel type={2} />}
        </>
      )}
    </GeneralTemplate>
  );
}

export async function getServerSideProps({
  req,
  locale,
  query: { productId, channelId },
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  if (channelId) {
    return {
      redirect: {
        destination: `/channels/${channelId}`,
        permanent: false
      }
    };
  }

  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (!accessUser) {
    return {
      redirect: {
        destination: `/login?returnUrl=/channels&isRequiredLogin=true${
          productId ? `&productId=${productId}` : ''
        }`,
        permanent: false
      }
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Channels;
