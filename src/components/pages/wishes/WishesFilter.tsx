import { useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { openSoldoutDialogState } from '@recoil/wishes';

export type OrderOptionKeys =
  | 'updatedDesc'
  | 'updatedAsc'
  | 'priceAsc'
  | 'priceDesc'
  | 'datePostedDesc';

interface WishesFilterProps {
  order: OrderOptionKeys;
  userWishCount: number;
}

const orderOptions = [
  ['updatedDesc', '최근찜순'],
  ['updatedAsc', '오래된찜순'],
  ['priceAsc', '최저가순'],
  ['priceDesc', '높은가격순'],
  ['datePostedDesc', '최신순']
] as const;

type WishListOrderType = {
  [x: number]: string;
};

const WISH_LIST_EVENT_ORDER_PARAMETER: WishListOrderType = {
  1: 'RECENT_WISH',
  2: 'OLD_WISH',
  3: 'LOWP',
  4: 'HIGHP',
  5: 'RECENT'
} as const;

function WishesFilter({ order, userWishCount }: WishesFilterProps) {
  const router = useRouter();
  const { hiddenTab } = router.query;

  const selectedOrderOption = orderOptions.find(([optionKey]) => order === optionKey);
  const [open, setOpen] = useState(false);
  const openSoldoutDialog = useSetRecoilState(openSoldoutDialogState);

  const {
    theme: {
      palette: { common, primary }
    }
  } = useTheme();

  const handleClickSoldOutDelete = () => {
    // 판매완료 삭제 api 추가 필요
    logEvent(attrKeys.wishes.CLICK_DELETESOLDOUT_BUTTON, {
      name: attrProperty.name.wishList
    });

    openSoldoutDialog(true);
  };

  return (
    <Flexbox justifyContent="space-between" customStyle={{ marginBottom: 16 }}>
      <Flexbox alignment="center" gap={3}>
        <Typography customStyle={{ color: common.ui60 }}>찜한 매물</Typography>
        <Typography weight="bold"> {userWishCount}</Typography>
      </Flexbox>
      {!hiddenTab && (
        <Flexbox alignment="center" gap={12}>
          <Flexbox alignment="center">
            <Typography
              onClick={() => {
                logEvent(attrKeys.wishes.CLICK_SORT, {
                  name: 'WISH_LIST'
                });

                setOpen(true);
              }}
              customStyle={{ cursor: 'pointer' }}
            >
              {selectedOrderOption?.[1]}
            </Typography>
            <Icon name="DropdownFilled" viewBox="0 0 12 24" width="10px" height="20px" />
          </Flexbox>
          <Button
            size="small"
            startIcon={<Icon name="DeleteOutlined" />}
            onClick={handleClickSoldOutDelete}
          >
            판매완료 삭제
          </Button>
        </Flexbox>
      )}
      <BottomSheet
        open={open}
        disableSwipeable
        onClose={() => {
          setOpen(false);
        }}
        customStyle={{
          padding: '0 16px 0 13px;'
        }}
      >
        <Flexbox
          justifyContent="space-between"
          customStyle={{ margin: '16px 10px 24px 10px', textAlign: 'right' }}
        >
          <Typography variant="h3" weight="bold">
            정렬 필터
          </Typography>
          <Icon name="CloseOutlined" size="large" onClick={() => setOpen(false)} />
        </Flexbox>
        {orderOptions.map(([optionKey, optionName], i) => (
          <FilterOption
            key={`wishes-filter-bottomsheet-option-${optionKey}`}
            justifyContent="space-between"
            alignment="center"
            isActive={optionKey === order}
            onClick={() => {
              logEvent(attrKeys.wishes.SELECT_SORT, {
                title: 'WISH_LIST',
                order: WISH_LIST_EVENT_ORDER_PARAMETER[i + 1]
              });

              setOpen(false);
              router.push({
                pathname: '/wishes',
                query: {
                  tab: 'wish',
                  order: optionKey
                }
              });
            }}
          >
            <Typography
              weight="medium"
              customStyle={{ color: optionKey === order ? primary.main : common.ui20 }}
            >
              {optionName}
            </Typography>
          </FilterOption>
        ))}
      </BottomSheet>
    </Flexbox>
  );
}

const FilterOption = styled(Flexbox)<{ isActive: boolean }>`
  cursor: pointer;
  height: 41px;
  line-height: 41px;
  padding: 0 12px;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['8']};
  ${({
    theme: {
      palette: { primary }
    },
    isActive
  }): CSSObject =>
    isActive
      ? {
          backgroundColor: primary.highlight
        }
      : {}};
`;

export default WishesFilter;
