import { useEffect } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';
import { useMutation } from '@tanstack/react-query';

import { logEvent } from '@library/amplitude';

import { deleteProduct } from '@api/product';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import { toastState } from '@recoil/common';

const TOAST_BOTTOM = 20;

function UserShopProductDeleteConfirmDialog({ redirect }: { redirect?: boolean }) {
  const router = useRouter();

  const [{ open }, setOpenState] = useRecoilState(userShopOpenStateFamily('deleteConfirm'));
  // const setOpenDeleteFeedbackState = useSetRecoilState(userShopOpenStateFamily('deleteFeedback'));
  const { id } = useRecoilValue(userShopSelectedProductState);
  const { mutate: deleteMutation } = useMutation(deleteProduct);
  const setToastState = useSetRecoilState(toastState);

  const handleClick = () => {
    if (!id) return;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: attrProperty.name.MY_STORE,
      title: attrProperty.title.DELETE,
      att: 'DELETE'
    });

    deleteMutation(
      { productId: id },
      {
        onSuccess() {
          setToastState({
            type: 'sellerProductState',
            status: 'deleted',
            customStyle: { bottom: TOAST_BOTTOM }
          });
          setOpenState(({ type }) => ({
            type,
            open: false
          }));

          if (redirect) {
            router.replace('/user/shop');
          }
        }
      }
    );
  };

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_POPUP, {
        name: attrProperty.name.MY_STORE,
        title: attrProperty.title.DELETE
      });
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() =>
        setOpenState(({ type }) => ({
          type,
          open: false
        }))
      }
      customStyle={{ minWidth: 311, padding: '32px 20px 20px' }}
    >
      <Flexbox direction="vertical" gap={32}>
        <Typography variant="h3" weight="bold" customStyle={{ textAlign: 'center' }}>
          정말 삭제할까요?
        </Typography>
        <Flexbox gap={8}>
          <Button
            variant="ghost"
            size="large"
            fullWidth
            onClick={() => {
              logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
                name: attrProperty.name.MY_STORE,
                title: attrProperty.title.DELETE,
                att: 'CANCLE'
              });

              setOpenState(({ type }) => ({
                type,
                open: false
              }));
            }}
          >
            취소
          </Button>
          <Button variant="solid" size="large" brandColor="black" fullWidth onClick={handleClick}>
            삭제하기
          </Button>
        </Flexbox>
      </Flexbox>
    </Dialog>
  );
}

export default UserShopProductDeleteConfirmDialog;
