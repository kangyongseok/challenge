import { memo, useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Button, Icon } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import type { ProductContent } from '@dto/product';

import { postProductsAdd, postProductsRemove } from '@api/user';

import { deviceIdState } from '@recoil/common';
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

  const toastStack = useToastStack();

  const deviceId = useRecoilValue(deviceIdState);

  const { data: accessUser } = useQueryAccessUser();
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    onSuccess() {
      refetch();
      toastStack({
        children: '찜목록에 추가했어요!',
        action: {
          text: '찜목록 보기',
          onClick: () => router.push('/wishes')
        }
      });
    }
  });
  const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove, {
    onSuccess() {
      refetch();
      toastStack({
        children: '찜목록에서 삭제했어요.'
      });
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
