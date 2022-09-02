import { useCallback, useEffect, useRef } from 'react';
import type { UIEvent } from 'react';

import { useRecoilState } from 'recoil';
import { Chip, Flexbox, Typography } from 'mrcamel-ui';
import throttle from 'lodash-es/throttle';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { creazycurationSelectedTabState } from '@recoil/crazycuration';
import useContentsProducts from '@hooks/useContentsProducts';

import CrazycurationWishButton from './CrazycurationWishButton';

interface CrazycurationTabListProps {
  contentsId: number;
  brandData: { id: number; name: string }[];
  onProductAtt: (product: ProductResult, index: number) => Record<string, string | number>;
  onClickProduct: (product: ProductResult, index: number) => () => void;
  handleClickWishButtonEvent: (product: ProductResult, index: number) => () => void;
}

function CrazycurationTabList({
  contentsId,
  brandData,
  onProductAtt,
  onClickProduct,
  handleClickWishButtonEvent
}: CrazycurationTabListProps) {
  const [{ selectedIndex, prevScroll }, setSelectedTabState] = useRecoilState(
    creazycurationSelectedTabState
  );

  const {
    isLoading,
    data: { products },
    refetch
  } = useContentsProducts(contentsId);

  const tabRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const throttleScroll = useRef(
    throttle((e: UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget?.scrollLeft;

      if (scrollLeft) {
        setSelectedTabState((currVal) => ({ ...currVal, prevScroll: scrollLeft }));
      }
    }, 200)
  );
  const debounceScroll = useRef(
    debounce(() => {
      logEvent(attrKeys.crazycuration.swipeXTag, { name: attrProperty.name.crazyWeek });
    }, 500)
  ).current;

  const handleTabScroll = (e: UIEvent<HTMLDivElement>) => {
    throttleScroll.current(e);
    debounceScroll();
  };

  const handleClickTab = useCallback(
    (index: number, name: string) => () => {
      listRef.current?.scrollTo(0, 0);

      if (selectedIndex !== index) {
        if (contentsId === 1) {
          logEvent(attrKeys.crazycuration.clickTag, {
            name: attrProperty.name.crazyWeek,
            title: attrProperty.title.quick,
            att: name
          });
        }

        setSelectedTabState((currVal) => ({ ...currVal, selectedIndex: index }));
      }
    },
    [contentsId, selectedIndex, setSelectedTabState]
  );

  useEffect(() => {
    if (tabRef.current && prevScroll) {
      tabRef.current.scrollTo(prevScroll, 0);
    }
  }, [prevScroll]);

  return (
    <Flexbox direction="vertical" gap={32}>
      <TabList ref={tabRef} onScroll={handleTabScroll}>
        {brandData.map(({ id, name }, index) => (
          <Tab
            key={`crazycuration-tab-${id}`}
            isActive={selectedIndex === index}
            variant="contained"
            onClick={handleClickTab(index, name)}
          >
            <Typography variant="h4" weight={selectedIndex === index ? 'bold' : 'regular'}>
              {name}
            </Typography>
          </Tab>
        ))}
      </TabList>
      <ProductList ref={listRef}>
        {isLoading
          ? Array.from({ length: 8 }, (_, index) => (
              <Flexbox key={`crazycuration-card-skeleton-${index}`} direction="vertical" gap={20}>
                <ProductGridCardSkeleton
                  isRound
                  hasAreaWithDateInfo={false}
                  customStyle={{ minWidth: 144, flex: 1 }}
                />
                <Skeleton disableAspectRatio isRound height="32px" />
              </Flexbox>
            ))
          : products
              .filter(
                (product) => selectedIndex === 0 || brandData[selectedIndex].id === product.brand.id
              )
              .map((product, index) => {
                return (
                  <Flexbox
                    key={`crazycuration-product-${product.id}`}
                    direction="vertical"
                    gap={20}
                  >
                    <ProductGridCard
                      product={product}
                      hideProductLabel
                      hideLegitStatusLabel
                      showTodayWishViewLabel
                      showCountLabel
                      hideWishButton
                      name={attrProperty.productName.MAIN}
                      source={attrProperty.productSource.MAIN_MYLIST}
                      productAtt={onProductAtt(product, index + 1)}
                      onClick={onClickProduct(product, index + 1)}
                      compact
                      isRound
                      isDark
                      customStyle={{ marginBottom: 'auto' }}
                    />
                    <CrazycurationWishButton
                      listType="a"
                      productId={product.id}
                      isWish={product.isWish}
                      refetch={refetch}
                      handleClickWishButtonEvent={handleClickWishButtonEvent(product, index + 1)}
                    />
                  </Flexbox>
                );
              })}
      </ProductList>
    </Flexbox>
  );
}

const TabList = styled.div`
  display: flex;
  column-gap: 8px;
  padding: 0 20px;
  overflow-x: auto;
`;

const Tab = styled(Chip)<{ isActive: boolean }>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.palette.common.black : theme.palette.common.grey['20']};
  background-color: ${({ theme, isActive }) =>
    isActive ? '#ACFF25' : theme.palette.common.grey['60']};
  white-space: nowrap;
`;

const ProductList = styled.div`
  padding: 0 20px;
  display: grid;
  gap: 32px 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

export default CrazycurationTabList;
