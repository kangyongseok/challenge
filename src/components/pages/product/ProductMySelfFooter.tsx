import { useMemo, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import SelectTargetUserBottomSheet from '@components/UI/organisms/SelectTargetUserBottomSheet';
import { AppUpdateForChatDialog } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { putProductHoisting } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, needUpdateChatIOSVersion } from '@utils/common';

import { userShopSelectedProductState } from '@recoil/userShop';
import useQueryProduct from '@hooks/useQueryProduct';
import useProductState from '@hooks/useProductState';
import useInfiniteQueryChannels from '@hooks/useInfiniteQueryChannels';

import ProductChangeStatusBottomSheet from './ProductChangeStatusBottomSheet';
import ProductChangeMoreMenuBottomSheet from './ProductChangeMoreMenuBottomSheet';

function ProductMySelfFooter() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQueryProduct();
  const { isForSale, isReservation } = useProductState({
    productDetail: data,
    product: data?.product
  });
  const toastStack = useToastStack();

  const [openStatusBottomSheet, setStatusBottomSheet] = useState(false);
  const [openMoreMenuBottomSheet, setMoreMenuBottomSheet] = useState(false);
  const [open, setOpen] = useState(false);

  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);

  const { mutate: hoistingMutation } = useMutation(putProductHoisting);

  const queryId = router.query.id as string;
  const splitRouter = queryId?.split('-');
  const parameter = {
    productId:
      splitRouter.length === 1 ? Number(queryId) : Number(splitRouter[splitRouter.length - 1])
  };

  const { totalChannelCount } = useInfiniteQueryChannels({
    type: 1,
    productId: parameter.productId,
    size: 1
  });

  const getTitle = useMemo(() => {
    if (isForSale) return attrProperty.title.SALE;
    if (isReservation) return attrProperty.title.RESERVED;
    return attrProperty.title.SOLD;
  }, [isForSale, isReservation]);

  const getAttProperty = {
    id: data?.product.id,
    brand: data?.product.brand.name,
    category: data?.product.category.name,
    parentCategory: FIRST_CATEGORIES[data?.product.category.id as number],
    line: data?.product.line,
    site: data?.product.site.name,
    price: data?.product.price,
    scoreTotal: data?.product.scoreTotal,
    scoreStatus: data?.product.scoreStatus,
    scoreSeller: data?.product.scoreSeller,
    scorePrice: data?.product.scorePrice,
    scorePriceAvg: data?.product.scorePriceAvg,
    scorePriceCount: data?.product.scorePriceCount,
    scorePriceRate: data?.product.scorePriceRate
  };

  const handleClickHoisting = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: getTitle,
      att: 'UP',
      ...getAttProperty
    });

    hoistingMutation(parameter, {
      onSuccess() {
        toastStack({
          children: '끌어올리기가 완료되었어요. 👍'
        });
        setStatusBottomSheet(false);
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.product({ productId: parameter.productId }),
          refetchType: 'active'
        });
      }
    });
  };

  const handleClickChannel = () => {
    logEvent(attrKeys.channel.CLICK_CHANNEL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT
    });

    if (needUpdateChatIOSVersion()) {
      setOpen(true);
      return;
    }

    router.push({
      pathname: '/channels',
      query: { productId: parameter.productId, type: 1 }
    });
  };

  return (
    <>
      <StyledWrap>
        <MySelfBottomNav alignment="center" justifyContent="space-between" gap={8}>
          <Flexbox
            direction="vertical"
            gap={4}
            customStyle={{
              minWidth: 112,
              borderRight: `1px solid ${common.line01}`
            }}
          >
            <Typography
              weight="bold"
              customStyle={{
                fontSize: 20
              }}
            >
              {commaNumber(getTenThousandUnitPrice(data?.product.price || 0))}만원
            </Typography>
            <Typography weight="medium" onClick={handleClickChannel} color="primary-light">
              채팅목록 {totalChannelCount || 0}
            </Typography>
          </Flexbox>
          <Flexbox
            customStyle={{
              flexGrow: 1
            }}
          >
            {isForSale && (
              <Flexbox
                direction="vertical"
                alignment="center"
                gap={7}
                customStyle={{ flex: 1 }}
                onClick={handleClickHoisting}
              >
                <Icon name="PullUpOutlined" color="ui60" />
                <Typography draggable={false} variant="body2" weight="medium" color="ui60">
                  끌어올리기
                </Typography>
              </Flexbox>
            )}
            <Flexbox
              direction="vertical"
              alignment="center"
              gap={7}
              customStyle={{ flex: 1 }}
              onClick={() => {
                setStatusBottomSheet(true);
                if (data?.product) setUserShopSelectedProductState(data.product);
              }}
            >
              <Icon name="ChangeStatusOutlined" color="ui60" />
              <Typography draggable={false} variant="body2" weight="medium" color="ui60">
                상태변경
              </Typography>
            </Flexbox>
            <Flexbox
              direction="vertical"
              alignment="center"
              gap={7}
              customStyle={{ flex: 1 }}
              onClick={() => setMoreMenuBottomSheet(true)}
            >
              <Icon name="MoreHorizFilled" color="ui60" />
              <Typography draggable={false} variant="body2" weight="medium" color="ui60">
                더보기
              </Typography>
            </Flexbox>
          </Flexbox>
        </MySelfBottomNav>
      </StyledWrap>

      <ProductChangeStatusBottomSheet
        open={openStatusBottomSheet}
        data={data}
        getAttProperty={getAttProperty}
        getTitle={getTitle}
        setStatusBottomSheet={setStatusBottomSheet}
      />
      <ProductChangeMoreMenuBottomSheet
        open={openMoreMenuBottomSheet}
        data={data}
        getAttProperty={getAttProperty}
        getTitle={getTitle}
        setMoreMenuBottomSheet={setMoreMenuBottomSheet}
      />
      {data?.product && <SelectTargetUserBottomSheet productId={data.product.id} />}
      <AppUpdateForChatDialog open={open} />
    </>
  );
}

const StyledWrap = styled.div`
  width: 100%;
  min-height: 77px;
`;

const MySelfBottomNav = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  left: 0;
  background: white;
  width: 100%;
  height: 77px;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav + 1};
  padding: 13px 12px 13px 20px;
  box-shadow: 0px -4px 8px rgba(0, 0, 0, 0.12);
`;

export default ProductMySelfFooter;
