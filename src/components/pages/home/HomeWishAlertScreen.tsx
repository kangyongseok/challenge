import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Backdrop, Chip, Flexbox, Icon } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { ProductResult } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { fetchRecommWishes } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { RECOMM_WISH_IDS } from '@constants/localStorage';

import useSession from '@hooks/useSession';

import HomeRecommendWishCard from './HomeRecommendWishCard';

function HomeWishAlertScreen() {
  const router = useRouter();

  const {
    palette: { common }
  } = useTheme();

  const { isLoggedIn } = useSession();

  const [open, setOpen] = useState(false);
  const [toggle, setToggle] = useState(true);

  const cardClickCheckRef = useRef(false);

  const { data = [], isFetching } = useQuery(queryKeys.users.recommWishes(), fetchRecommWishes, {
    enabled: isLoggedIn,
    refetchOnMount: true
  });

  const [sortedData, setSortedData] = useState<ProductResult[]>([]);

  const handleClick = () => setToggle(false);

  const handleClickWishChip = () => router.push('/wishes');

  const handleUpdateRecommWishIds = (excludeId: number) => () => {
    if (!sortedData.length) return;

    const newRecommWishIds = sortedData.map(({ id }) => id).filter((id) => id !== excludeId);

    cardClickCheckRef.current = true;

    setOpen(false);

    if (newRecommWishIds.length) {
      LocalStorage.set(RECOMM_WISH_IDS, newRecommWishIds);
    }
  };

  const handleClose = () => {
    setOpen(false);
    LocalStorage.set(
      RECOMM_WISH_IDS,
      sortedData.map(({ id }) => id)
    );
  };

  useEffect(() => {
    if (!data || !data.length) return;

    const priceBeforeRecommWishes = data.filter(
      ({ priceBefore, price }) => priceBefore && priceBefore - price > 0
    );
    const cpRecommWishes = data.filter(
      ({ id, purchaseCount }) =>
        !priceBeforeRecommWishes.some(
          (priceBeforeRecommWishe) => id === priceBeforeRecommWishe.id
        ) && purchaseCount >= 6
    );
    const otherRecommWishes = data.filter(
      ({ id, priceBefore }) =>
        !priceBefore &&
        !priceBeforeRecommWishes.some(
          (priceBeforeRecommWishe) => id === priceBeforeRecommWishe.id
        ) &&
        !cpRecommWishes.some((cpRecommWishe) => id === cpRecommWishe.id)
    );

    setSortedData(
      [...priceBeforeRecommWishes, ...cpRecommWishes, ...otherRecommWishes].sort((a, b) => {
        if (a.id > b.id) {
          return 1;
        }
        if (a.id < b.id) {
          return -1;
        }
        return 0;
      })
    );
  }, [data]);

  useEffect(() => {
    if (!sortedData.length || isFetching) return;

    const recommWishIds = LocalStorage.get<number[]>(RECOMM_WISH_IDS) || [];

    if (sortedData.length && recommWishIds.length) {
      const newRecommWishIds = sortedData.map(({ id }) => id);

      setOpen(newRecommWishIds.join('') !== recommWishIds.join(''));
    } else if (sortedData.length && !recommWishIds.length) {
      setOpen(true);
    }
  }, [sortedData, isFetching]);

  useEffect(() => setToggle(sortedData.length > 1), [sortedData]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (open || !sortedData.length || cardClickCheckRef.current || isFetching) return;

      LocalStorage.set(
        RECOMM_WISH_IDS,
        sortedData.map(({ id }) => id)
      );
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [open, sortedData, router.events, isFetching]);

  return (
    <Backdrop open={open} onClose={() => setOpen(false)}>
      <Flexbox
        direction="vertical"
        gap={12}
        customStyle={{
          position: 'absolute',
          left: 12,
          bottom: toggle ? 20 : 12,
          width: 'calc(100% - 24px)',
          maxHeight: toggle ? 156 : '66.6%',
          minHeight: 156,
          transition: 'max-height 0.2s'
        }}
      >
        <Flexbox justifyContent="flex-end" gap={6}>
          <Chip
            variant="ghost"
            brandColor="black"
            size="large"
            startIcon={<Icon name="HeartFilled" color="red-light" />}
            onClick={handleClickWishChip}
            customStyle={{
              backgroundColor: common.uiWhite
            }}
          >
            찜한 매물
          </Chip>
          <Chip
            variant="ghost"
            brandColor="black"
            size="large"
            startIcon={
              <Icon
                name="CloseOutlined"
                customStyle={{
                  minWidth: 'fit-content'
                }}
              />
            }
            iconOnly
            onClick={handleClose}
            customStyle={{
              maxWidth: 36,
              borderRadius: 50,
              backgroundColor: common.uiWhite
            }}
          />
        </Flexbox>
        <Flexbox
          direction="vertical"
          gap={8}
          onClick={handleClick}
          customStyle={{
            marginTop: toggle ? 8 : undefined,
            flexGrow: 1,
            borderRadius: 12,
            overflowY: toggle ? undefined : 'auto'
          }}
        >
          {sortedData.map((productResult, index) => (
            <HomeRecommendWishCard
              key={`home-recommend-wish-card-${productResult.id}`}
              index={index + 1}
              productResult={productResult}
              onClick={handleUpdateRecommWishIds}
              customStyle={{
                backgroundColor: toggle && index ? common.bg02 : common.bg01,
                visibility:
                  (toggle && !index) || index === sortedData.length - 1 || !toggle
                    ? 'visible'
                    : 'hidden',
                transform: toggle
                  ? `translateY(${!index ? '-8px' : `-${118 * index}px`})${
                      index && sortedData.length > 1 ? ' scaleX(0.95)' : ''
                    }`
                  : undefined,
                transition: 'transform 0.4s',
                pointerEvents: toggle ? 'none' : 'auto',
                zIndex: !index ? 1 : undefined
              }}
            />
          ))}
        </Flexbox>
      </Flexbox>
    </Backdrop>
  );
}

export default HomeWishAlertScreen;
