import { useEffect, useState } from 'react';

import { Swiper as SwiperClass } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Avatar, BottomSheet, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import SearchHelperBottomSheetSkeleton from '@components/pages/searchHelper/SearchHelperBottomSheetSkeleton';

import type { ProductSearchOption } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { filterColors, filterImageColorNames } from '@constants/productsFilter';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import { searchParamsState, selectedSearchOptionsState } from '@recoil/searchHelper';

import SearchHelperBottomSheetButton from './SearchHelperBottomSheetButton';

const MENU = [
  { id: 'platforms', name: '플랫폼' },
  { id: 'colors', name: '색상' },
  { id: 'seasons', name: '연식' },
  { id: 'materials', name: '소재' }
];

interface SearchHelperMoreOptionBottomSheetProps {
  isLoading: boolean;
  open: boolean;
  onClose: () => void;
  searchOptions: ProductSearchOption | undefined;
}

function SearchHelperMoreOptionBottomSheet({
  isLoading,
  open,
  onClose,
  searchOptions
}: SearchHelperMoreOptionBottomSheetProps) {
  const {
    theme: {
      palette: { primary, common },
      box: { shadow }
    }
  } = useTheme();
  const setSearchParams = useSetRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [optionSwiper, setOptionSwiper] = useState<SwiperClass | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<'platforms' | 'colors' | 'seasons' | 'materials', { id: number; name: string }[]>
  >({
    platforms: [],
    colors: [],
    seasons: [],
    materials: []
  });
  const hasSelectedOptions = Object.values(selectedOptions).some((option) => option.length > 0);
  const needClearOptions =
    selectedSearchOptions.platforms?.length ||
    selectedSearchOptions.colors?.length ||
    selectedSearchOptions.seasons?.length ||
    selectedSearchOptions.materials?.length;

  const handleClose = () => {
    onClose();
    setCurrentSlide(0);
    setSelectedOptions({ platforms: [], colors: [], seasons: [], materials: [] });
    setSearchParams(
      ({
        siteUrlIds: _siteUrlIds,
        colorIds: _colorIds,
        seasonIds: _seasonIds,
        materialIds: _materialIds,
        ...currVal
      }) => ({
        ...currVal,
        ...omitBy(
          {
            siteUrlIds: selectedSearchOptions?.platforms?.map(({ id }) => id),
            colorIds: selectedSearchOptions?.colors?.map(({ id }) => id),
            seasonIds: selectedSearchOptions?.seasons?.map(({ id }) => id),
            materialIds: selectedSearchOptions?.materials?.map(({ id }) => id)
          },
          isEmpty
        )
      })
    );
  };

  const handleClickOption = (index: number) => () => {
    setCurrentSlide(index);
    optionSwiper?.slideTo(index, 0);
  };

  const handleSlideChangeContentSwiper = ({ activeIndex }: SwiperClass) => {
    logEvent(attrKeys.searchHelper.SELECT_OPTIONTAB, {
      name: 'SEARCHHELPER',
      title: MENU[activeIndex].id.slice(0, -1).toUpperCase()
    });
    setCurrentSlide(activeIndex);

    if (Object.entries(selectedOptions).some(([_, value]) => value)) {
      setSearchParams(
        ({
          siteUrlIds: _siteUrlIds,
          colorIds: _colorIds,
          seasonIds: _seasonIds,
          materialIds: _materialIds,
          ...currVal
        }) => ({
          ...currVal,
          ...omitBy(
            {
              siteUrlIds:
                MENU[activeIndex].id === 'platforms'
                  ? []
                  : selectedOptions.platforms.map(({ id }) => id),
              colorIds:
                MENU[activeIndex].id === 'colors' ? [] : selectedOptions.colors.map(({ id }) => id),
              seasonIds:
                MENU[activeIndex].id === 'seasons'
                  ? []
                  : selectedOptions.seasons.map(({ id }) => id),
              materialIds:
                MENU[activeIndex].id === 'materials'
                  ? []
                  : selectedOptions.materials.map(({ id }) => id)
            },
            isEmpty
          )
        })
      );
    }
  };

  const handleClickCtaButton = () => {
    logEvent(attrKeys.searchHelper.SELECT_ITEM, {
      name: 'SEARCHHELPER',
      title: 'MOREOPTION',
      att: [
        ...selectedOptions.platforms.map(({ name }) => name),
        ...selectedOptions.colors.map(({ name }) => name),
        ...selectedOptions.seasons.map(({ name }) => name),
        ...selectedOptions.materials.map(({ name }) => name)
      ]
        .filter((option) => option.length > 0)
        .join(', ')
    });
    onClose();
    setSelectedSearchOptions(
      ({
        platforms: _platforms,
        colors: _colors,
        seasons: _seasons,
        materials: _materials,
        ...currVal
      }) => ({
        ...currVal,
        ...omitBy(selectedOptions, isEmpty)
      })
    );
    setSearchParams(
      ({
        siteUrlIds: _siteUrlIds,
        colorIds: _colorIds,
        seasonIds: _seasonIds,
        materialIds: _materialIds,
        ...currVal
      }) => ({
        ...currVal,
        ...omitBy(
          {
            siteUrlIds: selectedOptions.platforms.map(({ id }) => id),
            colorIds: selectedOptions.colors.map(({ id }) => id),
            seasonIds: selectedOptions.seasons.map(({ id }) => id),
            materialIds: selectedOptions.materials.map(({ id }) => id)
          },
          isEmpty
        )
      })
    );
    setCurrentSlide(0);
    setSelectedOptions({ platforms: [], colors: [], seasons: [], materials: [] });
  };

  useEffect(() => {
    if (open) {
      setSelectedOptions({
        platforms: selectedSearchOptions.platforms || [],
        colors: selectedSearchOptions.colors || [],
        seasons: selectedSearchOptions.seasons || [],
        materials: selectedSearchOptions.materials || []
      });
    }
  }, [
    open,
    selectedSearchOptions.colors,
    selectedSearchOptions.materials,
    selectedSearchOptions.platforms,
    selectedSearchOptions.seasons
  ]);

  return (
    <BottomSheet open={open} onClose={handleClose} customStyle={{ height: 522 }}>
      {open && (
        <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
          <Typography variant="h3" weight="bold" customStyle={{ padding: '12px 20px 8px' }}>
            추가조건
          </Typography>
          <MoreOptionMenu>
            <Flexbox gap={20} customStyle={{ padding: '0 20px' }}>
              {MENU.map(({ id, name }, index) => {
                const isActive = currentSlide === index;

                return (
                  <Box
                    key={`tab-menu-${id}`}
                    style={{ width: 'fit-content' }}
                    onClick={handleClickOption(index)}
                  >
                    <Box customStyle={{ position: 'relative', display: 'inline-block' }}>
                      <Option
                        isActive={isActive}
                        variant="body1"
                        weight={isActive ? 'bold' : 'medium'}
                      >
                        {name}
                      </Option>
                      {selectedOptions[id as keyof typeof selectedOptions].length > 0 && <Badge />}
                    </Box>
                  </Box>
                );
              })}
            </Flexbox>
          </MoreOptionMenu>
          <Box customStyle={{ flex: '1 1 0%', overflowY: 'auto' }}>
            <Swiper
              onSwiper={setOptionSwiper}
              slidesPerView="auto"
              speed={500}
              threshold={60}
              spaceBetween={100}
              onSlideChange={handleSlideChangeContentSwiper}
              style={{ height: '100%' }}
            >
              <SwiperSlide>
                <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
                  <Typography
                    variant="body2"
                    weight="medium"
                    customStyle={{ padding: '16px 20px 4px', color: common.ui60 }}
                  >
                    중복선택 가능
                  </Typography>
                  <Flexbox customStyle={{ flex: '1 1 0%', overflow: 'hidden' }}>
                    <Box customStyle={{ flex: '1 1 0%', overflowY: 'auto' }}>
                      {isLoading
                        ? Array.from({ length: 10 }, (_, index) => (
                            <SearchHelperBottomSheetSkeleton
                              key={`search-helper-category-skeleton-${index}`}
                              isMulti
                            />
                          ))
                        : (searchOptions?.siteUrls || [])
                            .filter((item) => item.count > 0)
                            .map(({ id, name, hasImage, count }) => {
                              const isSelected = selectedOptions.platforms.some(
                                (platform) => platform.id === id
                              );

                              return (
                                <Flexbox
                                  key={`platform-${id}`}
                                  alignment="center"
                                  customStyle={{ padding: '10px 20px' }}
                                  onClick={() =>
                                    setSelectedOptions(({ platforms, ...prevState }) => ({
                                      ...prevState,
                                      platforms: platforms.some((platform) => platform.id === id)
                                        ? platforms.filter((platform) => platform.id !== id)
                                        : platforms.concat([{ id, name }])
                                    }))
                                  }
                                >
                                  <Icon
                                    name="CheckOutlined"
                                    size="small"
                                    customStyle={{
                                      marginRight: 6,
                                      color: isSelected ? primary.main : common.ui90
                                    }}
                                  />
                                  {hasImage && (
                                    <Avatar
                                      width={20}
                                      height={20}
                                      src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${id}.png`}
                                      customStyle={{
                                        marginRight: 6,
                                        boxShadow: shadow.platformLogo
                                      }}
                                      round={4}
                                      alt="Platform Logo Img"
                                    />
                                  )}
                                  <Typography
                                    variant="body1"
                                    weight={isSelected ? 'bold' : 'medium'}
                                    brandColor={isSelected ? 'primary' : 'black'}
                                    customStyle={{ marginRight: 8 }}
                                  >
                                    {name}
                                  </Typography>
                                  <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                                    {commaNumber(count)}
                                  </Typography>
                                </Flexbox>
                              );
                            })}
                    </Box>
                  </Flexbox>
                </Flexbox>
              </SwiperSlide>
              <SwiperSlide>
                <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
                  <Typography
                    variant="body2"
                    weight="medium"
                    customStyle={{ padding: '16px 20px 4px', color: common.ui60 }}
                  >
                    중복선택 가능
                  </Typography>
                  <Flexbox customStyle={{ flex: '1 1 0%', overflow: 'hidden' }}>
                    <Box customStyle={{ flex: '1 1 0%', overflowY: 'auto' }}>
                      {isLoading
                        ? Array.from({ length: 10 }, (_, index) => (
                            <SearchHelperBottomSheetSkeleton
                              key={`search-helper-category-skeleton-${index}`}
                              isMulti
                            />
                          ))
                        : (searchOptions?.colors || [])
                            .filter((item) => item.count > 0)
                            .map(({ id, name, description, count }) => {
                              const needImage = filterImageColorNames.includes(description);
                              const getColorCode =
                                filterColors[description as keyof typeof filterColors];
                              const isSelected = selectedOptions.colors.some(
                                (color) => color.id === id
                              );

                              return (
                                <Flexbox
                                  key={`color-${id}`}
                                  alignment="center"
                                  customStyle={{ padding: '10px 20px' }}
                                  onClick={() =>
                                    setSelectedOptions(({ colors, ...prevState }) => ({
                                      ...prevState,
                                      colors: colors.some((color) => color.id === id)
                                        ? colors.filter((color) => color.id !== id)
                                        : colors.concat([{ id, name }])
                                    }))
                                  }
                                >
                                  <Icon
                                    name="CheckOutlined"
                                    size="small"
                                    customStyle={{
                                      marginRight: 6,
                                      color: isSelected ? primary.main : common.ui90
                                    }}
                                  />
                                  {needImage && (
                                    <Avatar
                                      width="20px"
                                      height="20px"
                                      src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${description}.png`}
                                      alt="Color Img"
                                      customStyle={{
                                        marginRight: 6,
                                        borderRadius: '50%'
                                      }}
                                    />
                                  )}
                                  {!needImage && getColorCode && (
                                    <ColorSample colorCode={getColorCode} />
                                  )}
                                  <Typography
                                    variant="body1"
                                    weight={isSelected ? 'bold' : 'medium'}
                                    customStyle={{ marginRight: 8 }}
                                    brandColor={isSelected ? 'primary' : 'black'}
                                  >
                                    {name}
                                  </Typography>
                                  <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                                    {commaNumber(count)}
                                  </Typography>
                                </Flexbox>
                              );
                            })}
                    </Box>
                  </Flexbox>
                </Flexbox>
              </SwiperSlide>
              <SwiperSlide>
                <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
                  <Typography
                    variant="body2"
                    weight="medium"
                    customStyle={{ padding: '16px 20px 4px', color: common.ui60 }}
                  >
                    중복선택 가능
                  </Typography>
                  <Flexbox customStyle={{ flex: '1 1 0%', overflow: 'hidden' }}>
                    <Box customStyle={{ flex: '1 1 0%', overflowY: 'auto' }}>
                      {isLoading
                        ? Array.from({ length: 10 }, (_, index) => (
                            <SearchHelperBottomSheetSkeleton
                              key={`search-helper-category-skeleton-${index}`}
                              isMulti
                            />
                          ))
                        : (searchOptions?.seasons || [])
                            .filter((item) => item.count > 0)
                            .map(({ id, name, count }) => {
                              const isSelected = selectedOptions.seasons.some(
                                (seasons) => seasons.id === id
                              );

                              return (
                                <Flexbox
                                  key={`season-${id}`}
                                  alignment="center"
                                  customStyle={{ padding: '10px 20px' }}
                                  onClick={() =>
                                    setSelectedOptions(({ seasons, ...prevState }) => ({
                                      ...prevState,
                                      seasons: seasons.some((season) => season.id === id)
                                        ? seasons.filter((season) => season.id !== id)
                                        : seasons.concat([{ id, name }])
                                    }))
                                  }
                                >
                                  <Icon
                                    name="CheckOutlined"
                                    size="small"
                                    customStyle={{
                                      marginRight: 6,
                                      color: isSelected ? primary.main : common.ui90
                                    }}
                                  />
                                  <Typography
                                    variant="body1"
                                    weight={isSelected ? 'bold' : 'medium'}
                                    customStyle={{ marginRight: 8 }}
                                    brandColor={isSelected ? 'primary' : 'black'}
                                  >
                                    {name}
                                  </Typography>
                                  <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                                    {commaNumber(count)}
                                  </Typography>
                                </Flexbox>
                              );
                            })}
                    </Box>
                  </Flexbox>
                </Flexbox>
              </SwiperSlide>
              <SwiperSlide>
                <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
                  <Typography
                    variant="body2"
                    weight="medium"
                    customStyle={{ padding: '16px 20px 4px', color: common.ui60 }}
                  >
                    중복선택 가능
                  </Typography>
                  <Flexbox customStyle={{ flex: '1 1 0%', overflow: 'hidden' }}>
                    <Box customStyle={{ flex: '1 1 0%', overflowY: 'auto' }}>
                      {isLoading
                        ? Array.from({ length: 10 }, (_, index) => (
                            <SearchHelperBottomSheetSkeleton
                              key={`search-helper-category-skeleton-${index}`}
                              isMulti
                            />
                          ))
                        : (searchOptions?.materials || [])
                            .filter((item) => item.count > 0)
                            .map(({ id, name, count }) => {
                              const isSelected = selectedOptions.materials.some(
                                (material) => material.id === id
                              );

                              return (
                                <Flexbox
                                  key={`material-${id}`}
                                  alignment="center"
                                  customStyle={{ padding: '10px 20px' }}
                                  onClick={() =>
                                    setSelectedOptions(({ materials, ...prevState }) => ({
                                      ...prevState,
                                      materials: materials.some((material) => material.id === id)
                                        ? materials.filter((material) => material.id !== id)
                                        : materials.concat([{ id, name }])
                                    }))
                                  }
                                >
                                  <Icon
                                    name="CheckOutlined"
                                    size="small"
                                    customStyle={{
                                      marginRight: 6,
                                      color: isSelected ? primary.main : common.ui90
                                    }}
                                  />
                                  <Typography
                                    variant="body1"
                                    weight={isSelected ? 'bold' : 'medium'}
                                    customStyle={{ marginRight: 8 }}
                                    brandColor={isSelected ? 'primary' : 'black'}
                                  >
                                    {name}
                                  </Typography>
                                  <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                                    {commaNumber(count)}
                                  </Typography>
                                </Flexbox>
                              );
                            })}
                    </Box>
                  </Flexbox>
                </Flexbox>
              </SwiperSlide>
            </Swiper>
          </Box>
          {hasSelectedOptions && (
            <SearchHelperBottomSheetButton onClick={handleClickCtaButton}>
              선택완료
            </SearchHelperBottomSheetButton>
          )}
          {!hasSelectedOptions && needClearOptions && (
            <SearchHelperBottomSheetButton onClick={handleClickCtaButton} variant="outline">
              적용하기
            </SearchHelperBottomSheetButton>
          )}
        </Flexbox>
      )}
    </BottomSheet>
  );
}

const MoreOptionMenu = styled.div`
  border-bottom: ${({
    theme: {
      palette: { common }
    }
  }) => `1px solid ${common.ui90}`};
`;

const Option = styled(Typography)<{ isActive: boolean }>`
  padding: 8px 0;
  border-bottom: ${({
    theme: {
      palette: { common }
    },
    isActive
  }) => isActive && `2px solid ${common.ui20}`};
  color: ${({
    theme: {
      palette: { common }
    },
    isActive
  }) => (isActive ? common.ui20 : common.ui60)};
`;

const Badge = styled.div`
  position: absolute;
  top: 6px;
  right: -6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.main};
`;

const ColorSample = styled.div<{
  colorCode: string;
}>`
  width: 20px;
  height: 20px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 50%;
  background-color: ${({ colorCode }) => colorCode};
  margin-right: 6px;
`;

export default SearchHelperMoreOptionBottomSheet;
