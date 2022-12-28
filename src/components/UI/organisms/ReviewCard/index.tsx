import { Flexbox, Rating, Typography, useTheme } from 'mrcamel-ui';

import { PRODUCT_SITE, REPORT_STATUS } from '@constants/product';

import { Content, Wrapper } from './ReviewCard.styles';

interface ReviewCardProps {
  reportStatus: keyof typeof REPORT_STATUS;
  creator: string;
  isMyReview?: boolean;
  content: string;
  score: number;
  curnScore?: number;
  maxScore: number;
  siteId?: number;
  onClickBlock: () => void;
  onClickReport: () => void;
}

function ReviewCard({
  reportStatus,
  creator,
  isMyReview = false,
  content,
  score,
  curnScore,
  maxScore,
  siteId,
  onClickBlock,
  onClickReport
}: ReviewCardProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Wrapper>
      {REPORT_STATUS[reportStatus] === REPORT_STATUS[0] && (
        <>
          {creator && (
            <Flexbox alignment="center" justifyContent="space-between">
              <Flexbox alignment="center" justifyContent="space-between" gap={4}>
                <Typography variant="body1" weight="bold">
                  {creator}
                </Typography>
                {!isMyReview && (
                  <Typography
                    variant="body2"
                    customStyle={{
                      textDecorationLine: 'underline',
                      color: common.ui60,
                      cursor: 'pointer'
                    }}
                    onClick={onClickBlock}
                  >
                    차단
                  </Typography>
                )}
              </Flexbox>
              <Flexbox alignment="center">
                {!Number.isNaN(curnScore) && Math.floor(score / 2) !== 0 && (
                  <Rating
                    size="small"
                    count={5}
                    value={maxScore === 10 ? Math.floor(score / 2) : score}
                    customStyle={{ gap: 0, '& > svg': { color: '#FEB700 !important' } }}
                  />
                )}
              </Flexbox>
            </Flexbox>
          )}
          <Content>{`${content}${
            siteId === PRODUCT_SITE.DAANGN.id && score ? ` (${score})` : ''
          }`}</Content>
          {!isMyReview && (
            <Typography
              variant="body2"
              customStyle={{
                textDecorationLine: 'underline',
                color: common.ui60,
                cursor: 'pointer'
              }}
              onClick={onClickReport}
            >
              신고하기
            </Typography>
          )}
        </>
      )}
      {REPORT_STATUS[reportStatus] === REPORT_STATUS[1] && (
        <Content>신고에 의해 숨김 처리된 리뷰입니다.</Content>
      )}
      {REPORT_STATUS[reportStatus] === REPORT_STATUS[2] && (
        <Content>차단하신 사용자의 리뷰입니다.</Content>
      )}
    </Wrapper>
  );
}

export default ReviewCard;
