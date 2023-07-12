import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useSession from '@hooks/useSession';
import useChannel from '@hooks/useChannel';

interface ChannelReviewSentMessageProps {
  message: AdminMessage;
  targetUserName?: string;
  targetUserId?: number;
}

function ChannelReviewSentMessage({
  message: { data, createdAt },
  targetUserName,
  targetUserId
}: ChannelReviewSentMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useSession();

  const [isMyReview, setIsMyReview] = useState(false);

  const {
    useQueryChannel: { data: { product } = {} }
  } = useChannel();

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_REVIEW_DETAIL, {
      name: attrProperty.name.CHANNEL_DETAIL,
      att: 'SEND'
    });

    let pathname = `/userInfo/${targetUserId}?tab=reviews&scrollToReviewUserId=${accessUser?.userId}`;

    if (isMyReview) {
      pathname = `/user/shop?tab=2&scrollToReviewUserId=${targetUserId}`;
    }

    router.push(pathname);
  };

  useEffect(
    () => setIsMyReview(!!data && accessUser?.userId !== Number(JSON.parse(data)?.userId)),
    [accessUser?.userId, data]
  );

  if (isMyReview)
    return (
      <Flexbox
        gap={4}
        alignment="flex-end"
        customStyle={{
          margin: '20px 0'
        }}
      >
        <Box
          customStyle={{
            flexGrow: 1,
            maxWidth: 265,
            padding: 20,
            border: `1px solid ${common.line01}`,
            borderRadius: 20
          }}
        >
          <Typography variant="h4" weight="bold">
            후기를 받았어요.
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8,
              wordBreak: 'keep-all'
            }}
          >
            {targetUserName}님이 남긴 {product?.quoteTitle} 거래 후기를 확인해보세요.
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
            후기 확인하기
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

  return (
    <Flexbox
      gap={4}
      alignment="flex-end"
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Box
        customStyle={{
          flexGrow: 1,
          maxWidth: 265,
          padding: 20,
          border: `1px solid ${common.line01}`,
          borderRadius: 20
        }}
      >
        <Typography variant="h4" weight="bold">
          후기를 보냈어요.
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8,
            wordBreak: 'keep-all'
          }}
        >
          {targetUserName}님에게 거래 후기를 보냈어요.
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
          후기 확인하기
        </Button>
      </Box>
      <Typography variant="small2" color="ui60">
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelReviewSentMessage;
