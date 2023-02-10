import { MouseEvent, useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import { useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
import { purchaseType } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

const BASE_URL_USER = '/user';

function MypageUserInfo() {
  const queryClient = useQueryClient();
  const {
    theme: {
      palette: { common },
      typography
    }
  } = useTheme();
  const {
    data: {
      size,
      area: { values: area = [] } = {},
      info: { value: { yearOfBirth = '', gender = '' } = {} } = {},
      personalStyle: { purchaseTypes = [], styles = [] } = {},
      maxMoney = -1
    } = {}
  } = useQueryUserInfo();

  const router = useRouter();

  useEffect(() => {
    queryClient.invalidateQueries(queryKeys.users.userInfo());
  }, [queryClient]);

  const sizeParser = () => {
    let result = '';

    if (size?.value) {
      const { value } = size;
      // TODO 추후 로직 재작성
      result = `${value?.tops[0] ? value?.tops[0].viewSize : ''} ${
        value?.tops.length > 1 ? '(...)' : ''
      } ${value?.tops[0] && value?.bottoms[0] ? ' / ' : ''} ${
        value?.bottoms[0] ? value?.bottoms[0].viewSize : ''
      } ${value?.bottoms.length > 1 ? '(...)' : ''} ${
        (value?.tops[0] || value?.bottoms[0]) && value?.shoes[0] ? ' / ' : ''
      } ${value?.shoes[0] ? value?.shoes[0].viewSize : ''} ${
        value?.shoes.length > 1 ? '(...)' : ''
      }`;
    }

    return result.trim() ? result : '사이즈가 어떻게 되세요?';
  };

  const returnBudget = () => {
    if (maxMoney <= 0) {
      return (
        <strong style={{ fontWeight: typography.body2.weight.medium }}>
          {maxMoney === -1 ? '최대 예산 전체보기' : '예산이 얼마이신가요?'}
        </strong>
      );
    }
    return (
      <div>
        <strong style={{ fontWeight: typography.body2.weight.medium }}>
          {commaNumber(maxMoney)}
        </strong>{' '}
        만원
      </div>
    );
  };

  const handleClickRoute = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (size) {
      const sizeArr = [
        ...(size.value?.bottoms || []),
        ...(size.value?.tops || []),
        ...(size.value?.shoes || [])
      ];
      logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
        name: 'MY',
        att: target.dataset.att,
        value:
          target.dataset.att === 'SIZE'
            ? sizeArr.map((sizeItem) => sizeItem.viewSize).join(',')
            : target.dataset.value || ''
      });
    }

    router.push(`${BASE_URL_USER}/${target.dataset.param}`);
  };

  return (
    <Box
      customStyle={{
        padding: '32px 0',
        borderBottom: `1px solid ${common.ui90}`
      }}
    >
      <Typography
        variant="h4"
        weight="bold"
        customStyle={{ color: common.ui20, marginBottom: 16 }}
        onClick={() => router.push('/onboarding')}
      >
        내 정보
      </Typography>
      <Flexbox gap={8} customStyle={{ flexWrap: 'wrap' }}>
        <MyInfoBox
          variant="solid"
          data-param="personalInput"
          data-att="INFO"
          data-value={`${gender === 'F' ? '여' : '남'}, ${yearOfBirth}`}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            성별 출생연도
          </Typography>
          <Typography variant="body2" weight="medium">
            {gender === 'F' ? '여' : '남'}, {yearOfBirth}
          </Typography>
        </MyInfoBox>
        <MyInfoBox
          variant="solid"
          data-param="sizeInput"
          data-att="SIZE"
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            사이즈
          </Typography>
          <ElipsisArea variant="body2">{sizeParser()}</ElipsisArea>
        </MyInfoBox>
        <MyInfoBox
          variant="solid"
          data-param="addressInput"
          data-att="ADDRESS"
          data-value={(area && area?.filter((list) => list.isActive)[0]?.areaName) || ''}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            거래지역
          </Typography>
          <ElipsisArea variant="body2">
            {(area && area?.filter((list) => list.isActive)[0]?.areaName) || '어디서 거래하시나요?'}
          </ElipsisArea>
        </MyInfoBox>
        <MyInfoBox
          variant="solid"
          data-param="budgetInput"
          data-att="BUDGET"
          data-value={maxMoney}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            예산
          </Typography>
          <Typography variant="body2" customStyle={{ textAlign: 'left' }}>
            {returnBudget()}
          </Typography>
        </MyInfoBox>
        <MyInfoBox
          variant="solid"
          data-param="likeModelInput"
          data-att="LIKEMODEL"
          data-value={maxMoney}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            관심모델
          </Typography>
          <ElipsisArea variant="body2">
            {styles.length > 0
              ? styles.map(({ name }) => name).join(' / ')
              : '카멜에게 알려주세요.'}
          </ElipsisArea>
        </MyInfoBox>
        <MyInfoBox
          variant="solid"
          data-param="purchaseInput"
          data-att="PURCHASE"
          data-value={maxMoney}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            중고 구매 시 중요한 부분
          </Typography>
          <ElipsisArea variant="body2" customStyle={{ textAlign: 'left' }}>
            {find(purchaseType, { value: purchaseTypes[0]?.id })?.subTitle ||
              '카멜에게 알려주세요.'}
          </ElipsisArea>
        </MyInfoBox>
      </Flexbox>
    </Box>
  );
}

const MyInfoBox = styled(Button)`
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  width: 48%;
  height: 49px;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
  padding: 8px 16px;
`;

const ElipsisArea = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  text-align: left;
  font-weight: ${({ theme: { typography } }) => typography.body2.weight.medium};
`;

export default MypageUserInfo;
