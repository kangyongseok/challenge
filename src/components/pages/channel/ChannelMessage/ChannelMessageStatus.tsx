import { Typography } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { messageStates } from '@constants/channel';

interface ChannelMessageStatusProps {
  isByMe: boolean;
  status: string;
  createdAt: number;
}

function ChannelMessageStatus({ isByMe, status, createdAt }: ChannelMessageStatusProps) {
  return (
    <MessageStatus isByMe={isByMe}>
      {messageStates.read !== status && (
        <Typography variant="small2" weight="medium" customStyle={{ color: '#425BFF' }}>
          안읽음
        </Typography>
      )}
      <CreatedAt variant="small2">{dayjs(createdAt).format('A hh:mm')}</CreatedAt>
    </MessageStatus>
  );
}

const MessageStatus = styled.div<{ isByMe: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isByMe }) => (isByMe ? 'flex-end' : 'flex-start')};
  padding: 2px 0;
  gap: 2px;
`;

const CreatedAt = styled(Typography)`
  display: inline-flex;
  justify-content: flex-end;
  white-space: nowrap;
  color: ${({ theme: { palette } }) => palette.common.ui60};
`;

export default ChannelMessageStatus;
