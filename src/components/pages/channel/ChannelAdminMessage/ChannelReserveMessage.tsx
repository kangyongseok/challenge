import { Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface ChannelReserveMessageProps {
  targetUserName: string;
}

function ChannelReserveMessage({ targetUserName }: ChannelReserveMessageProps) {
  return (
    <Flexbox
      direction="vertical"
      gap={15}
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Typography variant="body2" weight="medium" color="ui60" textAlign="center">
        {targetUserName}님과 거래 예약을 했어요.
      </Typography>
    </Flexbox>
  );
}

export default ChannelReserveMessage;
