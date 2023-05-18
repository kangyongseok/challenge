import type { MouseEvent } from 'react';
import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { ProductDetail } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelBottomSheetStateFamily } from '@recoil/channel';
import useProductState from '@hooks/useProductState';
import useProductSellerType from '@hooks/useProductSellerType';

function ProductChangeStatusBottomSheet({
  open,
  data,
  getAttProperty,
  getTitle,
  setStatusBottomSheet
}: {
  open: boolean;
  data: ProductDetail | undefined;
  getAttProperty: object;
  getTitle: string;
  setStatusBottomSheet: (value: boolean) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSelectTargetUserBottomSheetState = useSetRecoilState(
    channelBottomSheetStateFamily('selectTargetUser')
  );

  const toastStack = useToastStack();
  const { isViewProductModifySellerType } = useProductSellerType({
    productSellerType: data?.product.productSeller.type,
    site: data?.product.site
  });
  const { isViewReservationState, isSoldOut, isHidden, isForSale } = useProductState({
    productDetail: data,
    product: data?.product
  });

  const queryId = router.query.id as string;
  const splitRouter = queryId?.split('-');
  const parameter = {
    productId:
      splitRouter.length === 1 ? Number(queryId) : Number(splitRouter[splitRouter.length - 1])
  };

  const { mutate: updateMutation } = useMutation(putProductUpdateStatus);

  const getAtt = useCallback((dataStatus: number) => {
    switch (dataStatus) {
      case 0:
        return 'FORSALE';
      case 1:
        return 'SOLD';
      default:
        return 'RESERVED';
    }
  }, []);

  const handleClickStatus = (e: MouseEvent<HTMLDivElement>) => {
    const { dataset } = e.currentTarget as HTMLDivElement;

    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: getAtt(Number(dataset.statusId)),
      ...getAttProperty
    });

    if (Number(dataset.statusId) === 1) {
      setStatusBottomSheet(false);

      updateMutation(
        { productId: parameter.productId, status: 1 },
        {
          onSuccess() {
            queryClient.invalidateQueries({
              queryKey: queryKeys.products.product({ productId: parameter.productId }),
              refetchType: 'active'
            });
            setTimeout(() => {
              setSelectTargetUserBottomSheetState({
                open: true,
                isChannel: false,
                location: 'PRODUCT_DETAIL'
              });
            }, 500);
          }
        }
      );

      return;
    }

    updateMutation(
      {
        ...parameter,
        status: Number(dataset.statusId)
      },
      {
        onSuccess() {
          if (Number(dataset.statusId) === 0) {
            toastStack({
              children: '판매중으로 변경되었어요.'
            });
          } else if (Number(dataset.statusId) === 4) {
            toastStack({
              children: '예약중으로 변경되었어요.'
            });
          }
          queryClient.invalidateQueries({
            queryKey: queryKeys.products.product({ productId: parameter.productId }),
            refetchType: 'active'
          });
          setStatusBottomSheet(false);
        }
      }
    );
  };

  return (
    <BottomSheet open={open} onClose={() => setStatusBottomSheet(false)} disableSwipeable>
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
        <Flexbox direction="vertical">
          {isViewReservationState && isViewProductModifySellerType && (
            <Menu variant="h3" weight="medium" data-status-id={4} onClick={handleClickStatus}>
              예약중으로 변경
            </Menu>
          )}
          {!isSoldOut && !isHidden && (
            <Menu variant="h3" weight="medium" data-status-id={1} onClick={handleClickStatus}>
              판매완료로 변경
            </Menu>
          )}
          {!isForSale && (
            <Menu variant="h3" weight="medium" data-status-id={0} onClick={handleClickStatus}>
              판매중으로 변경
            </Menu>
          )}
          {isForSale && (
            <Menu variant="h3" weight="medium" data-status-id={8} onClick={handleClickStatus}>
              숨기기
            </Menu>
          )}
        </Flexbox>
        <Button
          fullWidth
          variant="ghost"
          brandColor="black"
          size="xlarge"
          onClick={() => setStatusBottomSheet(false)}
        >
          취소
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

export default ProductChangeStatusBottomSheet;
