import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import type { FileMessage } from '@sendbird/chat/message';
import { Box, Flexbox, Skeleton, useTheme } from '@mrcamelhub/camel-ui';

import {
  AppDownloadBanner,
  ImageDetailDialog,
  SelectTargetUserBottomSheet
} from '@components/UI/organisms';
import FixedProductInfo from '@components/UI/molecules/FixedProductInfo';
import FlexibleTemplate from '@components/templates/FlexibleTemplate';
import ChannelReservingBanner from '@components/pages/channel/ChannelReservingBanner';
import {
  ChannelAppointmentBanner,
  ChannelBottomActionButtons,
  ChannelCamelAuthFixBanner,
  ChannelCancelRequestApproveDialog,
  ChannelCancelRequestRefuseDialog,
  ChannelHeader,
  ChannelMessageInput,
  ChannelMessages,
  ChannelMoreMenuBottomSheet,
  ChannelProductStatusBottomSheet,
  ChannelPurchaseConfirmDialog,
  ChannelReservingDialog,
  ChannelSafePaymentGuideBanner,
  ChannelSaleRequestRefuseDialog
} from '@components/pages/channel';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchChannel } from '@api/channel';

import { channelUserType, productType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';
import { checkAgent, getProductDetailUrl, hasImageFile } from '@utils/common';
import { getLogEventTitle } from '@utils/channel';

import { productOrderTypeState } from '@recoil/common';
import { channelBottomSheetStateFamily, channelThumbnailMessageImageState } from '@recoil/channel';
import useSession from '@hooks/useSession';
import useProductType from '@hooks/useProductType';
import useMutationSendMessage from '@hooks/useMutationSendMessage';
import useChannel from '@hooks/useChannel';

function Channel() {
  const router = useRouter();

  const {
    theme: { zIndex }
  } = useTheme();

  const [focusScrollY, setFocusScrollY] = useState(0);
  const [detailImages, setDetailImages] = useState<string[]>([]);

  const [channelThumbnailMessageImage, setChannelThumbnailMessageImage] = useRecoilState(
    channelThumbnailMessageImageState
  );
  const type = useRecoilValue(productOrderTypeState);

  const resetMoreBottomSheetState = useResetRecoilState(channelBottomSheetStateFamily('more'));
  const resetProductStatusBottomSheetState = useResetRecoilState(
    channelBottomSheetStateFamily('productStatus')
  );

  const headerRef = useRef<HTMLDivElement>(null);
  const loggedRef = useRef(false);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const aosFocusTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const loggingTimerRef = useRef<ReturnType<typeof setTimeout>>();

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
    pending,
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
    updateNewMessage,
    isPrevFetching,
    unreadCount,
    hasSentMessage
  } = useChannel();

  const { mutate: mutateSendMessage } = useMutationSendMessage({
    lastMessageIndex: messages.length + 1
  });

  const isAdminBlockUser = product?.productSeller?.type === 1 && !isSeller;

  const [isFocused, setIsFocused] = useState(false);
  const [documentVisibilityState, setDocumentVisibilityState] = useState('hidden');
  const { isAllOperatorProduct } = useProductType(product?.sellerType);
  const { data: accessUser } = useSession();

  const { showActionButtons } = useMemo(
    () => ({
      showActionButtons:
        !isDeletedTargetUser && !isTargetUserBlocked && !isCamelAdminUser && !isAdminBlockUser
    }),
    [isCamelAdminUser, isDeletedTargetUser, isTargetUserBlocked, isAdminBlockUser]
  );

  // const isExternalPlatform = product?.sellerType === productSellerType.externalPlatform;
  const isCrawlingProduct = !!sendbirdChannel && ![1, 2, 3].includes(product?.sellerType || NaN);

  const handleClickProduct = useCallback(() => {
    if (!product || isDeletedProduct) return;

    const pathname = getProductDetailUrl({ type: 'productResult', product });

    SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
      source: attrProperty.source.CHANNEL_DETAIL
    });

    router.push(pathname);
  }, [isDeletedProduct, product, router]);

  const handleClickSafePayment = useCallback(() => {
    logEvent(attrKeys.channel.CLICK_PURCHASE, {
      name: attrProperty.name.CHANNEL_DETAIL,
      id: product?.id,
      att: 'ORDER'
    });
    logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.PAYMENT_WAIT,
      data: {
        ...product
      }
    });

    if (!product || isDeletedProduct) return;

    const pathname = `${getProductDetailUrl({
      product: product as ProductResult,
      type: 'productResult'
    })}/order`;

    SessionStorage.set(sessionStorageKeys.productDetailOrderEventProperties, {
      source: 'CHANNEL_DETAIL'
    });

    router.push({
      pathname,
      query: {
        type,
        includeLegit: LocalStorage.get('includeLegit')
      }
    });
  }, [isDeletedProduct, product, router, type]);

  const handleClickOfferSafePayment = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      logEvent(attrKeys.channel.CLICK_PURCHASE, {
        name: attrProperty.name.CHANNEL_DETAIL,
        id: product?.id,
        att: 'ORDER'
      });
      logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
        name: attrProperty.name.CHANNEL_DETAIL,
        title: attrProperty.title.PAYMENT_WAIT,
        data: {
          ...product
        }
      });

      if (!product || isDeletedProduct) return;

      e.stopPropagation();

      const pathname = `${getProductDetailUrl({
        product: product as ProductResult,
        type: 'productResult'
      })}/order`;

      router.push(pathname);
    },
    [isDeletedProduct, product, router]
  );

  const handleClickUnreadCount = useCallback(async () => {
    const { scrollHeight } = window.flexibleContent;

    window.flexibleContent.scrollTo({
      top: scrollHeight,
      behavior: 'smooth'
    });
  }, []);

  const handleCloseImageDetailDialog = useCallback(() => {
    setChannelThumbnailMessageImage('');
  }, [setChannelThumbnailMessageImage]);

  useEffect(() => {
    return () => {
      setChannelThumbnailMessageImage('');
      resetProductStatusBottomSheetState();
      resetMoreBottomSheetState();
    };
  }, [
    resetMoreBottomSheetState,
    resetProductStatusBottomSheetState,
    setChannelThumbnailMessageImage
  ]);

  useEffect(() => {
    if (loggedRef.current || !product || !channelUser) return;

    loggedRef.current = true;

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
      useChat: product?.sellerType !== productType.collection,
      channel: useQueryChannel.data?.channel,
      channelTargetUser: useQueryChannel.data?.channelTargetUser?.user,
      channelUser: useQueryChannel.data?.channelUser?.user,
      isTargetUserNoti: useQueryChannel.data?.isTargetUserNoti,
      lastMessageManage: useQueryChannel.data?.lastMessageManage,
      channelId: useQueryChannel.data?.channel?.id,
      productId: product?.id,
      userId: accessUser?.userId
    });
  }, [product, accessUser, useQueryChannel, channel, channelUser]);

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

  // IOS 사파리 환경 키보드 focus 이슈 대응
  useEffect(() => {
    const handleScroll = () => {
      if (!window.initFocusScrollY && window.scrollY && isFocused) {
        window.initFocusScrollY = window.scrollY;
      }

      if (!window.scrollY || !isFocused) {
        setFocusScrollY(0);
        setIsFocused(false);
        return;
      }

      window.scrollTo({
        top: window.initFocusScrollY
      });
      setFocusScrollY(window.initFocusScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFocused]);

  // IOS 크롬 환경 키보드 상단 완료 버튼으로 input blur 시 focus 처리가 정상 동작하지 않는 문제 대응
  useEffect(() => {
    const handleScroll = () => {
      if (!isFocused && window.scrollY && window.scrollY === window.initFocusScrollY) {
        setFocusScrollY(window.initFocusScrollY);
        setIsFocused(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFocused]);

  // IOS 사파리 환경 키보드 focus 이슈 대응, 간헐적으로 키보드 focus 에 따라 레이아웃이 올라가지 않는 문제 대응
  useEffect(() => {
    if (isFocused) {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
      }

      focusTimerRef.current = setTimeout(() => {
        window.scrollTo({
          top: window.initFocusScrollY,
          behavior: 'smooth'
        });
      }, 350);
    }
  }, [isFocused]);

  // IOS 사파리 환경 키보드 focus 이슈 대응, 키보드가 올라올 때 메시지 목록 컨테이너의 스크롤이 최하단에 위치할 수 있도록 처리
  useEffect(() => {
    if (isFocused && focusScrollY) {
      window.flexibleContent.scrollTo({
        top: window.flexibleContent.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isFocused, focusScrollY]);

  // AOS 환경 최초 키보드 focus 시 메시지 목록 컨테이너 스크롤이 동작하지 않는 문제 대응
  useEffect(() => {
    if (isFocused && checkAgent.isAndroid()) {
      if (aosFocusTimerRef.current) {
        clearTimeout(aosFocusTimerRef.current);
      }

      aosFocusTimerRef.current = setTimeout(() => {
        window.flexibleContent.scrollTo({
          top: window.flexibleContent.scrollHeight,
          behavior: 'smooth'
        });
      }, 350);
    }
  }, [isFocused]);

  // IOS 사파리 환경, 백그라운드 상태에서 웹/앱으로 돌아오는 경우 레이아웃이 깨지는 문제 대응
  useEffect(() => {
    const handleVisibilityChange = () => {
      setDocumentVisibilityState(
        isFocused && document.visibilityState === 'visible' ? 'visible' : 'hidden'
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFocused]);

  useEffect(() => {
    if (documentVisibilityState === 'visible') {
      if (window.initFocusScrollY) {
        setIsFocused(true);
        setFocusScrollY(window.initFocusScrollY);
        window.scrollTo({
          top: window.initFocusScrollY,
          behavior: 'smooth'
        });
      }
    }
  }, [documentVisibilityState]);

  useEffect(() => {
    setDetailImages(
      messages
        .filter((message) => (message as FileMessage).url)
        .map((message) => (message as FileMessage).url)
    );
  }, [messages]);

  useEffect(() => {
    loggingTimerRef.current = setTimeout(() => {
      window.getAuthPush = (result: string) => {
        logEvent(attrKeys.channel.LOAD_ALARM, {
          name: attrProperty.name.CHANNEL_DETAIL,
          title: attrProperty.title.DEVICE_ALARM,
          att: String(result || 'false').toUpperCase()
        });
      };

      if (checkAgent.isAndroidApp() && window.webview && window.webview.callAuthPush) {
        window.webview.callAuthPush();
        return;
      }

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callAuthPush &&
        window.webkit.messageHandlers.callAuthPush.postMessage
      ) {
        window.webkit.messageHandlers.callAuthPush.postMessage(0);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      window.initFocusScrollY = 0;
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
      }
      if (aosFocusTimerRef.current) {
        clearTimeout(aosFocusTimerRef.current);
      }
      if (loggingTimerRef.current) {
        clearTimeout(loggingTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <FlexibleTemplate
        header={
          <>
            {!isFocused && !checkAgent.isMobileApp() && (
              <Box
                customStyle={{
                  minHeight: APP_DOWNLOAD_BANNER_HEIGHT
                }}
              >
                <AppDownloadBanner />
              </Box>
            )}
            <Box
              ref={headerRef}
              component="header"
              customStyle={{
                position: 'sticky',
                top: 0,
                transform: `translateY(${isFocused ? focusScrollY : 0}px)`,
                zIndex: zIndex.header
              }}
            >
              <ChannelHeader
                sellerUserId={useQueryChannel?.data?.product?.productSeller?.id}
                isCrawlingProduct={isCrawlingProduct}
                isLoading={isLoading || !isFetched}
                isTargetUserSeller={!isSeller}
                isDeletedTargetUser={isDeletedTargetUser}
                isTargetUserBlocked={isTargetUserBlocked}
                targetUserImage={
                  (hasImageFile(channelTargetUser?.user?.imageProfile) &&
                    channelTargetUser?.user?.imageProfile) ||
                  (hasImageFile(channelTargetUser?.user?.image) &&
                    channelTargetUser?.user?.image) ||
                  ''
                }
                targetUserName={targetUserName}
                targetUserId={targetUserId}
                isAdminBlockUser={isAdminBlockUser}
                dateActivated={useQueryChannel?.data?.dateActivated}
                isAllOperatorProduct={isAllOperatorProduct}
              />
              {!isCamelAdminUser && (
                <FixedProductInfo
                  isLoading={isLoading || !isFetched}
                  isEditableProductStatus={isSeller}
                  isDeletedProduct={isDeletedProduct}
                  isTargetUserBlocked={isTargetUserBlocked}
                  isAdminBlockUser={isAdminBlockUser}
                  isReserved={channel?.isReserved}
                  image={product?.imageThumbnail || product?.imageMain || ''}
                  status={productStatus}
                  title={product?.title || ''}
                  price={product?.price || 0}
                  order={orders[0]}
                  offer={offers[0]}
                  productId={product?.id}
                  onClick={handleClickProduct}
                  onClickSafePayment={handleClickSafePayment}
                  isAllOperatorProduct={isAllOperatorProduct}
                  onClickStatus={() =>
                    logEvent(attrKeys.channel.CLICK_PRODUCT_MANAGE, {
                      name: attrProperty.name.CHANNEL_DETAIL,
                      title: getLogEventTitle(product?.status || 0)
                    })
                  }
                />
              )}
              {channel &&
                !channel?.isReserved &&
                !showAppointmentBanner &&
                !isCrawlingProduct &&
                !isAllOperatorProduct && <ChannelSafePaymentGuideBanner />}
              {channel && isAllOperatorProduct && isFetched && (
                <ChannelCamelAuthFixBanner type="operator" platformName={product?.site.name} />
              )}
              {!channel?.isReserved && isCrawlingProduct && !isAllOperatorProduct && (
                <ChannelCamelAuthFixBanner type="external" />
              )}
              {channel?.isReserved && !showAppointmentBanner && !isCrawlingProduct && (
                <ChannelReservingBanner
                  targetUserName={targetUserName}
                  isSeller={isSeller}
                  hasLastMessage={!!lastMessageManage || !!sendbirdChannel?.lastMessage}
                />
              )}
              {!!appointment && showAppointmentBanner && (
                <ChannelAppointmentBanner dateAppointment={appointment.dateAppointment} />
              )}
            </Box>
          </>
        }
        footer={
          <Box
            customStyle={{
              position: 'relative',
              minHeight: 'fit-content'
            }}
          >
            {showActionButtons && (
              <ChannelBottomActionButtons
                isLoading={isLoading || pending || !sendbirdChannel}
                hasSentMessage={hasSentMessage}
                isFocused={isFocused}
                lastMessageIndex={messages.length + 1}
                channelId={channel?.id || 0}
                channelUrl={channel?.externalId || ''}
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
            <ChannelMessageInput
              isLoading={isLoading || pending || !sendbirdChannel}
              channelId={channel?.id}
              channelUrl={channel?.externalId}
              setIsFocused={setIsFocused}
              isTargetUserNoti={isTargetUserNoti}
              isDeletedTargetUser={isDeletedTargetUser || isCamelAdminUser}
              isTargetUserBlocked={isTargetUserBlocked}
              isAdminBlockUser={isAdminBlockUser}
              updateNewMessage={updateNewMessage}
              productId={productId}
              targetUserId={targetUserId}
              lastMessageIndex={messages.length + 1}
            />
          </Box>
        }
        disablePadding
      >
        {sendbirdChannel && !isLoading && !pending ? (
          <ChannelMessages
            sendbirdChannel={sendbirdChannel}
            messages={messages}
            productId={productId}
            targetUserId={targetUserId}
            targetUserName={targetUserName}
            showNewMessageNotification={unreadCount > 0}
            hasMorePrev={hasMorePrev}
            hasUserReview={!!userReview}
            hasTargetUserReview={!!targetUserReview}
            fetchPrevMessages={fetchPrevMessages}
            refetchChannel={refetch}
            isSeller={isSeller}
            isTargetUserBlocked={isTargetUserBlocked}
            isAdminBlockUser={isAdminBlockUser}
            orders={orders}
            offers={offers}
            status={productStatus}
            unreadCount={unreadCount}
            isFocused={isFocused}
            isPrevFetching={isPrevFetching}
            focusScrollY={focusScrollY}
            onClickSafePayment={handleClickOfferSafePayment}
            onClickUnreadCount={handleClickUnreadCount}
          />
        ) : (
          <Flexbox
            direction="vertical"
            gap={12}
            customStyle={{
              padding: 20
            }}
          >
            <Flexbox
              justifyContent="center"
              customStyle={{
                marginBottom: 8
              }}
            >
              <Skeleton width="100%" maxWidth={70} height={16} round={8} disableAspectRatio />
            </Flexbox>
            <Flexbox direction="vertical" gap={4}>
              <Skeleton width="100%" maxWidth={100} height={44} round={20} disableAspectRatio />
              <Skeleton width="100%" maxWidth={150} height={44} round={20} disableAspectRatio />
            </Flexbox>
            <Flexbox direction="vertical" alignment="flex-end" gap={4}>
              <Skeleton width="100%" maxWidth={200} height={44} round={20} disableAspectRatio />
              <Skeleton width="100%" maxWidth={120} height={44} round={20} disableAspectRatio />
              <Skeleton width="100%" maxWidth={150} height={44} round={20} disableAspectRatio />
            </Flexbox>
          </Flexbox>
        )}
      </FlexibleTemplate>
      <ChannelProductStatusBottomSheet
        id={productId}
        channelId={channel?.id}
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
        images={detailImages}
        name={attrProperty.name.CHANNEL_DETAIL}
        syncIndex={detailImages.indexOf(channelThumbnailMessageImage)}
      />
      <ChannelSaleRequestRefuseDialog
        order={orders[0]}
        channelTargetUser={channelTargetUser}
        refetchChannel={refetch}
      />
      <ChannelPurchaseConfirmDialog order={orders[0]} product={product} refetchChannel={refetch} />
      <ChannelReservingDialog />
      <ChannelCancelRequestRefuseDialog
        order={orders[0]}
        productId={productId}
        isSeller={isSeller}
        refetchChannel={refetch}
      />
      <ChannelCancelRequestApproveDialog
        order={orders[0]}
        productId={productId}
        isSeller={isSeller}
        refetchChannel={refetch}
      />
    </>
  );
}

export async function getServerSideProps({
  req,
  query: { id, key },
  resolvedUrl
}: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  try {
    if (key) {
      return {
        props: {
          accessUser: getAccessUserByCookies(getCookies({ req }))
        }
      };
    }

    const queryClient = new QueryClient();

    const { channel } = await queryClient.fetchQuery(queryKeys.channels.channel(Number(id)), () =>
      fetchChannel(Number(id))
    );

    if (!channel) {
      return {
        redirect: {
          destination: `/login?returnUrl=${encodeURI(resolvedUrl)}`,
          permanent: false
        }
      };
    }

    return {
      props: {
        accessUser: getAccessUserByCookies(getCookies({ req })),
        dehydratedState: dehydrate(queryClient)
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default Channel;
