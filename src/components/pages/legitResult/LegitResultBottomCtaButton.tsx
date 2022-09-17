import { useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Dialog, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { FACEBOOK_SHARE_URL, TWITTER_SHARE_URL } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber, copyToClipboard } from '@utils/common';
import checkAgent from '@utils/checkAgent';

type SocialPlatform = 'kakao' | 'facebook' | 'twitter' | 'linkCopy';

function LegitResultBottomCtaButton() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [openToast, setOpenToast] = useState(false);

  const { data: { productResult, result } = {} } = useQuery(
    queryKeys.products.productLegit({ productId }),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  const handleClick = () => {
    if (!productResult) return;

    logEvent(attrKeys.legitResult.CLICK_SHARE, {
      name: attrProperty.legitName.LEGIT_INFO,
      title: attrProperty.legitTitle.LEGIT_SHARE
    });

    const url = window.location.href;
    let text = '카멜 사진감정 결과, 실물감정을 추천해요';

    if (result === 1) text = '카멜 사진감정 결과, 정품의견이 더 우세해요!';
    if (result === 2) text = '카멜 사진감정 결과, 가품의심의견이 있어요!';

    if (checkAgent.isAndroidApp() && window.AndroidShareHandler) {
      window.AndroidShareHandler.share(url);
      return;
    }

    if (
      ['android', 'iphone', 'ipad', 'ipod'].some((platfrom) =>
        navigator.userAgent.toLowerCase().indexOf(platfrom)
      )
    ) {
      if (navigator.share) {
        navigator.share({ text, url });
        return;
      }

      if (checkAgent.isAndroidApp() && window.webview && window.webview.callShareProduct) {
        window.webview.callShareProduct(url, JSON.stringify(productResult));
        return;
      }

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callShareProduct
      ) {
        window.webkit.messageHandlers.callShareProduct.postMessage(
          JSON.stringify({ url, product: productResult })
        );
        return;
      }
    }

    setOpen(true);
  };

  const handleClickShareIcon = (platform: SocialPlatform) => () => {
    if (!productResult) return;

    const url = `${window.location.origin}/products/${productResult.id}`;
    let viewPrice = productResult.price / 10000;

    const title = () => {
      switch (platform) {
        case 'kakao':
          return 'KATALK';
        case 'facebook':
          return 'FB';
        case 'twitter':
          return 'TWITTER';
        default:
          return 'URL';
      }
    };

    logEvent(attrKeys.legitResult.CLICK_SHARE, {
      name: attrProperty.legitName.LEGIT_INFO,
      title: attrProperty.legitTitle.LEGIT_SHARE,
      rest: { title: title() }
    });

    switch (platform) {
      case 'kakao':
        if (window.Kakao === undefined) {
          return;
        }

        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.KAKAO_JS_KEY);
        }

        if (Number.isNaN(viewPrice)) {
          viewPrice = 0;
        }

        if (viewPrice - Math.floor(viewPrice) > 0) {
          viewPrice = Number(viewPrice.toFixed(1));
        } else {
          viewPrice = Math.floor(viewPrice);
        }

        window.Kakao.Link.sendDefault({
          objectType: 'feed',
          content: {
            title: productResult.title,
            description: `${productResult.site.name} ${commaNumber(viewPrice)}만원\r\nAi추천지수 ${
              productResult.scoreTotal
            }/10`,
            imageUrl: productResult.imageMain,
            link: {
              mobileWebUrl: url,
              webUrl: url
            }
          }
        });

        break;
      case 'facebook':
        window.open(`${FACEBOOK_SHARE_URL}?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(
          `${TWITTER_SHARE_URL}?text=${productResult.title}&url=${encodeURIComponent(url)}`
        );
        break;
      case 'linkCopy':
      default:
        copyToClipboard(`${productResult.title} ${url}`);
        setOpenToast(false);
        setOpen(false);
        break;
    }
  };

  return (
    <>
      <Box customStyle={{ minHeight: 89 }}>
        <CtaButtonWrapper gap={8}>
          <CtaButton
            startIcon={<Icon name="ShareOutlined" />}
            size="large"
            iconOnly
            onClick={handleClick}
            customStyle={{
              borderColor: common.grey['95']
            }}
          />
          <CtaButton
            fullWidth
            variant="contained"
            brandColor="black"
            size="large"
            onClick={() => router.push(`/products/${id}`)}
          >
            해당 매물로 돌아가기
          </CtaButton>
        </CtaButtonWrapper>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box customStyle={{ float: 'right', marginRight: -4 }}>
          <Icon name="CloseOutlined" onClick={() => setOpen(false)} />
        </Box>
        <Typography
          variant="body1"
          weight="medium"
          customStyle={{ textAlign: 'center', marginTop: 16 }}
        >
          공유하기
        </Typography>
        {/* TODO: 아이콘 파일 확인 */}
        <Flexbox
          justifyContent="center"
          gap={16}
          customStyle={{ margin: '16px 20px 16px', flexWrap: 'wrap' }}
        >
          {[
            { platform: 'kakao', backgroundPosition: '-297px -66px' },
            { platform: 'facebook', backgroundPosition: '-240px -122px' },
            { platform: 'twitter', backgroundPosition: '-356px -122px' },
            { platform: 'linkCopy', backgroundPosition: '-297px -122px' }
          ].map(({ platform, backgroundPosition }) => (
            <Box
              key={`share-platform-${platform}`}
              onClick={handleClickShareIcon(platform as SocialPlatform)}
            >
              <SNSIcon
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/fullpage_ico.png`}
                backgroundPosition={backgroundPosition}
              />
            </Box>
          ))}
        </Flexbox>
      </Dialog>
      <Toast
        open={openToast}
        onClose={() => setOpenToast(false)}
        bottom="50%"
        autoHideDuration={1500}
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: common.white }}>
          URL이 복사 되었어요.
        </Typography>
      </Toast>
    </>
  );
}

const CtaButtonWrapper = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.grey['90']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
`;

const SNSIcon = styled.span<{ src: string; backgroundPosition: string }>`
  display: inline-block;
  width: 33px;
  height: 33px;
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  background-size: 432px;
  background-position: ${({ backgroundPosition }) => backgroundPosition};
`;

export default LegitResultBottomCtaButton;
