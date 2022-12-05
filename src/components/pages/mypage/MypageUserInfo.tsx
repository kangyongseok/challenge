import { MouseEvent, useEffect } from 'react';

import { useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { purchaseType } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

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
  } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  const router = useRouter();

  useEffect(() => {
    queryClient.invalidateQueries(queryKeys.users.userInfo());
  }, [queryClient]);

  const sizeParser = () => {
    let result = '';

    if (size) {
      const {
        value: { tops = [], bottoms = [], shoes = [] }
      } = size;
      // TODO 추후 로직 재작성
      result = `${tops[0] ? tops[0].viewSize : ''} ${tops.length > 1 ? '(...)' : ''} ${
        tops[0] && bottoms[0] ? ' / ' : ''
      } ${bottoms[0] ? bottoms[0].viewSize : ''} ${bottoms.length > 1 ? '(...)' : ''} ${
        (tops[0] || bottoms[0]) && shoes[0] ? ' / ' : ''
      } ${shoes[0] ? shoes[0].viewSize : ''} ${shoes.length > 1 ? '(...)' : ''}`;
    }

    return result.trim() ? result : '사이즈가 어떻게 되세요?';
  };

  const returnBudget = () => {
    if (maxMoney <= 0) {
      return (
        <strong style={{ fontWeight: typography.small1.weight.medium }}>
          {maxMoney === -1 ? '최대 예산 전체보기' : '예산이 얼마이신가요?'}
        </strong>
      );
    }
    return (
      <div>
        <strong style={{ fontWeight: typography.small1.weight.medium }}>
          {commaNumber(maxMoney)}
        </strong>{' '}
        만원
      </div>
    );
  };

  const handleClickRoute = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (size) {
      const sizeArr = [...size.value.bottoms, ...size.value.tops, ...size.value.shoes];
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
        {/* <MyInfoBox
          variant="contained"
          data-param="categoryInput"
          data-att="CATEGORY"
          onClick={handleClickRoute}
        >
          <Typography
            weight="bold"
            variant="small2"
            customStyle={{ color: palette.common.grey['60'] }}
          >
            카테고리
          </Typography>
          <ElipsisArea variant="small1">
            {Object.values(subParentCategories.map(({ name }) => name)).join(', ') || '0개'}
          </ElipsisArea>
        </MyInfoBox>
        <MyInfoBox
          variant="contained"
          data-param="brandInput"
          data-att="BRAND"
          onClick={handleClickRoute}
        >
          <Typography
            weight="bold"
            variant="small2"
            customStyle={{ color: palette.common.grey['60'] }}
          >
            브랜드
          </Typography>
          <ElipsisArea variant="small1">
            {Object.values(brands.map(({ name }) => name)).join(', ') || '0개'}
          </ElipsisArea>
        </MyInfoBox> */}
        <MyInfoBox
          variant="contained"
          data-param="personalInput"
          data-att="INFO"
          data-value={`${gender === 'M' ? '남' : '여'}, ${yearOfBirth}`}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            성별 출생연도
          </Typography>
          <Typography variant="body2" weight="medium">
            {gender === 'M' ? '남' : '여'}, {yearOfBirth}
          </Typography>
        </MyInfoBox>
        <MyInfoBox
          variant="contained"
          data-param="sizeInput"
          data-att="SIZE"
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            사이즈
          </Typography>
          <ElipsisArea variant="small1">{sizeParser()}</ElipsisArea>
        </MyInfoBox>
        <MyInfoBox
          variant="contained"
          data-param="addressInput"
          data-att="ADDRESS"
          data-value={(area && area?.filter((list) => list.isActive)[0]?.areaName) || ''}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            거래지역
          </Typography>
          <ElipsisArea variant="small1">
            {(area && area?.filter((list) => list.isActive)[0]?.areaName) || '어디서 거래하시나요?'}
          </ElipsisArea>
        </MyInfoBox>
        <MyInfoBox
          variant="contained"
          data-param="budgetInput"
          data-att="BUDGET"
          data-value={maxMoney}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            예산
          </Typography>
          <Typography variant="small1" customStyle={{ textAlign: 'left' }}>
            {returnBudget()}
          </Typography>
        </MyInfoBox>
        <MyInfoBox
          variant="contained"
          data-param="likeModelInput"
          data-att="LIKEMODEL"
          data-value={maxMoney}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            관심모델
          </Typography>
          <ElipsisArea variant="small1">
            {styles.length > 0
              ? styles.map(({ name }) => name).join(' / ')
              : '카멜에게 알려주세요.'}
          </ElipsisArea>
        </MyInfoBox>
        <MyInfoBox
          variant="contained"
          data-param="purchaseInput"
          data-att="PURCHASE"
          data-value={maxMoney}
          onClick={handleClickRoute}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.ui60 }}>
            중고 구매 시 중요한 부분
          </Typography>
          <ElipsisArea variant="small1" customStyle={{ textAlign: 'left' }}>
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
  font-weight: ${({ theme: { typography } }) => typography.small1.weight.medium};
`;

export default MypageUserInfo;
