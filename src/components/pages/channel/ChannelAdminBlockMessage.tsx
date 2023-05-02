import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface ChannelAdminBlockMessageProps {
  message: AdminMessage;
}

function ChannelAdminBlockMessage({ message: { createdAt } }: ChannelAdminBlockMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_ASK, {
      name: attrProperty.name.CHANNEL_DETAIL
    });

    ChannelTalk.showMessenger();
  };

  return (
    <Flexbox
      direction="vertical"
      gap={6}
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Box
        customStyle={{
          flexGrow: 1,
          padding: 20,
          border: `1px solid ${common.line01}`,
          borderRadius: 20
        }}
      >
        <Box>🚨</Box>
        <Typography
          variant="h4"
          weight="bold"
          color="red-light"
          customStyle={{
            marginTop: 20
          }}
        >
          거래를 즉시 중단해주세요.
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          관리자에게 차단된 유저입니다.
          <br />
          피해를 당하셨다면 1:1 문의로 신고해주세요.
        </Typography>
        <Button
          variant="ghost"
          brandColor="black"
          fullWidth
          onClick={handleClick}
          customStyle={{
            marginTop: 20
          }}
        >
          1:1 문의하기
        </Button>
      </Box>
      <Typography
        variant="small2"
        color="ui60"
        customStyle={{
          color: common.ui60
        }}
      >
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelAdminBlockMessage;
