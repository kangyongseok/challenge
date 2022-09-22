import { useCallback, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import { Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserSize } from '@api/user';

import { USER_DEFAULT_SIZE } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import OnboardingBottomCTA from './OnboardingBottomCTA';

interface OnboardingSizeProps {
  onClick: () => void;
}

function OnboardingSize({ onClick }: OnboardingSizeProps) {
  const {
    theme: { palette }
  } = useTheme();
  const { data: userInfo, refetch } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { mutateAsync } = useMutation(postUserSize);

  const [selectedTopList, setSelectedTopList] = useState<number[]>([]);
  const [selectedBottomList, setSelectedBottomList] = useState<number[]>([]);
  const [selectedShoesList, setSelectedShoesList] = useState<number[]>([]);
  const { info: { value: { gender = '' } = {} } = {} } = userInfo || {};
  const defaultSize =
    USER_DEFAULT_SIZE[(gender === 'F' ? 'female' : 'male') as keyof typeof USER_DEFAULT_SIZE];
  const hasSize =
    selectedTopList.length > 0 || selectedBottomList.length > 0 || selectedShoesList.length > 0;

  const handleClickSizeLabel =
    ({
      type,
      selectedValue,
      viewSize
    }: {
      type: 'top' | 'bottom' | 'shoes';
      selectedValue: number;
      viewSize: string;
    }) =>
    () => {
      logEvent(attrKeys.welcome.SELECT_ITEM, {
        name: attrProperty.productName.SIZE,
        title: type,
        att: viewSize
      });
      switch (type) {
        case 'top': {
          setSelectedTopList(
            selectedTopList.includes(selectedValue)
              ? selectedTopList.filter((selectedTop) => selectedTop !== selectedValue)
              : selectedTopList.concat(selectedValue)
          );

          break;
        }
        case 'bottom': {
          setSelectedBottomList(
            selectedBottomList.includes(selectedValue)
              ? selectedBottomList.filter((selectedBottom) => selectedBottom !== selectedValue)
              : selectedBottomList.concat(selectedValue)
          );

          break;
        }
        case 'shoes': {
          setSelectedShoesList(
            selectedShoesList.includes(selectedValue)
              ? selectedShoesList.filter((selectedShoes) => selectedShoes !== selectedValue)
              : selectedShoesList.concat(selectedValue)
          );

          break;
        }
        default: {
          break;
        }
      }
    };

  const handleClickCTAButton = useCallback(() => {
    const mutates = [];
    if (hasSize) {
      logEvent(attrKeys.welcome.SUBMIT_PERSONAL_INPUT, {
        name: attrProperty.productName.SIZE,
        title: attrProperty.productTitle.INPUT,
        options: [
          { top: selectedTopList.join(',') },
          { bottom: selectedBottomList.join(',') },
          { shoes: selectedShoesList.join(',') }
        ]
      });
    } else {
      logEvent(attrKeys.welcome.SUBMIT_PERSONAL_INPUT, {
        name: attrProperty.productName.SIZE,
        att: 'SKIP'
      });
    }
    if (selectedTopList.length)
      mutates.push(mutateAsync({ sizeType: 'top', categorySizeIds: selectedTopList }));

    if (selectedBottomList.length)
      mutates.push(mutateAsync({ sizeType: 'bottom', categorySizeIds: selectedBottomList }));

    if (selectedShoesList.length)
      mutates.push(mutateAsync({ sizeType: 'shoes', categorySizeIds: selectedShoesList }));

    if (mutates.length > 0) {
      Promise.all(mutates).then(() => {
        onClick();
        refetch();
      });
    } else {
      onClick();
    }
  }, [
    hasSize,
    mutateAsync,
    onClick,
    refetch,
    selectedBottomList,
    selectedShoesList,
    selectedTopList
  ]);

  return (
    <>
      <GeneralTemplate hideAppDownloadBanner>
        <Typography
          variant="h2"
          weight="bold"
          customStyle={{ padding: '48px 0px 40px', '& > span': { color: palette.primary.main } }}
        >
          <span>사이즈 정보</span>를 알려주시면
          <br />
          맞춤 추천해드릴게요
        </Typography>
        {gender.length > 0 && userInfo && (
          <Box customStyle={{ flex: 1 }}>
            <Typography
              variant="body2"
              weight="medium"
              customStyle={{ color: palette.common.grey['60'] }}
            >
              중복 선택 가능
            </Typography>
            <Typography variant="h4" weight="bold" customStyle={{ marginTop: 24 }}>
              👕 상의
            </Typography>
            <Flexbox customStyle={{ flexWrap: 'wrap', marginTop: 8, gap: '8px 6px' }}>
              {defaultSize.top.map(({ categorySizeId, viewSize }) => (
                <Chip
                  key={`top-${viewSize}-${categorySizeId}`}
                  isRound
                  variant={selectedTopList.includes(categorySizeId) ? 'outlinedGhost' : 'outlined'}
                  brandColor={selectedTopList.includes(categorySizeId) ? 'primary' : 'grey'}
                  onClick={handleClickSizeLabel({
                    type: 'top',
                    selectedValue: categorySizeId,
                    viewSize
                  })}
                  customStyle={{
                    padding: '10px 16px',
                    height: 41
                  }}
                >
                  {viewSize}
                </Chip>
              ))}
            </Flexbox>
            <Typography variant="h4" weight="bold" customStyle={{ marginTop: 32 }}>
              👖 하의
            </Typography>
            <Flexbox customStyle={{ flexWrap: 'wrap', marginTop: 8, gap: '8px 6px' }}>
              {defaultSize.bottom.map(({ categorySizeId, viewSize }) => (
                <Chip
                  key={`bottom-${viewSize}-${categorySizeId}`}
                  isRound
                  variant={
                    selectedBottomList.includes(categorySizeId) ? 'outlinedGhost' : 'outlined'
                  }
                  brandColor={selectedBottomList.includes(categorySizeId) ? 'primary' : 'grey'}
                  onClick={handleClickSizeLabel({
                    type: 'bottom',
                    selectedValue: categorySizeId,
                    viewSize
                  })}
                  customStyle={{
                    padding: '10px 16px',
                    height: 41
                  }}
                >
                  {viewSize}
                </Chip>
              ))}
            </Flexbox>
            <Typography variant="h4" weight="bold" customStyle={{ marginTop: 32 }}>
              👟 신발
            </Typography>
            <Flexbox
              customStyle={{ flexWrap: 'wrap', marginTop: 8, gap: '8px 6px', paddingBottom: 32 }}
            >
              {defaultSize.shoes.map(({ categorySizeId, viewSize }) => (
                <Chip
                  key={`shoes-${viewSize}-${categorySizeId}`}
                  isRound
                  variant={
                    selectedShoesList.includes(categorySizeId) ? 'outlinedGhost' : 'outlined'
                  }
                  brandColor={selectedShoesList.includes(categorySizeId) ? 'primary' : 'grey'}
                  onClick={handleClickSizeLabel({
                    type: 'shoes',
                    selectedValue: categorySizeId,
                    viewSize
                  })}
                  customStyle={{
                    padding: '10px 16px',
                    height: 41
                  }}
                >
                  {viewSize}
                </Chip>
              ))}
            </Flexbox>
          </Box>
        )}
      </GeneralTemplate>
      <OnboardingBottomCTA
        variant={hasSize ? 'contained' : 'outlined'}
        onClick={handleClickCTAButton}
        showBorder
      >
        {hasSize ? '시작하기' : '건너뛰기'}
      </OnboardingBottomCTA>
    </>
  );
}

export default OnboardingSize;
