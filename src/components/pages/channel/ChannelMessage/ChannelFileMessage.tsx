import type { FileMessage } from '@sendbird/chat/message';
import styled from '@emotion/styled';

import { truncateString } from '@utils/common';

import ChannelMessageStatus from './ChannelMessageStatus';

interface ChannelFileMessageProps {
  message: FileMessage;
  status: string;
  isByMe: boolean;
  nextMessageUserIsDiff: boolean;
}

function ChannelFileMessage({
  message,
  status,
  isByMe,
  nextMessageUserIsDiff
}: ChannelFileMessageProps) {
  return (
    <FileMessageWrapper isByMe={isByMe} nextMessageUserIsDiff={nextMessageUserIsDiff}>
      {!nextMessageUserIsDiff && (
        <ChannelMessageStatus isByMe={isByMe} status={status} createdAt={message.createdAt} />
      )}
      <Message rel="noopener noreferrer" href={message.url} target="_blank" isByMe={isByMe}>
        {truncateString(message.name || message.url)}
      </Message>
    </FileMessageWrapper>
  );
}

const FileMessageWrapper = styled.div<{ isByMe: boolean; nextMessageUserIsDiff: boolean }>`
  display: flex;
  flex-direction: ${({ isByMe }) => (isByMe ? 'row' : 'row-reverse')};
  justify-content: flex-end;
  align-items: flex-end;
  column-gap: 8px;
  margin-bottom: ${({ nextMessageUserIsDiff }) => (nextMessageUserIsDiff ? 12 : 4)}px;
`;

const Message = styled.a<{ isByMe: boolean }>`
  padding: 12px;
  max-width: 340px;
  white-space: pre-wrap;
  word-break: break-all;
  border-radius: 20px;
  min-height: 44px;
  text-decoration: underline;
  cursor: pointer;

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

export default ChannelFileMessage;
