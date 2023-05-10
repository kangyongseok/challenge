import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import type { FileMessage } from '@sendbird/chat/message';
import { Image } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

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
  const [imageUrl] = useState(message.url);

  const handleClickImage = () => {
    if (!imageRendered) return;

    setChannelThumbnailMessageImageState(message.url);
  };

  useEffect(() => {
    if (imageUrl) {
      window.flexibleContent.scrollTo({
        top: window.flexibleContent.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [imageUrl]);

  return (
    <ThumbnailMessage isByMe={isByMe} nextMessageUserIsDiff={nextMessageUserIsDiff}>
      <ChannelMessageStatus isByMe={isByMe} status={status} createdAt={message.createdAt} />
      <ImageWrapper onClick={handleClickImage}>
        <Image
          width="100%"
          height={160}
          src={imageUrl}
          alt="Message Img"
          round={20}
          disableAspectRatio
          disableOnBackground={false}
          customStyle={{
            maxWidth: 160,
            minWidth: 160
          }}
        />
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
