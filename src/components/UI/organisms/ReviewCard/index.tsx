import { Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';

import { PRODUCT_SITE, REPORT_STATUS } from '@constants/product';

import { Wrapper } from './ReviewCard.styles';

interface ReviewCardProps {
  reportStatus: keyof typeof REPORT_STATUS;
  creator: string;
  isMyReview?: boolean;
  isSeller?: boolean;
  isBuyer?: boolean;
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
  isSeller = false,
  isBuyer = false,
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
              <Flexbox alignment="center" gap={2}>
                <Typography variant="body1" weight="bold">
                  {creator}
                </Typography>
                {isSeller && (
                  <Label
                    text="판매자"
                    size="xsmall"
                    customStyle={{
                      color: common.ui60,
                      border: `1px solid ${common.line01}`,
                      alignItems: 'baseline'
                    }}
                  />
                )}
                {isBuyer && (
                  <Label
                    text="구매자"
                    size="xsmall"
                    customStyle={{
                      color: common.ui60,
                      border: `1px solid ${common.line01}`,
                      alignItems: 'baseline'
                    }}
                  />
                )}
              </Flexbox>
              <Flexbox alignment="center">
                {!Number.isNaN(curnScore) &&
                  Math.floor(score / 2) !== 0 &&
                  Array.from({ length: 5 }, (_, index) => index + 1).map((num) => {
                    if (num <= (maxScore === 10 ? Math.floor(score / 2) : score)) {
                      return (
                        <Icon
                          name="StarFilled"
                          width={16}
                          height={16}
                          customStyle={{
                            color: '#FFD911'
                          }}
                          key={num}
                        />
                      );
                    }
                    return (
                      <Icon
                        key={num}
                        name="StarOutlined"
                        width={16}
                        height={16}
                        customStyle={{
                          color: '#FFD911'
                        }}
                      />
                    );
                  })}
              </Flexbox>
            </Flexbox>
          )}
          <Typography>
            {`${content}${siteId === PRODUCT_SITE.DAANGN.id && score ? ` (${score})` : ''}`}
          </Typography>
          {!isMyReview && (
            <Flexbox alignment="center" gap={8}>
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
              <Typography
                variant="body2"
                customStyle={{
                  textDecorationLine: 'underline',
                  color: common.ui60,
                  cursor: 'pointer'
                }}
                onClick={onClickBlock}
              >
                차단하기
              </Typography>
            </Flexbox>
          )}
        </>
      )}
      {REPORT_STATUS[reportStatus] === REPORT_STATUS[1] && (
        <Typography>신고에 의해 숨김 처리된 리뷰입니다.</Typography>
      )}
      {REPORT_STATUS[reportStatus] === REPORT_STATUS[2] && (
        <Typography>차단하신 사용자의 리뷰입니다.</Typography>
      )}
    </Wrapper>
  );
}

export default ReviewCard;
