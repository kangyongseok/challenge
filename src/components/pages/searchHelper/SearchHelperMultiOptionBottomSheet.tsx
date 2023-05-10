import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { BottomSheet, Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import SearchHelperBottomSheetSkeleton from '@components/pages/searchHelper/SearchHelperBottomSheetSkeleton';

import { commaNumber } from '@utils/common';

import { selectedSearchOptionsState } from '@recoil/searchHelper';

import SearchHelperBottomSheetButton from './SearchHelperBottomSheetButton';

interface SearchHelperMultiOptionBottomSheetProps {
  isLoading: boolean;
  title: string;
  data: { id: number; name: string; count: number }[] | undefined;
  open: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: { id: number; name: string }[]) => void;
  needClearOptions?: boolean;
}

function SearchHelperMultiOptionBottomSheet({
  isLoading,
  open,
  onClose,
  onSelect,
  title,
  data,
  needClearOptions = false
}: SearchHelperMultiOptionBottomSheetProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const selectedSearchOptions = useRecoilValue(selectedSearchOptionsState);
  const [selectedOptions, setSelectedOptions] = useState<{ id: number; name: string }[]>([]);
  const hasSelectedOptions = selectedOptions.length > 0;

  const isSelected = (id: number) => selectedOptions.some((prev) => prev.id === id);

  const handleClose = () => {
    onClose();
    setSelectedOptions([]);
  };

  const handleClickOption =
    ({ id, name }: { id: number; name: string }) =>
    () => {
      setSelectedOptions((prevState) =>
        prevState.some((prev) => prev.id === id)
          ? prevState.filter((prev) => prev.id !== id)
          : prevState.concat([{ id, name }])
      );
    };

  const handleClickCtaButton = () => {
    onSelect(selectedOptions);
    setSelectedOptions([]);
  };

  useEffect(() => {
    if (open) {
      if (title === '사이즈' && selectedSearchOptions.sizes.length > 0) {
        setSelectedOptions(selectedSearchOptions.sizes);
      }

      if (title === '라인' && selectedSearchOptions.lines?.length) {
        setSelectedOptions(selectedSearchOptions.lines);
      }
    }
  }, [open, selectedSearchOptions.lines, selectedSearchOptions.sizes, title]);

  return (
    <BottomSheet open={open} onClose={handleClose} customStyle={{ height: 522 }}>
      {open && (
        <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
          <Typography variant="h3" weight="bold" customStyle={{ padding: '12px 20px 16px' }}>
            {title}
          </Typography>
          <Typography
            variant="small2"
            weight="medium"
            customStyle={{ color: common.ui60, padding: '0 20px 4px' }}
          >
            중복 선택 가능
          </Typography>
          <Box customStyle={{ flex: '1 1 0%', overflowY: 'auto' }}>
            {isLoading
              ? Array.from({ length: 10 }, (_, index) => (
                  <SearchHelperBottomSheetSkeleton
                    key={`search-helper-category-skeleton-${index}`}
                    isMulti
                  />
                ))
              : data?.map(({ id, name, count }) => (
                  <Flexbox
                    key={`${title}-option-${id}`}
                    alignment="center"
                    customStyle={{ padding: '10px 20px' }}
                    onClick={handleClickOption({ id, name })}
                  >
                    <Icon
                      name="CheckOutlined"
                      size="small"
                      customStyle={{
                        marginRight: 6,
                        color: isSelected(id) ? primary.main : common.ui90
                      }}
                    />
                    <Typography
                      variant="body1"
                      weight={isSelected(id) ? 'bold' : 'medium'}
                      customStyle={{
                        color: isSelected(id) ? primary.main : undefined,
                        marginRight: 8
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography variant="small2" customStyle={{ color: common.ui60 }}>
                      {commaNumber(count)}
                    </Typography>
                  </Flexbox>
                ))}
          </Box>
          {!!data && hasSelectedOptions && (
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

export default SearchHelperMultiOptionBottomSheet;
