import { useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { useQuery } from 'react-query';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

interface UserBudgetProps {
  budget: number | undefined;
  setBudget: Dispatch<SetStateAction<number | undefined>>;
}

function UserBudget({ budget, setBudget }: UserBudgetProps) {
  const { isLoading } = useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
    onSuccess(data) {
      if (typeof data.maxMoney === 'number' && data.maxMoney > 0) {
        setBudget(data.maxMoney);
      }
    }
  });
  const [isFocus, setIsFocus] = useState(false);

  if (isLoading) {
    return null;
  }

  const handleFocus = () => {
    logEvent(attrKeys.userInput.SELECT_ITEM, { name: 'BUDGET', title: 'PRICE' });
    setIsFocus(true);
    setBudget(undefined);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { value } = e.target;
    const nextValue = Math.max(Number(value.replace(/\D/g, '')), 0);
    if (value.length <= 5) {
      setBudget(nextValue || undefined);
    }
  };

  const parseValue = () => {
    if (budget === -1) {
      return '최대예산';
    }
    return budget || '';
  };

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 32
      }}
    >
      <Flexbox alignment="center" direction="vertical" gap={6}>
        <Typography variant="h3" weight="bold" brandColor="black">
          최대 예산을 입력해보세요.
        </Typography>
        <Typography weight="regular">예산보다 낮은 가격의 매물만 보여드려요.</Typography>
      </Flexbox>
      <Flexbox
        customStyle={{
          marginTop: '58px',
          position: 'relative'
        }}
        gap={16}
        alignment="center"
        justifyContent="center"
      >
        <BudgetInput
          isFocus={isFocus || (!!budget && budget !== -1)}
          value={parseValue()}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocus(false)}
          placeholder={isFocus ? '' : '최대예산'}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        {(isFocus || (!!budget && budget !== -1)) && (
          <UnitText variant="h2" weight="medium">
            만원
          </UnitText>
        )}
      </Flexbox>
    </Box>
  );
}

const UnitText = styled(Typography)`
  position: absolute;
  top: calc(50% - 18px);
  right: calc(50% - 70px);
`;

const BudgetInput = styled.input<{ isFocus: boolean }>`
  display: block;
  width: 215px;
  height: 60px;
  padding: ${({ isFocus }) => (isFocus ? '12px 60px 12px 12px' : '12px 0')};
  border: 2px solid
    ${({ theme, value }) => (!value ? theme.palette.common.grey['80'] : theme.palette.primary.main)};
  border-radius: 36px;
  font-weight: ${({ theme: { typography } }) => typography.h2.weight.medium};
  font-size: ${({ theme }) => theme.typography.h2.size};
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
  text-align: center;
  &:focus {
    border: 2px solid ${({ theme: { palette } }) => palette.primary.main};
    outline: none;
  }
`;

export default UserBudget;
