import { memo } from 'react';

import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { commaNumber } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface SearchHelperLinearProgressProps {
  value: number;
  disabledText?: boolean;
  showInfoText: boolean;
  productTotal: number;
}

function SearchHelperLinearProgress({
  value,
  disabledText = false,
  showInfoText,
  productTotal
}: SearchHelperLinearProgressProps) {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();
  const { data: accessUser } = useQueryAccessUser();

  return (
    <>
      <Flexbox justifyContent="space-between" customStyle={{ padding: '24px 20px 8px' }}>
        {!disabledText && (
          <Typography variant="body2" weight="medium">
            {value}% 완료
          </Typography>
        )}
        {showInfoText && (
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{ '& > span': { color: primary.main } }}
          >
            {accessUser?.userName || '회원'}님을 위한 매물
            <span> {commaNumber(productTotal)}</span>
          </Typography>
        )}
      </Flexbox>
      <StyledLinearProgress>
        <LinearProgressBar>
          <ActiveLinearProgressBar value={value} />
        </LinearProgressBar>
      </StyledLinearProgress>
    </>
  );
}

const StyledLinearProgress = styled.div`
  width: 100%;
`;

const LinearProgressBar = styled.span`
  position: relative;
  overflow: hidden;
  display: block;
  height: 4px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
`;

const ActiveLinearProgressBar = styled.span<{ value: number }>`
  transform: ${({ value }) => `translateX(${-100 + value}%)`};
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  transition: transform 0.4s linear 0s;
  transform-origin: left center;
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.main};
`;

export default memo(SearchHelperLinearProgress);
