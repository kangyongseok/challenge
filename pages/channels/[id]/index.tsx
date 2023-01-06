import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { QueryClient, dehydrate } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Chip, Flexbox, Icon } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';
import FixedProductInfo from '@components/UI/molecules/FixedProductInfo';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ChannelAppointmentBanner,
  ChannelBottomActionButtons,
  ChannelHeader,
  ChannelMessageInput,
  ChannelMessages,
  ChannelMoreMenuBottomSheet,
  ChannelProductStatusBottomSheet
} from '@components/pages/channel';

import SessionStorage from '@library/sessionStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchChannel } from '@api/channel';

import { channelUserType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import {
  MESSAGE_INPUT_HEIGHT,
  MESSAGE_NEW_MESSAGE_NOTIFICATION_HEIGHT,
  locales
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { checkAgent, getProductDetailUrl } from '@utils/common';
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

  const [channelThumbnailMessageImage, setChannelThumbnailMessageImage] = useRecoilState(
    channelThumbnailMessageImageState
  );
  const setChannelPushPageState = useSetRecoilState(channelPushPageState);
  const resetDialogState = useResetRecoilState(dialogState);
  const resetMoreBottomSheetState = useResetRecoilState(channelBottomSheetStateFamily('more'));
  const resetProductStatusBottomSheetState = useResetRecoilState(
    channelBottomSheetStateFamily('productStatus')
  );

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const {
    useQueryChannel: {
      data: {
        channel,
        product,
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
      productId,
      productStatus
    },
    sendbirdChannel,
    messages,
    hasMorePrev,
    fetchPrevMessages,
    updateNewMessage
  } = useChannel(messagesRef);
  const { mutate: mutateSendMessage } = useMutationSendMessage();

  const [isFocused, setIsFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageInputHeight, setMessageInputHeight] = useState(MESSAGE_INPUT_HEIGHT);

  const showMessageInput = useMemo(
    () => (!checkAgent.isIOSApp() && isFetched) || isTargetUserBlocked || isDeletedTargetUser,
    [isDeletedTargetUser, isFetched, isTargetUserBlocked]
  );

  const scrollToBottom = useCallback((behavior?: ScrollBehavior) => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior
    });
  }, []);

  const handleClickProduct = useCallback(() => {
    if (!product || isDeletedProduct) return;

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

    if (checkAgent.isIOSApp()) window.webkit?.messageHandlers?.callInputShow?.postMessage?.(0);

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
      logEvent(attrKeys.channel.VIEW_CHANNEL_DETAIL, {
        att:
          channelUserType[channelUser.type as keyof typeof channelUserType] === channelUserType[1]
            ? 'SELLR'
            : 'BUYER'
      });
    }
  }, [channelUser?.type]);

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
      if (isTargetUserBlocked || isDeletedTargetUser) {
        window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
      } else {
        window.webkit?.messageHandlers?.callInputShow?.postMessage?.(0);
      }
    }
  }, [isDeletedTargetUser, isTargetUserBlocked]);

  useEffect(() => {
    window.getChannelMessage = (message: string) => {
      if (!!channel?.id && !!channel.externalId && !!message && message.length > 0) {
        mutateSendMessage({
          data: { channelId: channel.id, content: message, event: 'LAST_MESSAGE' },
          channelUrl: channel.externalId,
          isTargetUserNoti,
          callback: updateNewMessage
        });
      }
    };
  }, [channel?.externalId, channel?.id, isTargetUserNoti, mutateSendMessage, updateNewMessage]);

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
          callback: updateNewMessage
        });
      }
    };
  }, [
    channel?.externalId,
    channel?.id,
    isTargetUserNoti,
    mutateSendMessage,
    updateNewMessage,
    userName
  ]);

  return (
    <>
      <Layout>
        <Container>
          <GeneralTemplate
            hideAppDownloadBanner={!checkAgent.isMobileApp()}
            header={
              <HeaderWrapper>
                <ChannelHeader
                  isLoading={isLoading || !isFetched}
                  isTargetUserSeller={!isSeller}
                  isDeletedTargetUser={isDeletedTargetUser}
                  targetUserImage={channelTargetUser?.user?.image}
                  targetUserName={targetUserName}
                  targetUserId={targetUserId}
                />
                {(isLoading || !isFetched || ((!isLoading || isFetched) && !!product)) && (
                  <FixedProductInfo
                    isLoading={isLoading || !isFetched}
                    isEditableProductStatus={isSeller}
                    isDeletedProduct={isDeletedProduct}
                    image={product?.imageThumbnail || product?.imageMain || ''}
                    status={productStatus}
                    title={product?.title || ''}
                    price={product?.price || 0}
                    onClick={handleClickProduct}
                    onClickStatus={() =>
                      logEvent(attrKeys.channel.CLICK_PRODUCT_MANAGE, {
                        name: attrProperty.name.CHANNEL_DETAIL,
                        title: getLogEventTitle(product?.status || 0)
                      })
                    }
                  />
                )}
                {!!appointment && showAppointmentBanner && (
                  <ChannelAppointmentBanner dateAppointment={appointment.dateAppointment} />
                )}
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
            subset
          >
            <Inner>
              <ContentWrapper>
                {!!sendbirdChannel && (
                  <ChannelMessages
                    sendbirdChannel={sendbirdChannel}
                    messages={messages}
                    productId={productId}
                    targetUserId={targetUserId}
                    showAppointmentBanner={showAppointmentBanner}
                    showNewMessageNotification={unreadCount > 0}
                    showActionButtons={!isDeletedTargetUser && !isTargetUserBlocked}
                    messagesRef={messagesRef}
                    hasMorePrev={hasMorePrev}
                    fetchPrevMessages={fetchPrevMessages}
                    scrollToBottom={scrollToBottom}
                    refetchChannel={refetch}
                  />
                )}
              </ContentWrapper>
              <FooterWrapper showInputMessage={showMessageInput} isFocused={isFocused}>
                {!!channel && !isDeletedTargetUser && !isTargetUserBlocked && (
                  <ChannelBottomActionButtons
                    messageInputHeight={messageInputHeight}
                    channelId={channel.id}
                    channelUrl={channel.externalId}
                    userName={userName}
                    isTargetUserNoti={isTargetUserNoti}
                    isTargetUserSeller={!isSeller}
                    targetUserId={targetUserId}
                    targetUserName={targetUserName}
                    productId={productId}
                    status={productStatus}
                    isDeletedProduct={isDeletedProduct}
                    appointment={appointment}
                    userReview={userReview}
                    targetUserReview={targetUserReview}
                    hasLastMessage={!!lastMessageManage || !!sendbirdChannel?.lastMessage}
                    refetchChannel={refetch}
                    updateNewMessage={updateNewMessage}
                  />
                )}
                {showMessageInput && (
                  <ChannelMessageInput
                    channelId={channel?.id}
                    channelUrl={channel?.externalId}
                    setMessageInputHeight={setMessageInputHeight}
                    setIsFocused={setIsFocused}
                    isTargetUserNoti={isTargetUserNoti}
                    isDeletedTargetUser={isDeletedTargetUser}
                    isTargetUserBlocked={isTargetUserBlocked}
                    scrollToBottom={scrollToBottom}
                    updateNewMessage={updateNewMessage}
                  />
                )}
              </FooterWrapper>
            </Inner>
          </GeneralTemplate>
        </Container>
      </Layout>
      <ChannelProductStatusBottomSheet
        id={productId}
        status={productStatus}
        targetUserId={targetUserId}
        onSuccessProductUpdateStatus={refetch}
      />
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
        />
      )}
      <ImageDetailDialog
        open={channelThumbnailMessageImage.length > 0}
        onClose={handleCloseImageDetailDialog}
        images={[channelThumbnailMessageImage]}
        name={attrProperty.name.CHANNEL_DETAIL}
      />
    </>
  );
}

export async function getServerSideProps({
  req,
  locale,
  query: { id },
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const channelId = String(id);
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(
    getCookies({ req }),
    queryClient
  );

  if (!!accessUser && channelId.length > 0) {
    const { channelUser } = await fetchChannel(+channelId);

    if (channelUser) {
      return {
        props: {
          ...(await serverSideTranslations(locale || defaultLocale)),
          dehydratedState: dehydrate(queryClient)
        }
      };
    }
  }

  return {
    redirect: {
      destination: accessUser
        ? '/channels'
        : `/login?returnUrl=/channels/${channelId}&isRequiredLogin=true`,
      permanent: false
    }
  };
}

const Layout = styled.div`
  width: 100%;
  height: 100%;
  min-height: calc(var(--vh, 1vh) * 100);

  main {
    position: relative;
    flex: 1 1 0px;
    -webkit-box-flex: 1;
  }
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  isolation: isolate;
  overflow: hidden;
`;

const HeaderWrapper = styled.div`
  position: fixed;
  top: env(safe-area-inset-top, 0);
  right: 0;
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  overflow: hidden;
  transition: all 0.5s;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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
  bottom: ${({ isFocused }) => (isFocused ? 0 : 'env(safe-area-inset-bottom, 0)')};
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
  box-sizing: content-box;
  width: 100%;
  min-height: ${({ showInputMessage }) => (showInputMessage ? MESSAGE_INPUT_HEIGHT + 16 : 0)}px;
`;

export default Chanel;
