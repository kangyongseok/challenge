import { useEffect, useMemo } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Dialog, Flexbox, Icon, ThemeProvider, Typography } from 'mrcamel-ui';
import has from 'lodash-es/has';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { dialogContent, dialogTitle, firstButtonText, secondButtonText } from '@constants/dialog';
import { FACEBOOK_SHARE_URL, TWITTER_SHARE_URL } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { productDetailAtt } from '@utils/products';
import { commaNumber, copyToClipboard, noop } from '@utils/common';

import type { ShareData } from '@typings/common';
import { dialogState, toastState } from '@recoil/common';

function DialogProvider() {
  const {
    type,
    theme,
    firstButtonAction,
    secondButtonAction,
    onClose,
    content,
    product,
    customStyle,
    customStyleTitle,
    disabledOnClose = false,
    shareData
  } = useRecoilValue(dialogState);
  const resetDialogState = useResetRecoilState(dialogState);
  const dialogDisplayType = useMemo(() => {
    switch (type) {
      case 'SNSShare':
        return 'textWithCloseButton';
      case 'readyNextCrazyCuration':
      case 'closedCrazyCuration':
      case 'endCrazyCuration':
      case 'deleteLegitAdminOpinion':
      case 'deleteLegitResultComment':
      case 'deleteLegitResultReply':
      case 'leaveChannel':
      case 'blockUser':
      case 'loginError':
        return 'textWithTwoButton';
      case 'legitRequestOnlyInApp':
      case 'legitRequestOnlyInIOS':
      case 'legitServiceNotice':
      case 'appUpdateNotice':
      case 'legitPhotoGuide':
      case 'loginProviderError':
        return 'textWithOneButton';
      case 'appAuthCheck':
      case 'unblockBlockedUser':
      case 'confirmDeal':
      case 'successMakeAppointment':
      case 'cancelAppointment':
      case 'requiredAppUpdateForChat':
        return 'textWithTwoVerticalButton';
      default:
        return 'text';
    }
  }, [type]);

  const handleClickFirst = () => {
    if (firstButtonAction) firstButtonAction();

    resetDialogState();
  };

  const handleClickSecond = () => {
    if (secondButtonAction) secondButtonAction();

    resetDialogState();
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
    resetDialogState();
  };

  return (
    <ThemeProvider theme={theme || 'light'}>
      <Dialog
        open={!!type}
        onClose={!disabledOnClose ? handleClose : noop}
        customStyle={customStyle}
      >
        {type === 'legitServiceNotice' && (
          <Box
            customStyle={{
              height: 52,
              lineHeight: '52px',
              marginBottom: 32,
              fontSize: 52,
              textAlign: 'center'
            }}
          >
            🕵️
          </Box>
        )}
        {type && dialogDisplayType === 'textWithCloseButton' && (
          <>
            <Box customStyle={{ position: 'relative' }}>
              <Icon
                name="CloseOutlined"
                onClick={resetDialogState}
                customStyle={{ position: 'absolute', right: 0, margin: '-2px -4px 0 0' }}
              />
            </Box>
            {has(dialogTitle, type) && (
              <Typography variant="body1" weight="medium" customStyle={{ textAlign: 'center' }}>
                {dialogTitle[type as keyof typeof dialogTitle]}
              </Typography>
            )}
          </>
        )}
        {type && !['SNSShare'].includes(type) && (
          <Flexbox direction="vertical" gap={20}>
            <Flexbox direction="vertical" alignment="center" justifyContent="center" gap={8}>
              {has(dialogTitle, type) && (
                <Typography
                  variant="h3"
                  weight="bold"
                  customStyle={{ width: '100%', textAlign: 'center', ...customStyleTitle }}
                >
                  {dialogTitle[type as keyof typeof dialogTitle]}
                </Typography>
              )}
              {content ||
                (has(dialogContent, type) && (
                  <Typography variant="h4" customStyle={{ textAlign: 'center' }}>
                    {dialogContent[type as keyof typeof dialogContent]}
                  </Typography>
                ))}
            </Flexbox>
            {dialogDisplayType === 'textWithTwoVerticalButton' && (
              <Flexbox direction="vertical" gap={8}>
                <Button
                  variant="solid"
                  brandColor="primary"
                  size="large"
                  customStyle={{ width: '100%' }}
                  onClick={handleClickFirst}
                >
                  {firstButtonText[type as keyof typeof firstButtonText]}
                </Button>
                <Button
                  variant="ghost"
                  brandColor="black"
                  size="large"
                  customStyle={{ width: '100%' }}
                  onClick={handleClickSecond}
                >
                  {secondButtonText[type as keyof typeof secondButtonText]}
                </Button>
              </Flexbox>
            )}
            {['textWithTwoButton', 'textWithOneButton'].includes(dialogDisplayType) && (
              <Flexbox gap={8}>
                {dialogDisplayType === 'textWithTwoButton' && (
                  <Button
                    variant="ghost"
                    brandColor="black"
                    size="large"
                    customStyle={{ width: '100%' }}
                    onClick={handleClickFirst}
                  >
                    {firstButtonText[type as keyof typeof firstButtonText]}
                  </Button>
                )}
                <Button
                  variant="solid"
                  brandColor="primary"
                  size="large"
                  customStyle={{ width: '100%' }}
                  onClick={handleClickSecond}
                >
                  {secondButtonText[type as keyof typeof secondButtonText]}
                </Button>
              </Flexbox>
            )}
          </Flexbox>
        )}
        {type === 'SNSShare' && <SNSShareDialolgContent product={product} shareData={shareData} />}
      </Dialog>
    </ThemeProvider>
  );
}

type ShareSocialPlatform = 'kakao' | 'facebook' | 'twitter' | 'linkCopy';

const socialPlatformInfo: {
  platform: ShareSocialPlatform;
  title: string;
  backgroundPosition: string;
}[] = [
  { platform: 'kakao', title: attrProperty.title.katalk, backgroundPosition: '-297px -66px' },
  { platform: 'facebook', title: attrProperty.title.fb, backgroundPosition: '-240px -122px' },
  { platform: 'twitter', title: attrProperty.title.twitter, backgroundPosition: '-356px -122px' },
  { platform: 'linkCopy', title: attrProperty.title.url, backgroundPosition: '-297px -122px' }
];

interface SNSShareDialolgContentProps {
  product?: Product;
  shareData?: ShareData;
}

function SNSShareDialolgContent({ product, shareData }: SNSShareDialolgContentProps) {
  const { asPath, query, pathname } = useRouter();

  const setToastState = useSetRecoilState(toastState);
  const resetDialogState = useResetRecoilState(dialogState);

  const handleClickShareIcon = (platform: ShareSocialPlatform, title: string) => () => {
    let shareUrl = `${window.location.origin}${decodeURI(asPath.split('?')[0])}`;
    let shareTitle = String(query?.title || '')
      .replace(/[0-9]/gim, '')
      .replace(/-/gim, ' ')
      .trim();
    let shareDescription =
      '대한민국 모든 중고명품, 한번에 검색&비교하고 득템하세요. 상태 좋고 가격도 저렴한 중고명품을 빠르게 찾도록 도와드릴게요!';
    let shareImage = `https://${process.env.IMAGE_DOMAIN}/assets/favicon/android-icon-192x192.png`;
    let viewPrice = 0;

    if (product) {
      productDetailAtt({
        key: attrKeys.products.CLICK_SHARE,
        product,
        rest: { title },
        source: attrProperty.productSource.PRODUCT_LIST
      });

      shareUrl = `${window.location.origin}/products/${product.id}`;
      shareTitle = product.title;
      viewPrice = Number.isNaN(product.price / 10000) ? 0 : product.price / 10000;
      shareDescription = `${product.site.name} ${commaNumber(
        viewPrice - Math.floor(viewPrice) > 0 ? Number(viewPrice.toFixed(1)) : Math.floor(viewPrice)
      )}만원\r\nAi추천지수 ${product.scoreTotal}/10`;
      shareImage = product.imageMain;
    }

    if (shareData) {
      shareUrl = shareData.url;
      shareTitle = shareData.title;
      shareDescription = shareData.description;

      if (shareData.image) shareImage = shareData.image;
    }

    if (pathname.includes('/crazycuration')) {
      logEvent(attrKeys.crazycuration.clickShare, {
        name: attrProperty.name.crazyWeek,
        title,
        att: 'TOP'
      });
    }

    switch (platform) {
      case 'kakao': {
        if (window.Kakao === undefined) return;

        if (!window.Kakao.isInitialized()) window.Kakao.init(process.env.KAKAO_JS_KEY);

        window.Kakao.Link.sendDefault({
          objectType: 'feed',
          content: {
            title: shareTitle,
            description: shareDescription,
            imageUrl: shareImage,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl
            }
          }
        });

        break;
      }
      case 'facebook': {
        window.open(`${FACEBOOK_SHARE_URL}?u=${encodeURIComponent(shareUrl)}`);
        break;
      }
      case 'twitter': {
        window.open(`${TWITTER_SHARE_URL}?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`);
        break;
      }
      case 'linkCopy':
      default:
        if (copyToClipboard(`${shareTitle} ${shareUrl}`)) {
          setToastState({
            type: 'product',
            status: 'successCopy',
            hideDuration: 1500
          });
        }
        break;
    }

    resetDialogState();
  };

  useEffect(() => {
    scrollDisable();

    return () => scrollEnable();
  }, []);

  return (
    <Flexbox
      justifyContent="center"
      gap={16}
      customStyle={{ padding: '16px 20px 16px', flexWrap: 'wrap' }}
    >
      {socialPlatformInfo.map(({ platform, title, backgroundPosition }) => (
        <Box
          key={`share-platform-${platform}`}
          onClick={handleClickShareIcon(platform, title)}
          customStyle={{ height: 33 }}
        >
          <SNSIcon backgroundPosition={backgroundPosition} />
        </Box>
      ))}
    </Flexbox>
  );
}

const SNSIcon = styled.span<{ backgroundPosition: string }>`
  display: inline-block;
  width: 33px;
  height: 33px;
  background-image: url(${`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/fullpage_ico.png`});
  background-repeat: no-repeat;
  background-size: 432px;
  background-position: ${({ backgroundPosition }) => backgroundPosition};
`;

export default DialogProvider;
