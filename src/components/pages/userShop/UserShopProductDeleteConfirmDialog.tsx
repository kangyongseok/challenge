import { useEffect, useMemo } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Button, Dialog, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { deleteProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';

function UserShopProductDeleteConfirmDialog({ redirect }: { redirect?: boolean }) {
  const router = useRouter();
  const { tab } = router.query;

  const queryClient = useQueryClient();

  const toastStack = useToastStack();

  const params = useMemo(
    () => ({
      page: 0,
      status: tab === '0' ? [Number(tab || 0), 4, 8, 20, 21] : [1]
    }),
    [tab]
  );

  const [{ open }, setOpenState] = useRecoilState(userShopOpenStateFamily('deleteConfirm'));
  const { id } = useRecoilValue(userShopSelectedProductState);

  const { mutate: deleteMutation } = useMutation(deleteProduct);

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
          toastStack({
            children: '상품이 삭제되었어요.'
          });
          setOpenState(({ type }) => ({
            type,
            open: false
          }));

          if (redirect) {
            router.replace('/user/shop');
          } else {
            queryClient.invalidateQueries(queryKeys.users.products(params));
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
