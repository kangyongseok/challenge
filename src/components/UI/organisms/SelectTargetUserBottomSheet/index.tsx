import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { BottomSheet, Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { FixedProductInfo } from '@components/UI/molecules';
import { ChannelsMessagesPanel } from '@components/pages/channels';

import { logEvent } from '@library/amplitude';

import { fetchProduct, putProductUpdateStatus } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelBottomSheetStateFamily } from '@recoil/channel';

interface SelectTargetUserBottomSheetProps {
  productId: number;
  isChannel?: boolean;
}

function SelectTargetUserBottomSheet({
  productId,
  isChannel = false
}: SelectTargetUserBottomSheetProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [{ open, location }, setSelectTargetUserBottomSheetState] = useRecoilState(
    channelBottomSheetStateFamily('selectTargetUser')
  );

  const { isLoading: isLoadingProduct, data: { product } = {} } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      enabled: !!productId
    }
  );
  const { mutate: mutatePutProductUpdateStatus, isLoading: isLoadingMutatePutProductUpdateStatus } =
    useMutation(putProductUpdateStatus);

  const handleClick = () => {
    if (isLoadingProduct || isLoadingMutatePutProductUpdateStatus) return;

    logEvent(attrKeys.channel.CLICK_OTHER, { name: attrProperty.name.CHANNEL, att: location });

    setSelectTargetUserBottomSheetState({ open: false, isChannel });
    mutatePutProductUpdateStatus(
      {
        productId,
        status: 1,
        soldType: 0
      },
      {
        onSuccess() {
          const queryClient = new QueryClient();

          queryClient.refetchQueries(queryKeys.products.product({ productId }));
          queryClient.invalidateQueries(queryKeys.channels.channels({ type: 1, size: 100 }));
          queryClient.invalidateQueries(queryKeys.users.products({ page: 0, status: [0, 4] }));
        }
      }
    );
  };

  useEffect(() => {
    if (open) logEvent(attrKeys.channel.VIEW_SELECT_BUYER);
  }, [open]);

  return (
    <BottomSheet
      disableSwipeable
      open={open}
      onClose={() => {
        //
      }}
    >
      <Box customStyle={{ userSelect: 'none', position: 'relative', paddingTop: 20 }}>
        <Box customStyle={{ minHeight: 'fit-content', marginBottom: 20 }}>
          <Title variant="h2" weight="bold">
            거래한 사람을 선택해주세요.
          </Title>
          <FixedProductInfo
            isLoading={isLoadingProduct}
            isChannel={isChannel}
            image={product?.imageThumbnail || product?.imageMain || ''}
            status={1}
            title={product?.title || ''}
            price={product?.price || 0}
            customStyle={{
              top: 84,
              minHeight: 68,
              padding: '0 20px',
              '& > div': {
                padding: '0 0 20px',
                width: 'calc(100% - 40px)'
              }
            }}
          />
        </Box>
        <Box>
          <ChannelsMessagesPanel
            type={1}
            productId={productId}
            isSelectTargetUser
            customStyle={{ margin: 0 }}
          />
          <Flexbox
            direction="vertical"
            alignment="center"
            customStyle={{ padding: '32px 20px' }}
            gap={20}
          >
            <Typography variant="h4" weight="medium" customStyle={{ color: common.ui60 }}>
              다른 플랫폼에서 판매하셨나요?
            </Typography>
            <Button
              size="medium"
              variant="ghost"
              brandColor="black"
              customStyle={{ padding: '8px 10px' }}
              onClick={handleClick}
            >
              네, 다른곳에서 판매했어요.
            </Button>
          </Flexbox>
        </Box>
      </Box>
    </BottomSheet>
  );
}

const Title = styled(Typography)`
  padding: 32px 20px 20px;
  position: fixed;
  width: 100%;
  z-index: 1;
  background-color: ${({ theme: { palette } }) => palette.common.cmnW};
  border-radius: 16px 16px 0 0;
`;

export default SelectTargetUserBottomSheet;
