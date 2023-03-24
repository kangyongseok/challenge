import { Flexbox, Typography } from 'mrcamel-ui';
import type { UserMessage } from '@sendbird/chat/message';
import styled from '@emotion/styled';

import ChannelMessageStatus from './ChannelMessageStatus';

interface ChannelOGMessageProps {
  message: UserMessage;
  status: string;
  isByMe: boolean;
}

function ChannelOGMessage({ message, status, isByMe }: ChannelOGMessageProps) {
  const handleClickOGUrl = () => {
    if (message.ogMetaData?.url) window.open(message.ogMetaData?.url);
  };

  return (
    <OGMessage isByMe={isByMe}>
      <ChannelMessageStatus isByMe={isByMe} status={status} createdAt={message.createdAt} />
      <Flexbox
        direction="vertical"
        onClick={handleClickOGUrl}
        customStyle={{ cursor: 'pointer', position: 'relative' }}
      >
        <ImageWrapper>
          <Image url={message.ogMetaData?.defaultImage?.url || ''} />
        </ImageWrapper>
        <OgMetaDataWrapper>
          <Typography weight="bold">{message.ogMetaData?.title}</Typography>
          <Typography variant="body2">{message.ogMetaData?.description}</Typography>
        </OgMetaDataWrapper>
      </Flexbox>
    </OGMessage>
  );
}

const OGMessage = styled.div<{ isByMe: boolean }>`
  display: flex;
  flex-direction: ${({ isByMe }) => (isByMe ? 'row' : 'row-reverse')};
  justify-content: flex-end;
  align-items: flex-end;
  column-gap: 8px;
  margin-bottom: 12px;
`;

const ImageWrapper = styled.div`
  width: 100%;
  min-width: 160px;
  max-width: 260px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const Image = styled.div<{ url: string }>`
  width: 100%;
  height: 160px;
  min-width: 160px;
  max-width: 260px;
  position: absolute;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-image: url(${({ url }) => url});
  border-radius: 20px 20px 0 0;
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
`;

const OgMetaDataWrapper = styled.div`
  width: 100%;
  min-width: 160px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 20px 20px;
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
  padding: 8px 12px;
`;

export default ChannelOGMessage;
