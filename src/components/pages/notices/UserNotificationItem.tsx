import { useState } from 'react';

import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Toast, Typography, useTheme } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

import type { ProductKeywordsContent, UserNoti } from '@dto/user';
import type { SearchParams } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { putProductKeywordView } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime } from '@utils/formats';

interface UserNotificationItemProps {
  type: 'userNoti' | 'honeyNoti';
  notification: UserNoti;
  productKeywords?: ProductKeywordsContent[];
}

function UserNotificationItem({
  notification,
  productKeywords = [],
  type
}: UserNotificationItemProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const { mutate: productKeywordViewMutate } = useMutation(putProductKeywordView);
  const [openToast, setOpenToast] = useState(false);

  const handleClick = () => {
    if (type === 'userNoti') {
      logEvent(attrKeys.noti.CLICK_BEHAVIOR, {
        id: notification.id,
        targetId: notification.targetId,
        type: notification.type,
        keyword: notification.keyword
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.HISTORY,
        title: attrProperty.productTitle.BEHAVIOR,
        type: attrProperty.productType.HISTORY
      });
    }
    if (type === 'honeyNoti') {
      logEvent(attrKeys.noti.CLICK_PRODUCT_DETAIL, {
        name: 'HONEYNOTI_LIST',
        id: notification.id,
        targetId: notification.targetId,
        type: notification.type,
        keyword: notification.keyword
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.HISTORY,
        title: attrProperty.productTitle.HONEYNOTI,
        type: attrProperty.productType.HISTORY
      });
    }
    if (notification.parameter) {
      if (notification.parameter.indexOf('productKeywordId') !== -1) {
        const productKeywordId = Number(notification.parameter.split('/?')[1].split('=')[1]);

        const findProductKeyword = productKeywords.find(({ id }) => id === productKeywordId);

        if (findProductKeyword) {
          const searchParams: SearchParams = JSON.parse(findProductKeyword.keywordFilterJson);
          const getViewType = () => {
            if (findProductKeyword.sourceType === 3) {
              return 'categories';
            }

            if (findProductKeyword.sourceType === 1 || findProductKeyword.sourceType === 2) {
              return 'brands';
            }

            return 'search';
          };
          const getKeywordByViewType = (viewType: string) => {
            if (viewType === 'categories') {
              return searchParams.categories;
            }
            if (viewType === 'brands') {
              return searchParams.requiredBrands;
            }
            return searchParams.keyword;
          };

          const viewType = getViewType();
          const keyword = getKeywordByViewType(viewType);

          if (findProductKeyword.isNew) {
            productKeywordViewMutate(findProductKeyword.id, {
              onSettled: () =>
                router.push({
                  pathname: `/products/${viewType}/${encodeURIComponent(String(keyword))}`,
                  query: { ...searchParams }
                })
            });
          } else {
            router.push({
              pathname: `/products/${viewType}/${encodeURIComponent(String(keyword))}`,
              query: { ...searchParams }
            });
          }

          return;
        }
        setOpenToast(true);
        return;
      }
      router.push(notification.parameter);
    }
  };

  return (
    <Flexbox onClick={handleClick}>
      {type === 'honeyNoti' && (
        <Box
          customStyle={{
            marginRight: 16,
            minWidth: 48
          }}
        >
          <Image
            src={notification.image ?? ''}
            width={48}
            height={48}
            disableAspectRatio
            alt="Notification Img"
            style={{ borderRadius: '50%' }}
          />
        </Box>
      )}
      <Flexbox
        direction="vertical"
        gap={4}
        onClick={() => {
          return false;
        }}
      >
        <Typography variant="body1" dangerouslySetInnerHTML={{ __html: notification.message }} />
        <Typography variant="small2" customStyle={{ color: common.grey[60] }}>
          {getFormattedDistanceTime(new Date(notification.dateCreated.replace(/-/g, '/')))}
        </Typography>
      </Flexbox>
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        <Typography customStyle={{ color: common.white }}>
          지금은 존재하지 않는 매물 목록이에요.
        </Typography>
      </Toast>
    </Flexbox>
  );
}

export default UserNotificationItem;
