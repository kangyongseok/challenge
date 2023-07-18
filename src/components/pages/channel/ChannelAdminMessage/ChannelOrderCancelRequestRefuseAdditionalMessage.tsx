import { Flexbox, Typography } from '@mrcamelhub/camel-ui';

import ChannelTalk from '@library/channelTalk';

function ChannelOrderCancelRequestRefuseAdditionalMessage() {
  const handleClick = () => ChannelTalk.showMessenger();

  return (
    <Flexbox
      direction="vertical"
      gap={20}
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Typography
        variant="body2"
        weight="medium"
        textAlign="center"
        color="ui60"
        customStyle={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          '& > span': {
            textDecoration: 'underline'
          }
        }}
      >
        취소요청은 1회만 가능합니다.
        <br />
        거래에 문제가 있다면 <span onClick={handleClick}>결제/환불 문의</span>를 통해 알려주세요.
      </Typography>
      <Typography
        variant="body2"
        weight="medium"
        textAlign="center"
        color="ui60"
        customStyle={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}
      >
        취소요청이 거절되어 배송준비 상태로 변경되었습니다.
      </Typography>
    </Flexbox>
  );
}

export default ChannelOrderCancelRequestRefuseAdditionalMessage;
