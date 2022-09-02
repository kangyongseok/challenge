import { memo, useCallback } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Icon } from 'mrcamel-ui';

import type { ProductContent } from '@dto/product';

import { postProductsAdd, postProductsRemove } from '@api/user';

import { deviceIdState, toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const colorData = {
  a: {
    button: {
      color: '#FFFFFF',
      backgroundColor: '#313438'
    },
    selectedButton: {
      color: '#ACFF25',
      backgroundColor: '#000000',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  },
  b: {
    button: {
      color: '#313438',
      backgroundColor: '#FFFFFF',
      boxShadow:
        '0px 1px 2px rgba(194, 102, 53, 0.3), inset 0px -1px 2px rgba(0, 0, 0, 0.08), inset 0px 1px 2px rgba(255, 255, 255, 0.5)'
    },
    selectedButton: {
      color: '#313438',
      backgroundColor: '#EFE3C9',
      border: 'none'
    }
  }
};

interface CrazycurationWishButtonProps {
  listType: 'a' | 'b';
  productId: number;
  isWish: boolean;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ProductContent, unknown>>;
  handleClickWishButtonEvent: () => void;
}

function CrazycurationWishButton({
  listType,
  productId,
  isWish,
  refetch,
  handleClickWishButtonEvent
}: CrazycurationWishButtonProps) {
  const router = useRouter();

  const deviceId = useRecoilValue(deviceIdState);
  const setToastState = useSetRecoilState(toastState);

  const { data: accessUser } = useQueryAccessUser();
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    onSuccess() {
      refetch();
      setToastState({
        type: 'product',
        status: 'successAddWish',
        action: () => router.push('/wishes')
      });
    }
  });
  const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove, {
    onSuccess() {
      refetch();
      setToastState({ type: 'product', status: 'successRemoveWish' });
    }
  });

  const handleClickWish = useCallback(() => {
    handleClickWishButtonEvent();

    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      return;
    }

    if (isWish) {
      mutatePostProductsRemove({ productId, deviceId });
    } else {
      mutatePostProductsAdd({ productId, deviceId });
    }
  }, [
    accessUser,
    deviceId,
    handleClickWishButtonEvent,
    isWish,
    mutatePostProductsAdd,
    mutatePostProductsRemove,
    productId,
    router
  ]);

  return (
    <Button
      brandColor="black"
      variant={isWish ? 'outlined' : 'contained'}
      fullWidth
      size="small"
      customStyle={{
        ...colorData[listType][isWish ? 'selectedButton' : 'button']
      }}
      onClick={handleClickWish}
    >
      {isWish ? (
        <Icon
          name="HeartFilled"
          color={colorData[listType][isWish ? 'selectedButton' : 'button'].color}
        />
      ) : (
        <Icon
          name="HeartOutlined"
          color={colorData[listType][isWish ? 'selectedButton' : 'button'].color}
        />
      )}
      {isWish ? '찜' : '찜하기'}
    </Button>
  );
}

export default memo(CrazycurationWishButton);
