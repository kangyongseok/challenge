import { useRouter } from 'next/router';
import { Typography } from '@mrcamelhub/camel-ui';

function ChannelAppointmentMessage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Typography
      variant="body2"
      weight="medium"
      color="ui60"
      textAlign="center"
      onClick={() => router.push(`/channels/${id}/appointment`)}
      customStyle={{
        margin: '20px 0',
        '& > span': {
          textDecoration: 'underline'
        }
      }}
    >
      직거래로 거래한다면 약속을 만들어보세요. <span>직거래 약속하기</span>
    </Typography>
  );
}

export default ChannelAppointmentMessage;
