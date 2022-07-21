import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Flexbox, Rating, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductSellerReview } from '@dto/product';

import Amplitude from '@library/amplitude';

import { postSellerReport } from '@api/product';

import { REPORT_STATUS } from '@constants/product';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ReviewCardProps {
  sellerReview: ProductSellerReview;
  curnScore: string | null;
  maxScore: string | null;
  productId: number;
  onReport(): void;
  onBlock(): void;
}

function ReviewCard({
  sellerReview: { id, reportStatus, creator, content, score },
  curnScore,
  maxScore,
  productId,
  onReport,
  onBlock
}: ReviewCardProps) {
  const { data: accessUser } = useQueryAccessUser();
  const {
    mutate: block,
    isLoading: isBlocking,
    isSuccess: isBlocked
  } = useMutation(postSellerReport);
  const {
    mutate: report,
    isLoading: isReporting,
    isSuccess: isReported
  } = useMutation(postSellerReport);
  const {
    theme: { palette }
  } = useTheme();

  const router = useRouter();
  const handleBlock = () => {
    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      return;
    }

    if (isBlocking) {
      return;
    }
    block({
      creator,
      deviceId: Amplitude.getClient().getDeviceId(),
      productId,
      reportType: 0,
      userId: accessUser.userId
    });
    onBlock();
  };

  const handleReport = () => {
    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      return;
    }
    if (isReporting) {
      return;
    }
    report({
      deviceId: Amplitude.getClient().getDeviceId(),
      productId,
      reportType: 0,
      reviewId: id,
      userId: accessUser.userId
    });
    onReport();
  };

  let reportStatusWithState;
  if (isReported) {
    reportStatusWithState = 1;
  } else if (isBlocked) {
    reportStatusWithState = 2;
  } else {
    reportStatusWithState = reportStatus;
  }

  const reportStatusText = REPORT_STATUS[reportStatusWithState as keyof typeof REPORT_STATUS];

  return (
    <ReviewCardWrapper>
      {reportStatusText === REPORT_STATUS[0] && (
        <>
          <Flexbox alignment="center" justifyContent="space-between">
            <Flexbox alignment="center" justifyContent="space-between">
              <Typography variant="body2" weight="medium">
                {creator}
              </Typography>
              <Typography
                onClick={handleBlock}
                variant="body2"
                customStyle={{
                  marginLeft: 6,
                  color: palette.common.grey['60']
                }}
              >
                차단
              </Typography>
            </Flexbox>
            <Flexbox alignment="center">
              <Button
                variant="ghost"
                brandColor="black"
                onClick={handleReport}
                customStyle={{
                  padding: '0 4px',
                  marginRight: 8,
                  height: 18
                }}
              >
                <Typography
                  variant="body2"
                  weight="medium"
                  customStyle={{
                    color: palette.common.grey['60']
                  }}
                >
                  신고
                </Typography>
              </Button>
              {!!curnScore && (
                <Rating
                  count={5}
                  value={maxScore === '10' ? Math.floor(Number(score) / 2) : Number(score)}
                />
              )}
            </Flexbox>
          </Flexbox>
          <ReviewContent variant="body2">{content}</ReviewContent>
        </>
      )}
      {reportStatusText === REPORT_STATUS[1] && (
        <ReviewContent variant="body2">신고에 의해 숨김 처리된 리뷰입니다.</ReviewContent>
      )}
      {reportStatusText === REPORT_STATUS[2] && (
        <ReviewContent variant="body2">차단하신 사용자의 리뷰입니다.</ReviewContent>
      )}
    </ReviewCardWrapper>
  );
}

const ReviewCardWrapper = styled.div`
  margin-top: 8px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.palette.common.grey['98']};
  border-radius: ${({ theme }) => theme.box.round['8']};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ReviewContent = styled(Typography)`
  margin-top: 4px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export default ReviewCard;
