import { memo, useCallback } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Icon } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import type { ProductContent } from '@dto/product';

import { postProductsAdd, postProductsRemove } from '@api/user';

import { deviceIdState, toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface CrazycurationWishButtonProps {
  productId: number;
  isWish: boolean;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ProductContent, unknown>>;
  handleClickWishButtonEvent: () => void;
  buttonStyle: {
    button: CustomStyle;
    selectedButton: CustomStyle;
  };
}

function CrazycurationWishButton({
  productId,
  isWish,
  refetch,
  handleClickWishButtonEvent,
  buttonStyle: { button, selectedButton }
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
      variant={isWish ? 'outline' : 'solid'}
      fullWidth
      size="small"
      customStyle={isWish ? selectedButton : button}
      onClick={handleClickWish}
    >
      <Icon
        name={isWish ? 'HeartFilled' : 'HeartOutlined'}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        color={isWish ? selectedButton.color : button.color}
      />
      {isWish ? '찜' : '찜하기'}
    </Button>
  );
}

export default memo(CrazycurationWishButton);
