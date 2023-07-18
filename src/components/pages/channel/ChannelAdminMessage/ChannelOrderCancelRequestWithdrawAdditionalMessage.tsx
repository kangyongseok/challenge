import { Typography } from '@mrcamelhub/camel-ui';

function ChannelOrderCancelRequestWithdrawAdditionalMessage() {
  return (
    <Typography
      variant="body2"
      weight="medium"
      textAlign="center"
      color="ui60"
      customStyle={{
        margin: '20px 0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }}
    >
      취소요청이 철회되어
      <br />
      배송준비중 상태로 변경됩니다.
    </Typography>
  );
}

export default ChannelOrderCancelRequestWithdrawAdditionalMessage;
