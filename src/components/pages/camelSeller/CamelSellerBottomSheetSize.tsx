import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { filter, sortBy, uniqBy } from 'lodash-es';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchCategorySizes } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { globalSizeGroupId } from '@constants/common';
// import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { GroupSize } from '@typings/camelSeller';
import { camelSellerTempSaveDataState } from '@recoil/camelSeller';

interface BottomSheetSizeProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

function CamelSellerBottomSheetSize({ onClick }: BottomSheetSizeProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { query } = useRouter();
  const swiperRef = useRef<SwiperClass | null>(null);
  const [tab, setTab] = useState(0);
  const [groupSize, setGroupSize] = useState<GroupSize[]>([]);
  // const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [fetchData, setFetchData] = useState({ brandId: 0, categoryId: 0 });
  const tempData = useRecoilValue(camelSellerTempSaveDataState);
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

    // setCamelSeller(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query.brandIds && query.categoryIds) {
      setFetchData({
        brandId:
          typeof query.brandIds === 'string' ? Number(query.brandIds) : Number(query.brandIds[0]),
        categoryId: Number(query.categoryIds)
      });
    } else {
      setFetchData({
        brandId: tempData.brand.id,
        categoryId: tempData.category.id
      });
    }
  }, [query, tempData]);

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
        if (globalSizeGroupId.includes(size.groupId)) {
          return size;
        }
        return '';
      });

      setGroupSize([
        { id: 0, label: '글로벌 사이즈', data: uniqBy(sortBy(globalSize, 'name'), 'id') },
        { id: 1, label: 'UK', data: uniqBy(sortBy(ukSize, 'name'), 'id') },
        { id: 2, label: 'EU', data: uniqBy(sortBy(euSize, 'name'), 'name') }
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
      <Box customStyle={{ marginTop: 103, paddingTop: 18 }}>
        <Swiper
          onSlideChange={handleSlideChange}
          initialSlide={tab}
          onInit={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {groupSize[0]?.data.length > 0 && (
            <SwiperSlide data-slide-id={0}>
              <Flexbox
                gap={10}
                customStyle={{
                  overflow: 'auto',
                  flexWrap: 'wrap',
                  maxHeight: 'calc(100vh - 200px)'
                }}
              >
                <Chip
                  key="size-global-oneSize"
                  data-size-id={0}
                  data-size-name="ONE SIZE"
                  variant="contained"
                  customStyle={{
                    background: common.ui95,
                    color: common.ui20
                  }}
                  onClick={onClick}
                >
                  ONE SIZE
                </Chip>
                {groupSize[0].data.map((list) => (
                  <Chip
                    key={`size-global-${list.id}`}
                    data-size-id={list.id}
                    data-size-name={list.name}
                    variant="contained"
                    customStyle={{
                      background: common.ui95,
                      color: common.ui20
                    }}
                    onClick={onClick}
                  >
                    {list.name}
                  </Chip>
                ))}
              </Flexbox>
            </SwiperSlide>
          )}
          {groupSize[1]?.data.length > 0 && (
            <SwiperSlide data-slide-id={1}>
              <Flexbox
                gap={10}
                customStyle={{
                  overflow: 'auto',
                  flexWrap: 'wrap',
                  maxHeight: 'calc(100vh - 200px)'
                }}
              >
                <Chip
                  key="size-uk-oneSize"
                  data-size-id={0}
                  data-size-name="One Size"
                  variant="contained"
                  customStyle={{
                    background: common.ui95,
                    color: common.ui20
                  }}
                  onClick={onClick}
                >
                  ONE SIZE
                </Chip>
                {groupSize[1].data.map((list) => (
                  <Chip
                    key={`size-uk-${list.id}`}
                    data-size-id={list.id}
                    data-size-name={list.name}
                    variant="contained"
                    customStyle={{
                      background: common.ui95,
                      color: common.ui20
                    }}
                    onClick={onClick}
                  >
                    {list.name}
                  </Chip>
                ))}
              </Flexbox>
            </SwiperSlide>
          )}
          {groupSize[2]?.data.length > 0 && (
            <SwiperSlide data-slide-id={2}>
              <Flexbox
                gap={10}
                customStyle={{
                  overflow: 'auto',
                  flexWrap: 'wrap',
                  maxHeight: 'calc(100vh - 200px)'
                }}
              >
                <Chip
                  key="size-eu-oneSize"
                  data-size-id={0}
                  data-size-name="One Size"
                  variant="contained"
                  customStyle={{
                    background: common.ui95,
                    color: common.ui20
                  }}
                  onClick={onClick}
                >
                  ONE SIZE
                </Chip>
                {groupSize[2].data.map((list) => (
                  <Chip
                    key={`size-eu-${list.id}`}
                    data-size-id={list.id}
                    data-size-name={list.name}
                    variant="contained"
                    customStyle={{
                      background: common.ui95,
                      color: common.ui20
                    }}
                    onClick={onClick}
                  >
                    {list.name}
                  </Chip>
                ))}
              </Flexbox>
            </SwiperSlide>
          )}
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
