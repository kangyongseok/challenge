import { useEffect } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Box, Button, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';

function UserShopProductSoldOutConfirmBottomSheet() {
  const toastStack = useToastStack();

  const [{ open }, setOpenState] = useRecoilState(userShopOpenStateFamily('soldOutConfirm'));
  const setOpenSoldOutFeedbackState = useSetRecoilState(userShopOpenStateFamily('soldOutFeedback'));

  const product = useRecoilValue(userShopSelectedProductState) as Product;

  const { mutate: updateStatusMutate } = useMutation(putProductUpdateStatus, {
    onSuccess: () => {
      toastStack({
        children: '판매완료 처리되었어요!',
        bottom: 20
      });
    },
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

  const getAttProperty = {
    id: product.id,
    brand: product.brand?.name,
    category: product.category?.name,
    parentCategory: FIRST_CATEGORIES[product.category?.id as number],
    line: product.line,
    site: product.site?.name,
    price: product.price,
    scoreTotal: product.scoreTotal,
    scoreStatus: product.scoreStatus,
    scoreSeller: product.scoreSeller,
    scorePrice: product.scorePrice,
    scorePriceAvg: product.scorePriceAvg,
    scorePriceCount: product.scorePriceCount,
    scorePriceRate: product.scorePriceRate
  };

  const handleClick = (option?: string) => {
    if (!product.id) return;
    logEvent(attrKeys.camelSeller.SUBMIT_PRODUCT_MODAL, {
      name: attrProperty.name.MY_STORE,
      title: attrProperty.title.SOLD_SURVEY,
      att: option === 'other' ? 'OTHER' : 'CAMEL',
      ...getAttProperty
    });

    updateStatusMutate({ productId: product.id, status: 1, soldType: option === 'other' ? 1 : 0 });
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
            src={product.imageMain || product.imageThumbnail || ''}
            alt="SoldOut Product Img"
            round={12}
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
