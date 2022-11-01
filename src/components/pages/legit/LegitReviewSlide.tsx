import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { Flexbox, Label, Typography, useTheme } from 'mrcamel-ui';

const reviews = [
  {
    id: 29681,
    message: '가품 판정을 손쉽고 빠르게 해주십니다'
  },
  {
    id: 70199,
    message: '빠르고 친절한 답변, 그리고 감정결과에 대한 이유까지 알려줌'
  },
  {
    id: 12943,
    message:
      '정품일거라고 예상하고 맡겨서 완전히 판단에 도움이 된 건 아니지만 내 판단에 확신이 생김'
  },
  {
    id: 69130,
    message: '모르는 디테일을 보고 말해주니까 가품걱정을 덜어줘요'
  },
  {
    id: 11502,
    message: '꼼꼼히 봐주셔서 감사드립니다.'
  },
  {
    id: 10281,
    message: '자세한 피드백이 있네요.'
  }
];

function LegitReviewSlide() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      component="section"
      alignment="center"
      gap={8}
      customStyle={{ margin: '8px 20px 0', userSelect: 'none' }}
    >
      <Label variant="contained" brandColor="black" size="xsmall" text="USER REVIEW" />
      <Swiper
        slidesPerView={1}
        loop
        direction="vertical"
        effect="flip"
        preventClicks
        allowTouchMove={false}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        speed={700}
        modules={[Autoplay]}
        style={{ height: 26, width: '100%' }}
      >
        {reviews.map(({ id, message }) => (
          <SwiperSlide key={`legit-review-${id}`}>
            <Flexbox alignment="center" gap={8} customStyle={{ height: '100%' }}>
              <Flexbox
                alignment="center"
                gap={3}
                customStyle={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <Typography variant="body2" weight="bold">
                  {id}님
                </Typography>
                <Typography
                  variant="body2"
                  customStyle={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: common.ui60
                  }}
                >
                  {`“${message}”`}
                </Typography>
              </Flexbox>
            </Flexbox>
          </SwiperSlide>
        ))}
      </Swiper>
    </Flexbox>
  );
}

export default LegitReviewSlide;
