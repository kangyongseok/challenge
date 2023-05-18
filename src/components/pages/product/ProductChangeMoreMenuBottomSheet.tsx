import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { ProductDetail } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';
import useProductState from '@hooks/useProductState';
import useProductSellerType from '@hooks/useProductSellerType';

import { UserShopProductDeleteConfirmDialog } from '../userShop';

function ProductChangeMoreMenuBottomSheet({
  open,
  data,
  getAttProperty,
  getTitle,
  setMoreMenuBottomSheet
}: {
  open: boolean;
  data: ProductDetail | undefined;
  getAttProperty: object;
  getTitle: string;
  setMoreMenuBottomSheet: (value: boolean) => void;
}) {
  const router = useRouter();
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setOpenDelete = useSetRecoilState(userShopOpenStateFamily('deleteConfirm'));
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);

  const { isViewProductModifySellerType } = useProductSellerType({
    productSellerType: data?.product.productSeller.type,
    site: data?.product.site
  });
  const { isDeleted, isSoldOut } = useProductState({ productDetail: data, product: data?.product });

  const queryId = router.query.id as string;
  const splitRouter = queryId?.split('-');
  const parameter = {
    productId:
      splitRouter.length === 1 ? Number(queryId) : Number(splitRouter[splitRouter.length - 1])
  };

  const handleClickEdit = () => {
    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }
    }

    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_DETAIL,
      ...getAttProperty
    });

    SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
    resetTempData();

    router.push(`/camelSeller/registerConfirm/${parameter.productId}`);
  };

  const handleClickDelete = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: 'DELETE',
      ...getAttProperty
    });

    setUserShopSelectedProductState({ id: data?.product.id });
    setMoreMenuBottomSheet(false);
    setOpenDelete(({ type }) => ({
      type,
      open: true
    }));
  };

  return (
    <>
      <BottomSheet open={open} onClose={() => setMoreMenuBottomSheet(false)} disableSwipeable>
        <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
          <Flexbox direction="vertical">
            {!isSoldOut && isViewProductModifySellerType && (
              <Menu variant="h3" weight="medium" data-status-id={8} onClick={handleClickEdit}>
                수정
              </Menu>
            )}
            {!isDeleted && (
              <Menu
                variant="h3"
                weight="medium"
                data-status-id={8}
                onClick={handleClickDelete}
                color="red-light"
              >
                삭제
              </Menu>
            )}
          </Flexbox>
          <Button
            fullWidth
            variant="ghost"
            brandColor="black"
            size="xlarge"
            onClick={() => setMoreMenuBottomSheet(false)}
          >
            취소
          </Button>
        </Flexbox>
      </BottomSheet>
      <UserShopProductDeleteConfirmDialog redirect />
    </>
  );
}

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

export default ProductChangeMoreMenuBottomSheet;
