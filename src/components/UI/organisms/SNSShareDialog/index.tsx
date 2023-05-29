import { useRouter } from 'next/router';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Box, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';

import type { Product, ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { FACEBOOK_SHARE_URL, TWITTER_SHARE_URL } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { commaNumber, copyToClipboard } from '@utils/common';

import type { ShareData } from '@typings/common';

import { SNSIcon } from './SNSShareDialog.styles';

interface SNSShareDialogProps {
  open: boolean;
  onClose: () => void;
  shareData?: ShareData;
  product?: Product | ProductResult;
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

function SNSShareDialog({ open, onClose, product, shareData }: SNSShareDialogProps) {
  const router = useRouter();

  const toastStack = useToastStack();

  const handleClickShareIcon = (platform: ShareSocialPlatform, title: string) => () => {
    let shareUrl = `${window.location.origin}${decodeURI(router.asPath.split('?')[0])}`;
    let shareTitle = String(router.query?.title || '')
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
        product: product as Product,
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

    if (router.pathname.includes('/crazycuration')) {
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
          toastStack({
            children: 'URL이 복사 되었어요.',
            autoHideDuration: 1500
          });
        }
        break;
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography weight="medium">공유하기</Typography>
      <Icon
        name="CloseOutlined"
        onClick={onClose}
        customStyle={{
          position: 'absolute',
          top: 30,
          right: 20
        }}
      />
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
    </Dialog>
  );
}

export default SNSShareDialog;
