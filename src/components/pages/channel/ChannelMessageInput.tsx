import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import type { SendableMessage } from '@sendbird/chat/lib/__definition';
import { Flexbox, Icon, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import useOutsideClickRef from '@hooks/useOutsideClickRef';
import useMutationSendMessage from '@hooks/useMutationSendMessage';

interface ChannelMessageInputProps {
  isLoading: boolean;
  channelId: number | undefined;
  channelUrl: string | undefined;
  setIsFocused: Dispatch<SetStateAction<boolean>>;
  isDeletedTargetUser: boolean;
  isTargetUserBlocked: boolean;
  isTargetUserNoti: boolean | undefined;
  isAdminBlockUser: boolean;
  updateNewMessage: (msg: SendableMessage) => void;
  targetUserId: number;
  productId: number;
  fileUrl?: string;
  lastMessageIndex: number;
}

function ChannelMessageInput({
  isLoading,
  channelId,
  channelUrl,
  setIsFocused,
  isDeletedTargetUser,
  isTargetUserBlocked,
  isTargetUserNoti,
  isAdminBlockUser,
  updateNewMessage,
  targetUserId,
  productId,
  fileUrl,
  lastMessageIndex
}: ChannelMessageInputProps) {
  const { mutate: mutateSendMessage, isLoading: isLoadingMutate } = useMutationSendMessage({
    lastMessageIndex
  });

  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const textareaAutosizeRef = useRef<HTMLTextAreaElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [outsideClickRef] = useOutsideClickRef(() => setIsFocused(false));

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.currentTarget.value);

  // const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  //   if (
  //     e.keyCode === 13 &&
  //     !checkAgent.isMobileApp() &&
  //     window.performance &&
  //     window.performance.memory
  //   ) {
  //     if (e.shiftKey) return;
  //     e.preventDefault();
  //     handleClickSand();
  //   }
  // };

  const handleClickSand = useCallback(async () => {
    if (!channelId || !channelUrl || !message || isLoadingMutate || pending) return;

    hiddenInputRef.current?.focus();
    textareaAutosizeRef.current?.focus();

    setPending(true);

    await mutateSendMessage({
      data: { channelId, content: message, event: 'LAST_MESSAGE' },
      channelUrl,
      isTargetUserNoti,
      userId: targetUserId,
      productId,
      fileUrl,
      callback: (msg) => {
        updateNewMessage(msg);
        setMessage('');
        setPending(false);
      },
      failCallback: () => setPending(false),
      onPending: () => setPending(true)
    });
  }, [
    channelId,
    channelUrl,
    fileUrl,
    isLoadingMutate,
    isTargetUserNoti,
    message,
    mutateSendMessage,
    pending,
    productId,
    targetUserId,
    updateNewMessage
  ]);

  useEffect(() => {
    setPending(false);
  }, []);

  if (isLoading) {
    return (
      <InputLayout>
        <Skeleton width="100%" height={45} round={8} disableAspectRatio />
        <Skeleton width={44} height={45} round={8} disableAspectRatio />
      </InputLayout>
    );
  }

  return (
    <InputLayout ref={outsideClickRef}>
      {!isDeletedTargetUser && !isTargetUserBlocked && !isAdminBlockUser && (
        <>
          <InputWrapper>
            <HiddenInput ref={hiddenInputRef} />
            <HiddenLabel htmlFor="message_input">message input textarea</HiddenLabel>
            <TextareaAutosize
              ref={textareaAutosizeRef}
              maxRows={3}
              maxLength={500}
              placeholder="메시지 보내기"
              value={message}
              onChange={handleChange}
              // onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
            />
          </InputWrapper>
          <Flexbox alignment="center" justifyContent="center">
            <SandIcon
              name="SandFilled"
              onClick={handleClickSand}
              disabled={!channelId || !channelUrl || !message || isLoadingMutate || pending}
            />
          </Flexbox>
        </>
      )}
      {isDeletedTargetUser && (
        <Typography variant="h4" color="ui60" customStyle={{ padding: 12 }}>
          상대방과 대화가 불가능해요.
        </Typography>
      )}
      {(isTargetUserBlocked || (!isDeletedTargetUser && isAdminBlockUser)) && (
        <Typography variant="h4" color="ui60" customStyle={{ padding: 12 }}>
          차단된 상대와는 대화할 수 없어요.
        </Typography>
      )}
    </InputLayout>
  );
}

const InputLayout = styled.div`
  display: flex;
  padding: 12px 20px 8px 20px;
  gap: 16px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex: 1 1 0;
  -webkit-box-flex: 1;
  background-color: ${({ theme: { palette } }) => palette.common.ui95};
  border-radius: 8px;
  padding: 0 12px 12px;

  & > textarea {
    width: 100%;
    resize: none;
    background-color: inherit;
    padding-top: 12px;
    height: 32px;

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    :focus {
      outline: 0;
    }
    ::placeholder {
      color: ${({
        theme: {
          palette: { common }
        }
      }) => common.ui80};
      white-space: pre-wrap;
    }
  }
`;

const SandIcon = styled(Icon)<{ disabled: boolean }>`
  min-width: 28px;
  width: 28px;
  height: 28px;
  color: ${({ disabled, theme: { palette } }) => (disabled ? palette.common.ui90 : '#425BFF')};
  cursor: pointer;
`;

const HiddenInput = styled.input`
  position: absolute;
  pointer-events: none;
  opacity: 0;
`;

const HiddenLabel = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0px, 0px, 0px, 0px);
  clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
`;

export default ChannelMessageInput;
