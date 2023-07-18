import type { UserMessage } from '@sendbird/chat/message';
import { Box, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import ChannelMessageStatus from './ChannelMessageStatus';

interface ChannelTextMessageProps {
  message: UserMessage;
  status: string;
  isByMe: boolean;
  nextMessageUserIsDiff: boolean;
  hasSameTimeMessage: boolean;
  sameGroupLastMessage: boolean;
}

function ChannelTextMessage({
  message,
  status,
  isByMe,
  nextMessageUserIsDiff,
  hasSameTimeMessage,
  sameGroupLastMessage
}: ChannelTextMessageProps) {
  return (
    <TextMessage isByMe={isByMe} nextMessageUserIsDiff={nextMessageUserIsDiff}>
      {sameGroupLastMessage && (
        <ChannelMessageStatus isByMe={isByMe} status={status} createdAt={message.createdAt} />
      )}
      <Box>
        {['113', '112'].includes(message.sender.userId) && hasSameTimeMessage && (
          <CamelAgentTitle weight="medium" variant="small2" color="ui60" isByMe={isByMe}>
            카멜 구매대행
          </CamelAgentTitle>
        )}
        <Message isByMe={isByMe}>{message.message}</Message>
      </Box>
    </TextMessage>
  );
}

const TextMessage = styled.div<{ isByMe: boolean; nextMessageUserIsDiff: boolean }>`
  display: flex;
  flex-direction: ${({ isByMe }) => (isByMe ? 'row' : 'row-reverse')};
  justify-content: flex-end;
  align-items: flex-end;
  column-gap: 8px;
  margin-bottom: ${({ nextMessageUserIsDiff }) => (nextMessageUserIsDiff ? 12 : 4)}px;
`;

const CamelAgentTitle = styled(Typography)<{ isByMe: boolean }>`
  margin-bottom: 5px;
  margin-top: 15px;
  ${({ isByMe }) =>
    isByMe
      ? {
          padding: '0 10px 0 0',
          textAlign: 'right'
        }
      : {
          padding: '0 0 0 10px',
          textAlign: 'left'
        }}
`;

const Message = styled.div<{ isByMe: boolean }>`
  padding: 12px;
  max-width: 340px;
  white-space: pre-wrap;
  word-break: keep-all;
  border-radius: 20px;
  min-height: 44px;

  ${({ theme: { typography } }) => ({
    fontSize: typography.h4.size,
    fontWeight: typography.h4.weight.regular,
    lineHeight: typography.h4.lineHeight,
    letterSpacing: typography.h4.letterSpacing
  })};
  ${({ isByMe, theme: { palette } }) =>
    isByMe
      ? {
          color: palette.common.uiWhite,
          backgroundColor: palette.common.ui20
        }
      : {
          color: palette.common.ui20,
          backgroundColor: palette.common.bg02
        }};
`;

export default ChannelTextMessage;
