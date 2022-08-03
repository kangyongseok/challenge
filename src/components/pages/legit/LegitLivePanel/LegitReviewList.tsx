import { Box, Flexbox, Rating, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

const reviews = [
  {
    id: 29681,
    date: '2022.07.27',
    message: '가품 판정을 손쉽고 빠르게 해주십니다',
    rating: 5
  },
  {
    id: 70199,
    date: '2022.07.25',
    message: '빠르고 친절한 답변, 그리고 감정결과에 대한 이유까지 알려줌',
    rating: 5
  },
  {
    id: 12943,
    date: '2022.07.21',
    message:
      '정품일거라고 예상하고 맡겨서 완전히 판단에 도움이 된 건 아니지만 내 판단에 확신이 생김',
    rating: 4
  },
  {
    id: 69130,
    date: '2022.07.20',
    message: '모르는 디테일을 보고 말해주니까 가품걱정을 덜어줘요',
    rating: 5
  },
  {
    id: 11502,
    date: '2022.07.20',
    message: '꼼꼼히 봐주셔서 감사드립니다.',
    rating: 5
  },
  {
    id: 10281,
    date: '2022.07.12',
    message: '자세한 피드백이 있네요.',
    rating: 4
  }
];

function LegitReviewList() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <StyledReviewList>
      {reviews.map(({ id, date, message, rating }) => (
        <ReviewCard key={`legit-review-${id}`}>
          <QuotesIcon />
          <Flexbox gap={3} alignment="flex-end" customStyle={{ marginTop: 8 }}>
            <Typography weight="bold">UserID</Typography>
            <Typography weight="bold">{id}</Typography>
            <Typography variant="small1" weight="light" customStyle={{ color: common.grey['60'] }}>
              {date}
            </Typography>
          </Flexbox>
          <Box customStyle={{ marginTop: 10 }}>
            {/* TODO customStyle 적용되지 않는 문제 수정 */}
            <Rating count={5} value={rating} size="small" />
          </Box>
          <Typography
            customStyle={{ marginTop: 10, whiteSpace: 'pre-wrap', color: common.grey['40'] }}
          >
            {message}
          </Typography>
        </ReviewCard>
      ))}
    </StyledReviewList>
  );
}

const StyledReviewList = styled.section`
  margin: 52px -20px 0;
  padding: 0 20px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;

  & > div {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const ReviewCard = styled.div`
  display: inline-block;
  min-width: 312px;
  max-width: 312px;
  height: 184px;
  padding: 32px 20px 0;
  border-radius: ${({ theme: { box } }) => box.round['16']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  vertical-align: middle;
`;

function QuotesIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.93309 0H4.05204L2.71375 4.01878H4.01487V8H0V4.39437L1.93309 0ZM7.88104 0H10L8.66171 4.01878H9.96283V8H5.94796V4.39437L7.88104 0Z"
        fill="black"
      />
    </svg>
  );
}

export default LegitReviewList;
