import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Grid, Typography, useTheme } from 'mrcamel-ui';
import isEmpty from 'lodash-es/isEmpty';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { LegitPhotoGuideCard } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/productLegit';
import { fetchPhotoGuide } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { copyToClipboard } from '@utils/common';

import { toastState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

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
  const { userNickName } = useQueryMyUserInfo();

  const setToastState = useSetRecoilState(toastState);

  const [isAuthUser, setIsAuthUser] = useState(false);
  const [description, setDescription] = useState('');

  const {
    data: {
      status = 0,
      userId,
      legitOpinions = [],
      canModified,
      productResult: { brand: { id: brandId = 0 } = {}, category: { id: categoryId = 0 } = {} } = {}
    } = {},
    isSuccess
  } = useQuery(queryKeys.productLegits.legit(productId), () => fetchProductLegit(productId), {
    enabled: !!router.query.id
  });

  const { data: { photoGuideDetails = [] } = {} } = useQuery(
    queryKeys.commons.photoGuide({
      type: 1,
      brandId,
      categoryId
    }),
    () =>
      fetchPhotoGuide({
        type: 1,
        brandId,
        categoryId
      }),
    {
      enabled: isSuccess && !!brandId && !!categoryId
    }
  );

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_COPY, {
      name: attrProperty.name.PRE_CONFIRM_EDIT
    });
    setToastState({
      type: 'legitStatus',
      status: 'successCopy',
      theme: 'dark'
    });
    copyToClipboard(description);
  };

  const handleClickPhotoGuideDetail = (id: number) => () => {
    logEvent(attrKeys.legit.CLICK_UPLOAD_GUIDE, {
      name: attrProperty.name.PRE_CONFIRM_EDIT,
      title: 'CRAWLING'
    });

    router.push({
      pathname: '/legit/guide/sample',
      query: {
        brandId,
        categoryId,
        scrollToElementId: id
      }
    });
  };

  useEffect(() => {
    if ((accessUser || {}).userId === userId) {
      setIsAuthUser(true);
    }
  }, [userId, accessUser]);

  useEffect(() => {
    if (!isEmpty(legitOpinions) && legitOpinions[0]) {
      setDescription(legitOpinions[0].description);
    }
  }, [legitOpinions]);

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
          <Flexbox
            alignment="center"
            justifyContent="center"
            customStyle={{ '& > strong': { color: secondary.red.light } }}
          >
            <strong>사진감정이 불가</strong>
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
          카멜이 {userNickName}님 <strong>대신</strong>
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
              __html: description.replace(/\r?\n/g, '<br />')
            }}
          />
          {(status === 11 ||
            (status === 12 && !canModified) ||
            (status === 12 && canModified && !isAuthUser)) && (
            <Button
              variant="solid"
              size="medium"
              brandColor="black"
              fullWidth
              onClick={handleClick}
              customStyle={{ marginTop: 8 }}
            >
              문구 복사하기
            </Button>
          )}
        </OpinionCard>
      )}
      {(status === 11 || status === 12) &&
        photoGuideDetails.filter(({ imageSample }) => imageSample).length > 0 && (
          <Box customStyle={{ margin: '32px 20px 0' }}>
            <Typography
              variant="h4"
              weight="medium"
              customStyle={{ textAlign: 'left', marginBottom: 12 }}
            >
              필요사진 가이드라인
            </Typography>
            <Grid container columnGap={8} rowGap={8}>
              {photoGuideDetails
                .filter(({ imageSample }) => imageSample)
                .map((photoGuideDetail) => (
                  <Grid
                    key={`legit-status-photo-guide-detail-${photoGuideDetail.id}`}
                    item
                    xs={3}
                    onClick={handleClickPhotoGuideDetail(photoGuideDetail.id)}
                  >
                    <LegitPhotoGuideCard photoGuideDetail={photoGuideDetail} isDark hideLabel />
                  </Grid>
                ))}
            </Grid>
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
  margin-top: 24px;
  padding: 20px;
  text-align: left;
`;

export default LegitStatusFailContents;
