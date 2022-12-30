import { useCallback, useEffect, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import { Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserSize } from '@api/user';

import { USER_DEFAULT_SIZE } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import OnboardingStep from './OnboardingStep';
import OnboardingBottomCTA from './OnboardingBottomCTA';

interface OnboardingSizeProps {
  onClick: () => void;
}

function OnboardingSize({ onClick }: OnboardingSizeProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { mutateAsync } = useMutation(postUserSize);
  const { data: accessUser } = useQueryAccessUser();

  const [selectedTopList, setSelectedTopList] = useState<number[]>([]);
  const [selectedBottomList, setSelectedBottomList] = useState<number[]>([]);
  const [selectedShoesList, setSelectedShoesList] = useState<number[]>([]);

  const { info: { value: { gender = '' } = {} } = {} } = userInfo || {};
  const defaultSize =
    USER_DEFAULT_SIZE[(gender === 'F' ? 'female' : 'male') as keyof typeof USER_DEFAULT_SIZE];
  const hasSize =
    selectedTopList?.length > 0 || selectedBottomList?.length > 0 || selectedShoesList?.length > 0;

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_PERSONAL_INPUT, {
      name: attrProperty.name.SIZE
    });
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.size.value) {
      setSelectedBottomList(
        userInfo.size.value.bottoms.map((bottom) => bottom.categorySizeId) as number[]
      );
      setSelectedTopList(userInfo.size.value.tops.map((tops) => tops.categorySizeId) as number[]);
      setSelectedShoesList(
        userInfo.size.value.shoes.map((shoes) => shoes.categorySizeId) as number[]
      );
    }
  }, [userInfo]);

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
      });
    } else {
      onClick();
    }
  }, [hasSize, mutateAsync, onClick, selectedBottomList, selectedShoesList, selectedTopList]);

  return (
    <>
      <Box customStyle={{ padding: 32, background: common.uiWhite }}>
        <OnboardingStep />
        <Box customStyle={{ marginTop: 50 }}>
          <Typography variant="h2" weight="bold" customStyle={{ marginBottom: 8 }}>
            사이즈를 알려주세요!
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>
            {accessUser?.userName || '회원'}님 사이즈에 맞는 매물만 보여드릴게요
          </Typography>
        </Box>
        {gender.length > 0 && userInfo && (
          <Box customStyle={{ flex: 1 }}>
            <Typography
              variant="h4"
              weight="bold"
              customStyle={{ marginTop: 24, color: common.ui60 }}
            >
              👕 상의
            </Typography>
            <Flexbox customStyle={{ flexWrap: 'wrap', marginTop: 8, gap: 7 }}>
              {defaultSize.top.map(({ categorySizeId, viewSize }) => (
                <ChipStyle
                  key={`top-${viewSize}-${categorySizeId}`}
                  isRound
                  variant="solid"
                  onClick={handleClickSizeLabel({
                    type: 'top',
                    selectedValue: categorySizeId,
                    viewSize
                  })}
                  isSelect={selectedTopList?.includes(categorySizeId)}
                >
                  {viewSize}
                </ChipStyle>
              ))}
            </Flexbox>
            <Typography
              variant="h4"
              weight="bold"
              customStyle={{ marginTop: 32, color: common.ui60 }}
            >
              👖 하의
            </Typography>
            <Flexbox customStyle={{ flexWrap: 'wrap', marginTop: 8, gap: '8px 6px' }}>
              {defaultSize.bottom.map(({ categorySizeId, viewSize }) => (
                <ChipStyle
                  key={`bottom-${viewSize}-${categorySizeId}`}
                  isRound
                  variant="solid"
                  onClick={handleClickSizeLabel({
                    type: 'bottom',
                    selectedValue: categorySizeId,
                    viewSize
                  })}
                  isSelect={selectedBottomList?.includes(categorySizeId)}
                >
                  {viewSize}
                </ChipStyle>
              ))}
            </Flexbox>
            <Typography
              variant="h4"
              weight="bold"
              customStyle={{ marginTop: 32, color: common.ui60 }}
            >
              👟 신발
            </Typography>
            <Flexbox
              customStyle={{
                flexWrap: 'wrap',
                marginTop: 8,
                gap: '8px 6px',
                paddingBottom: 32
              }}
            >
              {defaultSize.shoes.map(({ categorySizeId, viewSize }) => (
                <ChipStyle
                  key={`shoes-${viewSize}-${categorySizeId}`}
                  isRound
                  variant="solid"
                  onClick={handleClickSizeLabel({
                    type: 'shoes',
                    selectedValue: categorySizeId,
                    viewSize
                  })}
                  isSelect={selectedShoesList?.includes(categorySizeId)}
                >
                  {viewSize}
                </ChipStyle>
              ))}
            </Flexbox>
          </Box>
        )}
      </Box>
      <OnboardingBottomCTA
        variant={hasSize ? 'solid' : 'outline'}
        onClick={handleClickCTAButton}
        disabled={
          !(selectedBottomList?.length && selectedShoesList?.length && selectedTopList?.length)
        }
      >
        다음
      </OnboardingBottomCTA>
    </>
  );
}

const ChipStyle = styled(Chip)<{ isSelect: boolean }>`
  width: 72px;
  height: 41px;
  border-radius: 36px;
  background: ${({
    theme: {
      palette: { common }
    },
    isSelect
  }) => (isSelect ? common.uiBlack : common.ui90)};
  color: ${({
    theme: {
      palette: { common }
    },
    isSelect
  }) => (isSelect ? common.ui98 : common.uiBlack)};
`;

export default OnboardingSize;
