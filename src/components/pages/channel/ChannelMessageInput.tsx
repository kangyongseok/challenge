import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import throttle from 'lodash-es/throttle';
import type { SendableMessage } from '@sendbird/chat/lib/__definition';
import styled from '@emotion/styled';

import { MESSAGE_ACTION_BUTTONS_HEIGHT, MESSAGE_INPUT_HEIGHT } from '@constants/common';

import useOutsideClickRef from '@hooks/useOutsideClickRef';
import useMutationSendMessage from '@hooks/useMutationSendMessage';

interface ChannelMessageInputProps {
  channelId: number | undefined;
  channelUrl: string | undefined;
  setMessageInputHeight: Dispatch<SetStateAction<number>>;
  setIsFocused: Dispatch<SetStateAction<boolean>>;
  isDeletedTargetUser: boolean;
  isTargetUserBlocked: boolean;
  isTargetUserNoti: boolean | undefined;
  isAdminBlockUser: boolean;
  scrollToBottom(behavior?: ScrollBehavior): void;
  updateNewMessage: (msg: SendableMessage) => void;
  targetUserId: number;
  productId: number;
  fileUrl?: string;
  lastMessageIndex: number;
}

function ChannelMessageInput({
  channelId,
  channelUrl,
  setMessageInputHeight,
  setIsFocused,
  isDeletedTargetUser,
  isTargetUserBlocked,
  isTargetUserNoti,
  isAdminBlockUser,
  scrollToBottom,
  updateNewMessage,
  targetUserId,
  productId,
  fileUrl,
  lastMessageIndex
}: ChannelMessageInputProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { mutate: mutateSendMessage, isLoading } = useMutationSendMessage({ lastMessageIndex });

  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const textareaAutosizeRef = useRef<HTMLTextAreaElement | null>(null);
  const [outsideClickRef] = useOutsideClickRef(() => {
    setIsFocused(false);
  });
  const throttleInputHeight = useRef(
    throttle((height: number) => setMessageInputHeight(height > 84 ? 84 : height), 200)
  );

  const handleFocus = useCallback(() => {
    scrollToBottom('smooth');
    setIsFocused(true);
  }, [scrollToBottom, setIsFocused]);

  const handleClickSand = useCallback(async () => {
    if (!channelId || !channelUrl || !message || isLoading || pending) return;

    hiddenInputRef.current?.focus();
    textareaAutosizeRef.current?.focus();

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
      failCallback: () => {
        setPending(false);
      },
      options: {
        onSettled() {
          setPending(true);
        }
      }
    });
  }, [
    channelId,
    channelUrl,
    fileUrl,
    isLoading,
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

  useEffect(() => {
    throttleInputHeight.current(
      (textareaAutosizeRef.current?.clientHeight || MESSAGE_INPUT_HEIGHT) + 12
    );
  }, [message]);

  return (
    <InputLayout ref={outsideClickRef}>
      {!isDeletedTargetUser && !isTargetUserBlocked && !isAdminBlockUser && (
        <>
          <InputWrapper>
            <HiddenInput ref={hiddenInputRef} />
            <HiddenLabel htmlFor="message_input">message input textarea</HiddenLabel>
            <TextareaAutosize
              id="message_input"
              ref={textareaAutosizeRef}
              maxRows={3}
              maxLength={500}
              placeholder="메시지 보내기"
              value={message}
              onChange={(e) =>
                setMessage((prevState) =>
                  prevState.length > 0 ? e.target.value : e.target.value.trim()
                )
              }
              onFocus={handleFocus}
              disabled={!channelId || !channelUrl || isLoading || pending}
            />
          </InputWrapper>
          <Flexbox
            alignment="center"
            justifyContent="center"
            customStyle={{
              height: MESSAGE_ACTION_BUTTONS_HEIGHT + 8,
              marginTop: 'auto',
              minWidth: 44
            }}
          >
            <SandIcon
              name="SandFilled"
              disabled={!channelId || !channelUrl || message.length === 0 || isLoading || pending}
              onClick={handleClickSand}
            />
          </Flexbox>
          <FooterBottomBackground />
        </>
      )}
      {isDeletedTargetUser && (
        <Typography variant="h4" customStyle={{ color: common.ui60, padding: 12 }}>
          상대방과 대화가 불가능해요.
        </Typography>
      )}
      {(isTargetUserBlocked || (!isDeletedTargetUser && isAdminBlockUser)) && (
        <Typography variant="h4" customStyle={{ color: common.ui60, padding: 12 }}>
          차단된 상대와는 대화할 수 없어요.
        </Typography>
      )}
    </InputLayout>
  );
}

const InputLayout = styled.div`
  position: relative;
  display: flex;
  min-height: ${MESSAGE_INPUT_HEIGHT}px;
  margin: 8px 8px 8px 16px;
  column-gap: 8px;
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

const SandIcon = styled(Icon)<{ disabled: boolean }>`
  min-width: 28px;
  width: 28px;
  height: 28px;
  color: ${({ disabled, theme: { palette } }) => (disabled ? palette.common.ui90 : '#425BFF')};
  cursor: pointer;
`;

const FooterBottomBackground = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(env(safe-area-inset-bottom, 0) + 8px);
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  transform: translateY(calc(env(safe-area-inset-bottom, 0) + 8px));
`;

export default ChannelMessageInput;
