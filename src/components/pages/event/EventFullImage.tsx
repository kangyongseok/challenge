import { Box } from 'mrcamel-ui';

import { WebpImg } from '@components/UI/atoms';

const BASE_URL = 'https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/images';
const eventImage: { srcName: string; alt: string }[] = [
  {
    srcName: 'seller01',
    alt: '카멜에서 판매 시작하기'
  },
  {
    srcName: 'seller02',
    alt: '이렇게 참여해요'
  },
  {
    srcName: 'seller03',
    alt: '이벤트 안내'
  }
];

function EventFullImage() {
  return (
    <>
      {eventImage.map(({ srcName, alt }, i) => (
        <Box key={`event-image-${srcName}`} customStyle={{ position: 'relative' }}>
          <WebpImg
            src={`${BASE_URL}/events/${srcName}`}
            alt={alt}
            style={{ width: '100%' }}
            index={i}
          />
        </Box>
      ))}
    </>
  );
}

export default EventFullImage;
