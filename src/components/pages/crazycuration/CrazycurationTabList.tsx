import { useCallback, useEffect, useRef } from 'react';
import type { UIEvent } from 'react';

import { useRecoilState } from 'recoil';
import throttle from 'lodash-es/throttle';
import debounce from 'lodash-es/debounce';
import { Chip, Flexbox, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

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
  tabStyle?: {
    color: string;
    backgroundColor: string;
    activeColor: string;
    activeBackgroundColor: string;
  };
  productCardStyle: {
    todayWishViewLabelCustomStyle?: CustomStyle;
    areaWithDateInfoCustomStyle?: CustomStyle;
    metaCamelInfoCustomStyle?: CustomStyle;
  };
  wishButtonStyle: {
    button: CustomStyle;
    selectedButton: CustomStyle;
  };
  showCountLabel?: boolean;
  onProductAtt: (product: ProductResult, index: number) => Record<string, string | number>;
  onClickProduct: (product: ProductResult, index: number) => () => void;
  handleClickWishButtonEvent: (product: ProductResult, index: number) => () => void;
}

function CrazycurationTabList({
  contentsId,
  brandData,
  tabStyle,
  productCardStyle: {
    todayWishViewLabelCustomStyle,
    areaWithDateInfoCustomStyle,
    metaCamelInfoCustomStyle
  },
  wishButtonStyle,
  showCountLabel = false,
  onProductAtt,
  onClickProduct,
  handleClickWishButtonEvent
}: CrazycurationTabListProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [{ selectedIndex, prevScroll }, setSelectedTabState] = useRecoilState(
    creazycurationSelectedTabState
  );

  const {
    isLoading,
    data: { contents: { contentsDetails: [contentsDetail] = [] } = {} },
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
            variant="solid"
            onClick={handleClickTab(index, name)}
            color={tabStyle?.color}
            backgroundColor={tabStyle?.backgroundColor}
            activeColor={tabStyle?.activeColor}
            activeBackgroundColor={tabStyle?.activeBackgroundColor}
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
                <Skeleton disableAspectRatio round={8} height={32} />
              </Flexbox>
            ))
          : contentsDetail?.products
              ?.filter(
                (product) => selectedIndex === 0 || brandData[selectedIndex].id === product.brand.id
              )
              .map((product, index) => (
                <Flexbox key={`crazycuration-product-${product.id}`} direction="vertical" gap={20}>
                  <ProductGridCard
                    product={product}
                    hideProductLabel
                    hideLegitStatusLabel
                    showTodayWishViewLabel
                    showCountLabel={showCountLabel}
                    hideWishButton
                    hidePlatformLogo
                    name={attrProperty.productName.MAIN}
                    source={attrProperty.productSource.MAIN_MYLIST}
                    productAtt={onProductAtt(product, index + 1)}
                    onClick={onClickProduct(product, index + 1)}
                    compact
                    isRound
                    customStyle={{ marginBottom: 'auto' }}
                    titlePriceStyle={{ color: common.uiWhite }}
                    todayWishViewLabelCustomStyle={todayWishViewLabelCustomStyle}
                    areaWithDateInfoCustomStyle={areaWithDateInfoCustomStyle}
                    metaCamelInfoCustomStyle={metaCamelInfoCustomStyle}
                  />
                  <CrazycurationWishButton
                    productId={product.id}
                    isWish={product.isWish}
                    refetch={refetch}
                    handleClickWishButtonEvent={handleClickWishButtonEvent(product, index + 1)}
                    buttonStyle={wishButtonStyle}
                  />
                </Flexbox>
              ))}
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

const Tab = styled(Chip)<{
  isActive: boolean;
  color?: string;
  backgroundColor?: string;
  activeColor?: string;
  activeBackgroundColor?: string;
}>`
  color: ${({
    theme: {
      palette: { common }
    },
    isActive,
    color,
    activeColor
  }) => (isActive ? activeColor || common.uiBlack : color || common.ui20)};
  background-color: ${({
    theme: {
      palette: { common }
    },
    isActive,
    backgroundColor,
    activeBackgroundColor
  }) => (isActive ? activeBackgroundColor || '#ACFF25' : backgroundColor || common.ui60)};
  white-space: nowrap;

  & > * {
    color: inherit;
  }
`;

const ProductList = styled.div`
  padding: 0 20px;
  display: grid;
  gap: 32px 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

export default CrazycurationTabList;
