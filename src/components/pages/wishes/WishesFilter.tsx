import { useState } from 'react';

import { useRouter } from 'next/router';
import { BottomSheet, Flexbox, Icon, Radio, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

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

  const {
    theme: { palette }
  } = useTheme();

  return (
    <Flexbox justifyContent="space-between" customStyle={{ marginBottom: 16 }}>
      <Typography variant="body2" weight="medium">
        찜한 매물 {userWishCount}개
      </Typography>
      {!hiddenTab && (
        <Flexbox>
          <Typography
            variant="body2"
            weight="medium"
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
          <Icon name="CaretDownOutlined" size="small" />
        </Flexbox>
      )}
      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        customStyle={{
          padding: '0 16px 0 13px;'
        }}
      >
        {orderOptions.map(([optionKey, optionName], i) => (
          <Flexbox
            key={`wishes-filter-bottomsheet-option-${optionKey}`}
            justifyContent="space-between"
            alignment="center"
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
            customStyle={{
              height: 48,
              borderBottom: `1px solid ${palette.common.grey[90]}`,
              cursor: 'pointer'
            }}
          >
            <Typography weight="bold">{optionName}</Typography>
            <Radio checked={optionKey === order} value={optionKey} onChange={() => false} />
          </Flexbox>
        ))}
      </BottomSheet>
    </Flexbox>
  );
}

export default WishesFilter;
