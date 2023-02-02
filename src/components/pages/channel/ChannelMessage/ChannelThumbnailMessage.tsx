import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import type { FileMessage } from '@sendbird/chat/message';
import styled from '@emotion/styled';

import { checkAgent, heicToBlob } from '@utils/common';
import { isVideoMessage } from '@utils/channel';

import { channelThumbnailMessageImageState } from '@recoil/channel';

import ChannelMessageStatus from './ChannelMessageStatus';

interface ChannelFileMessageProps {
  message: FileMessage;
  status: string;
  isByMe: boolean;
  nextMessageUserIsDiff: boolean;
}

function ChannelThumbnailMessage({
  message,
  status,
  isByMe,
  nextMessageUserIsDiff
}: ChannelFileMessageProps) {
  const setChannelThumbnailMessageImageState = useSetRecoilState(channelThumbnailMessageImageState);

  const [imageRendered, setImageRendered] = useState(false);
  const [imageUrl, setImageUrl] = useState(message.url);

  const handleClickImage = () => {
    if (!imageRendered) return;

    setChannelThumbnailMessageImageState(message.url);

    if (checkAgent.isIOSApp()) window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && ['image/heic', 'image/heif'].includes(message.type)) {
      heicToBlob(message.url, message.name).then((url) => {
        if (url) setImageUrl(url);
      });
    }
  }, [message.name, message.type, message.url]);

  return (
    <ThumbnailMessage isByMe={isByMe} nextMessageUserIsDiff={nextMessageUserIsDiff}>
      {!nextMessageUserIsDiff && (
        <ChannelMessageStatus isByMe={isByMe} status={status} createdAt={message.createdAt} />
      )}
      <ImageWrapper onClick={handleClickImage}>
        <Image url={imageUrl} />
        <HiddenImageLoader
          src={message.url}
          alt={message?.type}
          onLoad={() => setImageRendered(true)}
        />
      </ImageWrapper>
      {isVideoMessage(message) && !message.url && !imageRendered && (
        <Video>
          <source src={message.plainUrl} type={message.type} />
        </Video>
      )}
    </ThumbnailMessage>
  );
}

const ThumbnailMessage = styled.div<{ isByMe: boolean; nextMessageUserIsDiff: boolean }>`
  display: flex;
  flex-direction: ${({ isByMe }) => (isByMe ? 'row' : 'row-reverse')};
  justify-content: flex-end;
  align-items: flex-end;
  column-gap: 8px;
  margin-bottom: ${({ nextMessageUserIsDiff }) => (nextMessageUserIsDiff ? 12 : 4)}px;
`;

const ImageWrapper = styled.div`
  width: 100%;
  min-width: 160px;
  max-width: 160px;
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
  max-width: 160px;
  position: absolute;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-image: url(${({ url }) => url});
  border-radius: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
`;

const HiddenImageLoader = styled.img`
  display: none;
`;

const Video = styled.video`
  position: absolute;
  width: 100%;
  height: 160px;
  border-radius: 20px;
`;

export default ChannelThumbnailMessage;
