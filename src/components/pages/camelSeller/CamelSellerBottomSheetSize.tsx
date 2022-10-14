import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useQuery } from 'react-query';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import { filter } from 'lodash-es';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchCategorySizes } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { CamelSellerLocalStorage, GroupSize } from '@typings/camelSeller';

interface BottomSheetSizeProps {
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}

function CamelSellerBottomSheetSize({ onClick }: BottomSheetSizeProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [tab, setTab] = useState(0);
  const [groupSize, setGroupSize] = useState<GroupSize[]>([]);
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [fetchData, setFetchData] = useState({ brandId: 0, categoryId: 0 });
  const { data: categorySizes } = useQuery(
    queryKeys.categories.categorySizes(fetchData),
    () => fetchCategorySizes(fetchData),
    {
      enabled: !!fetchData.brandId
    }
  );

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_OPTIONS,
      title: attrProperty.title.SIZE
    });

    setCamelSeller(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (camelSeller && camelSeller.brand && camelSeller.category) {
      setFetchData({
        brandId: camelSeller.brand.id,
        categoryId: camelSeller.category.id
      });
    }
  }, [camelSeller]);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(tab);
    }
  }, [tab]);
  useEffect(() => {
    const sizes = categorySizes?.map((data) => ({
      name: data.name,
      id: data.id,
      groupId: data.groupId
    }));
    if (sizes) {
      const ukSize = filter(sizes, { groupId: 4 });
      const euSize = filter(sizes, { groupId: 5 });
      const globalSize = sizes?.filter((size) => {
        if (size.groupId === 1 || size.groupId === 3 || size.groupId === 6) {
          return size;
        }
        return '';
      });

      setGroupSize([
        { id: 0, label: '글로벌 사이즈', data: globalSize },
        { id: 1, label: 'UK', data: ukSize },
        { id: 2, label: 'EU', data: euSize }
      ]);
    }
  }, [categorySizes]);

  const handleSlideChange = (swiper: SwiperClass) => {
    const { slides, activeIndex } = swiper;
    setTab(Number((slides[activeIndex] as HTMLDivElement).dataset.slideId));
  };

  return (
    <Box customStyle={{ marginTop: 20 }}>
      <Header>
        <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 16 }}>
          사이즈
        </Typography>
        <Flexbox alignment="center" gap={20}>
          {groupSize.map(({ label, id, data }) => {
            if (data.length > 0) {
              return (
                <TabText
                  key={`size-bottom-sheet-${id}`}
                  weight="medium"
                  active={tab === id}
                  onClick={() => setTab(id as number)}
                >
                  {label}
                </TabText>
              );
            }
            return '';
          })}
        </Flexbox>
      </Header>
      <Box customStyle={{ marginTop: 103 }}>
        <Swiper
          onSlideChange={handleSlideChange}
          initialSlide={tab}
          onInit={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {groupSize.map(({ data, id }) => {
            if (data.length !== 0) {
              return (
                <SwiperSlide data-slide-id={id} key={`swiper-size-${id}`}>
                  <Flexbox direction="vertical" gap={20} customStyle={{ height: data.length * 40 }}>
                    <Typography
                      weight="medium"
                      onClick={onClick}
                      data-size-id={0}
                      data-size-name="One Size"
                    >
                      One Size
                    </Typography>
                    {data.map((size) => (
                      <Typography
                        data-size-id={size.id}
                        data-size-name={size.name}
                        weight="medium"
                        onClick={onClick}
                        key={`size-${size.id}`}
                      >
                        {size.name}
                      </Typography>
                    ))}
                  </Flexbox>
                </SwiperSlide>
              );
            }
            return null;
          })}
        </Swiper>
      </Box>
    </Box>
  );
}

const Header = styled.div`
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  padding-bottom: 8px;
  margin-bottom: 18px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 32px 20px 0 20px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.dialog + 1};
  border-radius: 16px 16px 0 0;
`;

const TabText = styled(Typography)<{ active: boolean }>`
  color: ${({
    theme: {
      palette: { common }
    },
    active
  }) => (active ? common.ui20 : common.ui60)};
  border-bottom: 2px solid
    ${({
      active,
      theme: {
        palette: { common }
      }
    }) => (active ? common.ui20 : 'rgba(255, 255, 255)')};
  ${({
    active,
    theme: {
      palette: { common }
    }
  }) =>
    active &&
    css`
      border-bottom: 2px solid ${common.ui20};
    `};
  padding-bottom: 8px;
`;

export default CamelSellerBottomSheetSize;
