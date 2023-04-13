import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Chip, Flexbox, Icon } from 'mrcamel-ui';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import styled from '@emotion/styled';

import SelectTargetUserBottomSheet from '@components/UI/organisms/SelectTargetUserBottomSheet';
import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';
import FixedProductInfo from '@components/UI/molecules/FixedProductInfo';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ChannelAppointmentBanner,
  ChannelBottomActionButtons,
  ChannelCamelAuthFixBanner,
  ChannelHeader,
  ChannelMessageInput,
  ChannelMessages,
  ChannelMoreMenuBottomSheet,
  ChannelProductStatusBottomSheet,
  ChannelPurchaseConfirmDialog,
  ChannelSafePaymentGuideBanner,
  ChannelSafePaymentGuideDialog,
  ChannelSaleRequestRefuseDialog
} from '@components/pages/channel';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchChannel } from '@api/channel';

import { channelUserType, productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import {
  IOS_SAFE_AREA_BOTTOM,
  MESSAGE_INPUT_HEIGHT,
  MESSAGE_NEW_MESSAGE_NOTIFICATION_HEIGHT
} from '@constants/common';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import {
  checkAgent,
  getProductDetailUrl,
  hasImageFile,
  isExtendedLayoutIOSVersion
} from '@utils/common';
import { getLogEventTitle } from '@utils/channel';

import { dialogState } from '@recoil/common';
import {
  channelBottomSheetStateFamily,
  channelPushPageState,
  channelThumbnailMessageImageState
} from '@recoil/channel';
import useViewportUnitsTrick from '@hooks/useViewportUnitsTrick';
import useMutationSendMessage from '@hooks/useMutationSendMessage';
import useChannel from '@hooks/useChannel';

function Chanel() {
  const router = useRouter();

  useViewportUnitsTrick();

  const [isIOSApp, setIsIOSApp] = useState(false);

  const [channelThumbnailMessageImage, setChannelThumbnailMessageImage] = useRecoilState(
    channelThumbnailMessageImageState
  );
  const setChannelPushPageState = useSetRecoilState(channelPushPageState);
  const resetDialogState = useResetRecoilState(dialogState);
  const resetMoreBottomSheetState = useResetRecoilState(channelBottomSheetStateFamily('more'));
  const resetProductStatusBottomSheetState = useResetRecoilState(
    channelBottomSheetStateFamily('productStatus')
  );

  const messagesRef = useRef<HTMLDivElement>(null);
  const {
    useQueryChannel,
    useQueryChannel: {
      data: {
        channel,
        product,
        orders = [],
        offers = [],
        channelUser,
        channelTargetUser,
        userReview,
        targetUserReview,
        lastMessageManage,
        isTargetUserNoti
      } = {},
      isLoading,
      isFetched,
      refetch
    },
    channelData: {
      userName,
      isSeller,
      appointment,
      showAppointmentBanner,
      targetUserId,
      targetUserName,
      isTargetUserBlocked,
      isDeletedTargetUser,
      isDeletedProduct,
      isCamelAdminUser,
      productId,
      productStatus
    },
    sendbirdChannel,
    messages,
    hasMorePrev,
    fetchPrevMessages,
    updateNewMessage
  } = useChannel(messagesRef);
  const { mutate: mutateSendMessage } = useMutationSendMessage({
    lastMessageIndex: messages.length + 1
  });

  const isAdminBlockUser = product?.productSeller?.type === 1 && !isSeller;

  const [isFocused, setIsFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageInputHeight, setMessageInputHeight] = useState(MESSAGE_INPUT_HEIGHT);
  const { showMessageInput, showActionButtons } = useMemo(
    () => ({
      showMessageInput:
        (!checkAgent.isIOSApp() && isFetched) ||
        isTargetUserBlocked ||
        isDeletedTargetUser ||
        isCamelAdminUser,
      showActionButtons:
        !isDeletedTargetUser && !isTargetUserBlocked && !isCamelAdminUser && !isAdminBlockUser
    }),
    [isCamelAdminUser, isDeletedTargetUser, isFetched, isTargetUserBlocked, isAdminBlockUser]
  );

  const isExternalPlatform = product?.sellerType === productSellerType.externalPlatform;

  const routingRef = useRef(false);

  const scrollToBottom = useCallback((behavior?: ScrollBehavior) => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior
    });
  }, []);

  const handleClickProduct = useCallback(() => {
    if (!product || isDeletedProduct || routingRef.current) return;

    routingRef.current = true;

    const pathname = getProductDetailUrl({ type: 'productResult', product });

    SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
      source: attrProperty.source.CHANNEL_DETAIL
    });

    if (checkAgent.isIOSApp()) {
      setChannelPushPageState('product');
      window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
        JSON.stringify({
          pathname,
          redirectChannelUrl: router.asPath
        })
      );
      return;
    }

    router.push(pathname);
  }, [isDeletedProduct, product, router, setChannelPushPageState]);

  const handleClickSafePayment = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      logEvent(attrKeys.channel.CLICK_PURCHASE, {
        name: attrProperty.name.CHANNEL_DETAIL,
        att: 'ORDER'
      });
      logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
        name: attrProperty.name.CHANNEL_DETAIL,
        title: attrProperty.title.PAYMENT_WAIT,
        data: {
          ...product
        }
      });

      if (!product || isDeletedProduct || routingRef.current) return;

      e.stopPropagation();

      routingRef.current = true;

      const pathname = `${getProductDetailUrl({
        product: product as ProductResult,
        type: 'productResult'
      })}/order`;

      SessionStorage.set(sessionStorageKeys.productDetailOrderEventProperties, {
        source: 'CHANNEL_DETAIL'
      });

      if (checkAgent.isIOSApp()) {
        setChannelPushPageState('order');
        window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
          JSON.stringify({
            pathname,
            redirectChannelUrl: router.asPath
          })
        );
        return;
      }

      router.push(pathname);
    },
    [isDeletedProduct, product, router, setChannelPushPageState]
  );

  const handleClickOfferSafePayment = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      logEvent(attrKeys.channel.CLICK_PURCHASE, {
        name: attrProperty.name.CHANNEL_DETAIL,
        att: 'ORDER'
      });
      logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
        name: attrProperty.name.CHANNEL_DETAIL,
        title: attrProperty.title.PAYMENT_WAIT,
        data: {
          ...product
        }
      });

      if (!product || isDeletedProduct || routingRef.current) return;

      e.stopPropagation();

      routingRef.current = true;

      const pathname = `${getProductDetailUrl({
        product: product as ProductResult,
        type: 'productResult'
      })}/order`;

      if (checkAgent.isIOSApp()) {
        setChannelPushPageState('offer');
        window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
          JSON.stringify({
            pathname,
            redirectChannelUrl: router.asPath
          })
        );
        return;
      }

      router.push(pathname);
    },
    [isDeletedProduct, product, router, setChannelPushPageState]
  );

  const handleClickUnreadCount = useCallback(async () => {
    setUnreadCount(0);

    if (messagesRef.current?.scrollTop)
      messagesRef.current.scrollTop =
        messagesRef.current.scrollHeight - messagesRef.current.offsetHeight;

    try {
      await sendbirdChannel?.markAsRead();
    } catch {
      //
    }
  }, [sendbirdChannel]);

  const handleCloseImageDetailDialog = useCallback(() => {
    setChannelThumbnailMessageImage('');

    if (checkAgent.isIOSApp()) window.webkit?.messageHandlers?.callInputShow?.postMessage?.(0);
  }, [setChannelThumbnailMessageImage]);

  useEffect(() => {
    document.body.classList.add('channel-body');
    if (checkAgent.isIOSApp() && !isCamelAdminUser) {
      window.webkit?.messageHandlers?.callInputShow?.postMessage?.(0);
    }

    return () => {
      document.body.classList.remove('channel-body');
      setChannelThumbnailMessageImage('');
      resetDialogState();
      resetProductStatusBottomSheetState();
      resetMoreBottomSheetState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof channelUser?.type === 'number') {
      const adminUser = channel?.userId === 100;
      const getUserType = channelUserType[channelUser.type];
      const attParser = () => {
        if (adminUser) return 'ADMIN';
        if (getUserType === channelUserType[1]) return 'SELLER';
        return 'BUYER';
      };

      logEvent(attrKeys.channel.VIEW_CHANNEL_DETAIL, {
        att: attParser(),
        id: product?.id,
        brand: product?.brand?.name,
        category: product?.category?.name,
        parentCategory: FIRST_CATEGORIES[product?.category?.id as number],
        site: product?.site?.name,
        price: product?.price,
        source: 'CHANNEL_DETAIL',
        sellerType: product?.sellerType,
        productSellerId: product?.productSeller?.id,
        productSellerType: product?.productSeller?.type,
        productSellerAccount: product?.productSeller?.account,
        useChat: product?.sellerType !== productSellerType.collection,
        channel: useQueryChannel.data?.channel,
        channelTargetUser: useQueryChannel.data?.channelTargetUser?.user,
        channelUser: useQueryChannel.data?.channelUser?.user,
        isTargetUserNoti: useQueryChannel.data?.isTargetUserNoti,
        lastMessageManage: useQueryChannel.data?.lastMessageManage
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    if (messagesRef.current) {
      const { clientHeight, scrollTop, scrollHeight } = messagesRef.current;

      setUnreadCount(
        Math.ceil(clientHeight + scrollTop) >= scrollHeight
          ? 0
          : sendbirdChannel?.unreadMessageCount || 0
      );
    }
  }, [sendbirdChannel?.unreadMessageCount]);

  useEffect(() => {
    const handleResize = () => scrollToBottom('smooth');

    if (checkAgent.isMobileApp()) window.addEventListener('resize', handleResize);

    return () => {
      if (checkAgent.isMobileApp()) window.removeEventListener('resize', handleResize);
    };
  }, [scrollToBottom]);

  useEffect(() => {
    if (checkAgent.isIOSApp()) {
      if (isTargetUserBlocked || isDeletedTargetUser || isCamelAdminUser || isAdminBlockUser) {
        window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
      } else {
        window.webkit?.messageHandlers?.callInputShow?.postMessage?.(0);
      }
    }
  }, [isCamelAdminUser, isDeletedTargetUser, isTargetUserBlocked, isAdminBlockUser]);

  useEffect(() => {
    window.getChannelMessage = (message: string) => {
      if (!!channel?.id && !!channel.externalId && !!message && message.length > 0) {
        mutateSendMessage({
          data: { channelId: channel.id, content: message, event: 'LAST_MESSAGE' },
          channelUrl: channel.externalId,
          isTargetUserNoti,
          userId: targetUserId,
          productId,
          callback: updateNewMessage
        });
      }
    };
  }, [
    channel?.externalId,
    channel?.id,
    isTargetUserNoti,
    mutateSendMessage,
    productId,
    targetUserId,
    updateNewMessage
  ]);

  useEffect(() => {
    window.getPhotoAttach = async (fileUrls: string[]) => {
      if (channel?.id && channel?.externalId && !!fileUrls && fileUrls.length > 0) {
        await mutateSendMessage({
          data: {
            channelId: channel.id,
            content: `${userName}님이 사진을 보냈습니다.`,
            event: 'LAST_MESSAGE'
          },
          channelUrl: channel.externalId,
          isTargetUserNoti,
          fileUrls,
          userId: targetUserId,
          productId,
          callback: updateNewMessage
        });
      }
    };
  }, [
    channel?.externalId,
    channel?.id,
    isTargetUserNoti,
    mutateSendMessage,
    productId,
    targetUserId,
    updateNewMessage,
    userName
  ]);

  useEffect(() => {
    setIsIOSApp(!!checkAgent.isIOSApp());
  }, []);

  return (
    <>
      <GeneralTemplate
        hideAppDownloadBanner={!checkAgent.isMobileApp()}
        header={
          <HeaderWrapper>
            <ChannelHeader
              sellerUserId={useQueryChannel?.data?.product?.productSeller?.id}
              isExternalPlatform={isExternalPlatform}
              isLoading={isLoading || !isFetched}
              isTargetUserSeller={!isSeller}
              isDeletedTargetUser={isDeletedTargetUser}
              isTargetUserBlocked={isTargetUserBlocked}
              targetUserImage={
                (hasImageFile(channelTargetUser?.user?.imageProfile) &&
                  channelTargetUser?.user?.imageProfile) ||
                (hasImageFile(channelTargetUser?.user?.image) && channelTargetUser?.user?.image) ||
                ''
              }
              targetUserName={targetUserName}
              targetUserId={targetUserId}
              isAdminBlockUser={isAdminBlockUser}
              dateActivated={useQueryChannel?.data?.dateActivated}
            />
            {(isLoading || !isFetched || ((!isLoading || isFetched) && !!product)) &&
              !isCamelAdminUser && (
                <>
                  <FixedProductInfo
                    isLoading={isLoading || !isFetched}
                    isEditableProductStatus={isSeller}
                    isDeletedProduct={isDeletedProduct}
                    isTargetUserBlocked={isTargetUserBlocked}
                    isAdminBlockUser={isAdminBlockUser}
                    image={product?.imageThumbnail || product?.imageMain || ''}
                    status={productStatus}
                    title={product?.title || ''}
                    price={product?.price || 0}
                    order={orders[0]}
                    offer={offers[0]}
                    onClick={handleClickProduct}
                    onClickSafePayment={handleClickSafePayment}
                    onClickStatus={() =>
                      logEvent(attrKeys.channel.CLICK_PRODUCT_MANAGE, {
                        name: attrProperty.name.CHANNEL_DETAIL,
                        title: getLogEventTitle(product?.status || 0)
                      })
                    }
                  />
                  {isExternalPlatform && <ChannelCamelAuthFixBanner type="external" />}
                </>
              )}
            {!!appointment && showAppointmentBanner && (
              <ChannelAppointmentBanner dateAppointment={appointment.dateAppointment} />
            )}
            {!showAppointmentBanner && !isExternalPlatform && <ChannelSafePaymentGuideBanner />}
            {unreadCount > 0 && (
              <Flexbox
                justifyContent="center"
                customStyle={{
                  minHeight: MESSAGE_NEW_MESSAGE_NOTIFICATION_HEIGHT,
                  position: 'relative',
                  marginTop: 12
                }}
              >
                <Chip
                  size="medium"
                  variant="solid"
                  isRound
                  brandColor="blue"
                  startIcon={<Icon name="Arrow1DownOutlined" />}
                  customStyle={{ gap: 2 }}
                  onClick={handleClickUnreadCount}
                >
                  새 메세지 {unreadCount}개
                </Chip>
              </Flexbox>
            )}
          </HeaderWrapper>
        }
        disablePadding
        customStyle={{ position: 'relative' }}
      >
        <Inner isIOSApp={isIOSApp}>
          <ContentWrapper>
            {!!sendbirdChannel && (
              <ChannelMessages
                sendbirdChannel={sendbirdChannel}
                messages={messages}
                productId={productId}
                targetUserId={targetUserId}
                targetUserName={targetUserName}
                showAppointmentBanner={showAppointmentBanner}
                showNewMessageNotification={unreadCount > 0}
                showActionButtons={showActionButtons}
                showSafePaymentGuideBanner={!showAppointmentBanner && !isExternalPlatform}
                messagesRef={messagesRef}
                hasMorePrev={hasMorePrev}
                hasUserReview={!!userReview}
                hasTargetUserReview={!!targetUserReview}
                fetchPrevMessages={fetchPrevMessages}
                scrollToBottom={scrollToBottom}
                refetchChannel={refetch}
                isCamelAdminUser={isCamelAdminUser}
                isSeller={isSeller}
                isTargetUserBlocked={isTargetUserBlocked}
                isAdminBlockUser={isAdminBlockUser}
                orders={orders}
                offers={offers}
                status={productStatus}
                onClickSafePayment={handleClickOfferSafePayment}
              />
            )}
          </ContentWrapper>
          <FooterWrapper showInputMessage={showMessageInput} isFocused={isFocused}>
            {!!channel && showActionButtons && (
              <ChannelBottomActionButtons
                messageInputHeight={messageInputHeight}
                lastMessageIndex={messages.length + 1}
                channelId={channel.id}
                channelUrl={channel.externalId}
                userName={userName}
                isTargetUserNoti={isTargetUserNoti}
                isTargetUserSeller={!isSeller}
                targetUserId={targetUserId}
                targetUserName={targetUserName}
                product={product}
                productId={productId}
                status={productStatus}
                isDeletedProduct={isDeletedProduct}
                appointment={appointment}
                userReview={userReview}
                targetUserReview={targetUserReview}
                hasLastMessage={!!lastMessageManage || !!sendbirdChannel?.lastMessage}
                refetchChannel={refetch}
                updateNewMessage={updateNewMessage}
                order={orders[0]}
                offers={offers}
              />
            )}
            {showMessageInput && (
              <ChannelMessageInput
                channelId={channel?.id}
                channelUrl={channel?.externalId}
                setMessageInputHeight={setMessageInputHeight}
                setIsFocused={setIsFocused}
                isTargetUserNoti={isTargetUserNoti}
                isDeletedTargetUser={isDeletedTargetUser || isCamelAdminUser}
                isTargetUserBlocked={isTargetUserBlocked}
                isAdminBlockUser={isAdminBlockUser}
                scrollToBottom={scrollToBottom}
                updateNewMessage={updateNewMessage}
                productId={productId}
                targetUserId={targetUserId}
                lastMessageIndex={messages.length + 1}
              />
            )}
          </FooterWrapper>
        </Inner>
      </GeneralTemplate>
      <ChannelProductStatusBottomSheet
        id={productId}
        status={productStatus}
        onSuccessProductUpdateStatus={refetch}
        isChannel
      />
      <SelectTargetUserBottomSheet productId={productId} isChannel />
      {!!channel && (
        <ChannelMoreMenuBottomSheet
          channelId={channel.id}
          productId={channel.productId}
          targetUserId={targetUserId}
          targetUserName={targetUserName}
          isTargetUserSeller={!isSeller}
          isTargetUserBlocked={isTargetUserBlocked}
          isDeletedTargetUser={isDeletedTargetUser}
          isNotiOn={!!channelUser?.isNoti}
          refetchChannel={refetch}
          isCamelAdminUser={isCamelAdminUser}
        />
      )}
      <ImageDetailDialog
        open={channelThumbnailMessageImage.length > 0}
        onClose={handleCloseImageDetailDialog}
        images={[channelThumbnailMessageImage]}
        name={attrProperty.name.CHANNEL_DETAIL}
      />
      <ChannelSaleRequestRefuseDialog
        order={orders[0]}
        channelTargetUser={channelTargetUser}
        refetchChannel={refetch}
      />
      <ChannelPurchaseConfirmDialog order={orders[0]} product={product} refetchChannel={refetch} />
      <ChannelSafePaymentGuideDialog />
    </>
  );
}

export async function getServerSideProps({ req, query: { id } }: GetServerSidePropsContext) {
  const channelId = String(id);
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));

  if (channelId.length > 0) {
    const { channelUser } = await fetchChannel(+channelId);

    if (channelUser) {
      return {
        props: {
          dehydratedState: dehydrate(queryClient)
        }
      };
    }
  }

  return {
    redirect: {
      destination: `/login?returnUrl=/channels/${channelId}&isRequiredLogin=true`,
      permanent: false
    }
  };
}

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  overflow: hidden;
  transition: all 0.5s;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

const Inner = styled.div<{ isIOSApp: boolean }>`
  display: flex;
  flex-direction: column;
  height: ${({ isIOSApp }) => (isIOSApp ? 'calc(100vh - 55px)' : '100%')};
  overflow: hidden;
`;

const ContentWrapper = styled.section`
  position: relative;
  flex: 1 1 0;
  -webkit-box-flex: 1;
  height: auto;
  isolation: isolate;
`;

const FooterWrapper = styled.section<{
  showInputMessage: boolean;
  isFocused: boolean;
}>`
  position: ${({ isFocused }) => (isFocused ? 'static' : 'sticky')};
  bottom: ${({ isFocused }) =>
    // eslint-disable-next-line no-nested-ternary
    isFocused ? 0 : isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : 0};
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
  box-sizing: content-box;
  width: 100%;
  min-height: ${({ showInputMessage }) => (showInputMessage ? MESSAGE_INPUT_HEIGHT + 16 : 0)}px;
`;

export default Chanel;
