import { useEffect } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { BottomSheet, Box, Button, Flexbox, Typography } from 'mrcamel-ui';

import { Image } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';

function UserShopProductSoldOutConfirmBottomSheet() {
  const [{ open }, setOpenState] = useRecoilState(userShopOpenStateFamily('soldOutConfirm'));
  const setOpenSoldOutFeedbackState = useSetRecoilState(userShopOpenStateFamily('soldOutFeedback'));

  const { id, imageMain, imageThumbnail } = useRecoilValue(userShopSelectedProductState);

  const { mutate: updateStatusMutate } = useMutation(putProductUpdateStatus, {
    onSettled: () => {
      setOpenSoldOutFeedbackState(({ type }) => ({
        type,
        open: true
      }));
      setOpenState(({ type }) => ({
        type,
        open: false
      }));
    }
  });

  const handleClick = (option?: string) => {
    if (!id) return;
    logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT_MODAL, {
      name: attrProperty.name.MY_STORE,
      title: attrProperty.title.SOLD_SURVEY,
      att: option === 'other' ? 'OTHER' : 'CAMEL'
    });

    updateStatusMutate({ productId: id, status: 1 });
  };

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODAL, {
        name: attrProperty.name.MY_STORE,
        title: attrProperty.title.SOLD_SURVEY
      });
    }
  }, [open]);

  return (
    <BottomSheet
      open={open}
      onClose={() =>
        setOpenState(({ type }) => ({
          type,
          open: false
        }))
      }
      disableSwipeable
    >
      <Box customStyle={{ padding: '32px 20px', textAlign: 'center' }}>
        <Box customStyle={{ width: 72, height: 72, margin: 'auto' }}>
          <Image
            variant="backgroundImage"
            src={imageMain || imageThumbnail}
            alt="SoldOut Product Img"
            customStyle={{ borderRadius: 12 }}
          />
        </Box>
        <Typography variant="h3" weight="bold" customStyle={{ marginTop: 20 }}>
          이 매물을 카멜에서 판매하셨나요?
        </Typography>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
          <Button
            variant="ghost"
            size="xlarge"
            brandColor="primary"
            fullWidth
            onClick={() => handleClick()}
          >
            네, 카멜에서 판매했어요
          </Button>
          <Button variant="ghost" size="xlarge" fullWidth onClick={() => handleClick('other')}>
            다른 곳에서 판매했어요
          </Button>
        </Flexbox>
      </Box>
    </BottomSheet>
  );
}

export default UserShopProductSoldOutConfirmBottomSheet;
