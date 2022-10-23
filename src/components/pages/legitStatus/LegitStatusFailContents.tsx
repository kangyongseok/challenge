import { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import authInfoIcon from '@constants/authInfoIcon';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

const guidCardData = [
  {
    text: '내부 브랜드 각인',
    Icon: authInfoIcon.ImportantIconBrand
  },
  {
    text: '내부 숫자,영문 각인',
    Icon: authInfoIcon.ImportantIconEngrave
  },
  {
    text: '프린팅 디테일',
    Icon: authInfoIcon.ImportantIconDetail
  },
  {
    text: '영수증 및 개런티카드',
    Icon: authInfoIcon.ImportantIconReceipt
  },
  {
    text: '지퍼 앞뒷면',
    Icon: authInfoIcon.ImportantIconZipper
  },
  {
    text: '금속 부속품',
    Icon: authInfoIcon.ImportantIconPart
  }
];

function LegitStatusFailContents() {
  const router = useRouter();
  const splitIds = String(router.query.id || '').split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const [isAuthUser, setIsAuthUser] = useState(false);

  const { data: { status = 0, userId, legitOpinions = [], canModified } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id
    }
  );

  useEffect(() => {
    if ((accessUser || {}).userId === userId) {
      setIsAuthUser(true);
    }
  }, [userId, accessUser]);

  if (status !== 11 && status !== 12) return null;

  return (
    <Box
      customStyle={{
        textAlign: 'center',
        marginBottom: 64
      }}
    >
      {(status === 11 ||
        (status === 12 && !canModified) ||
        (status === 12 && canModified && !isAuthUser)) && (
        <Typography weight="bold" variant="h3">
          판매자의 현재 사진들로는
          <Flexbox alignment="center" justifyContent="center">
            <Typography brandColor="red" weight="bold" variant="h3">
              사진감정이 불가
            </Typography>
            해요
          </Flexbox>
        </Typography>
      )}
      {status === 12 && canModified && isAuthUser && (
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{ '& > strong': { color: secondary.red.light } }}
        >
          카멜이 {(accessUser || {}).userName || '회원'}님 <strong>대신</strong>
          <br /> <strong>부족한 사진을 받아</strong>
          <br />
          <strong>감정</strong>을 계속할까요?
        </Typography>
      )}
      {!isEmpty(legitOpinions) && legitOpinions[0].description && (
        <OpinionCard>
          <Typography weight="bold" customStyle={{ marginBottom: 4 }}>
            camel
          </Typography>
          <Typography variant="small1" customStyle={{ color: common.ui60 }}>
            카멜 실시간 사진감정팀
          </Typography>
          <Typography
            customStyle={{ marginTop: 8 }}
            dangerouslySetInnerHTML={{
              __html: !isEmpty(legitOpinions)
                ? legitOpinions[0].description.replaceAll(/\r?\n/gi, '<br />') || ''
                : ''
            }}
          />
        </OpinionCard>
      )}
      {(status === 11 ||
        (status === 12 && !canModified) ||
        (status === 12 && canModified && !isAuthUser)) && (
        <Box>
          <Typography customStyle={{ marginBottom: 11 }}>사진감정시 필요사진</Typography>
          <GuidImage alignment="center" justifyContent="center">
            {guidCardData.map(({ text, Icon }) => (
              <GuidCard key={`guid-card-${text}`}>
                <Icon />
                <Typography variant="small2">{text}</Typography>
              </GuidCard>
            ))}
          </GuidImage>
        </Box>
      )}
    </Box>
  );
}

const OpinionCard = styled.div`
  position: relative;
  width: 100%;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0 32px;
  text-align: left;
`;

const GuidImage = styled(Flexbox)`
  flex-wrap: wrap;
`;

const GuidCard = styled.div`
  min-width: 96px;
  height: 96px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-left: -1px;
  margin-top: -1px;
`;

export default LegitStatusFailContents;
