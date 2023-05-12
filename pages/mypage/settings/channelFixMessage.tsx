import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast, { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Button, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchFixedChannel, putFixedChannel } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import { shake } from '@styles/transition';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function ChannelFixMessage() {
  const {
    theme: {
      palette: { common, secondary }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const { back } = useRouter();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [isMinDescription, setIsMinDesciption] = useState(false);
  const [open, setOpen] = useState(false);

  const { mutate } = useMutation(putFixedChannel);
  const { data: accessUser } = useQueryAccessUser();
  const { data: fixedChannel } = useQuery(
    queryKeys.users.fixedChannel(accessUser?.userId || 0),
    fetchFixedChannel,
    {
      enabled: !!accessUser?.userId
    }
  );

  useEffect(() => {
    if (isMinDescription && description.length >= 20) {
      setIsMinDesciption(false);
    }
  }, [description, isMinDescription]);

  const handleChangeDescription = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 300) {
      setOpen(true);
    } else {
      setDescription(e.target.value);
    }
  }, []);

  const handleClickSave = () => {
    logEvent(attrKeys.channel.CLICK_CHANNEL_DEFAULT_MESSAGE, {
      description
    });

    if (description.length < 20) {
      setIsMinDesciption(true);
      toastStack({
        children: '최소 20자 이상으로 작성해주세요.'
      });
      return;
    }

    mutate(
      { type: 'channelDefaultMessage', value: description },
      {
        onSuccess() {
          queryClient.invalidateQueries(queryKeys.users.fixedChannel(accessUser?.userId || 0));
          toastStack({
            children: '저장되었습니다'
          });
          back();
        }
      }
    );
  };

  useEffect(() => {
    logEvent(attrKeys.channel.VIEW_CHANNEL_DEFAULT_MESSAGE);
  }, []);

  useEffect(() => {
    if (fixedChannel?.length && !description) {
      setDescription(fixedChannel[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedChannel]);

  return (
    <>
      <GeneralTemplate
        header={
          <Header showRight={false}>
            <Typography variant="h3" weight="bold">
              채팅 고정 메시지 설정
            </Typography>
          </Header>
        }
      >
        <Typography weight="bold" customStyle={{ margin: '32px 0 12px', color: common.ui80 }}>
          채팅에서 고정 메시지를 설정해보세요!
        </Typography>
        <Description isMinDescription={isMinDescription}>
          <TextareaAutosize
            // ref={descriptionRef}
            // className={descriptionError.text.length > 0 ? 'invalid' : ''}
            placeholder="메세지를 입력해주세요"
            value={description}
            onChange={handleChangeDescription}
            style={{ border: 'none' }}
          />
          <DescriptionInfo variant="small2" weight="medium">
            {description?.length || 0}
            <span>/ 300자</span>
            {isMinDescription && (
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ color: secondary.red.light, marginLeft: 'auto', marginRight: 30 }}
              >
                최소 20자 이상으로 작성해주세요
              </Typography>
            )}
          </DescriptionInfo>
        </Description>
        <ButtonBox>
          <Button
            type="submit"
            size="xlarge"
            variant="solid"
            brandColor="primary"
            fullWidth
            onClick={handleClickSave}
          >
            저장
          </Button>
        </ButtonBox>
      </GeneralTemplate>
      <Toast open={open} onClose={() => setOpen(false)}>
        300글자만 입력할 수 있어요.
      </Toast>
    </>
  );
}

const Description = styled.div<{ isMinDescription: boolean }>`
  position: relative;
  display: flex;
  transition-delay: 0.5s;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
  ${({ isMinDescription, theme: { palette } }): CSSObject => {
    if (isMinDescription) {
      return {
        outline: 0,
        border: `1px solid ${palette.secondary.red.light}`,
        animationName: shake,
        animationDuration: '0.5s',
        animationDelay: '0.25s'
      };
    }
    return {};
  }}

  textarea {
    min-height: 296px;
    width: 100%;
    background-color: ${({ theme: { palette } }) => palette.common.bg01};
    border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
    border-radius: 8px;
    padding: 12px 12px 24px;
    resize: none;
    color: ${({ theme: { palette } }) => palette.common.ui20};
    caret-color: ${({ theme: { palette } }) => palette.common.ui20};

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    ::placeholder {
      color: ${({ theme: { palette } }) => palette.common.ui80};
      white-space: pre-wrap;
    }
  }
`;

const DescriptionInfo = styled(Typography)`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  width: 100%;
  color: ${({ theme: { palette } }) => palette.common.ui60};

  span {
    margin-left: 4px;
    color: ${({ theme: { palette } }) => palette.common.ui80};
  }
`;

const ButtonBox = styled.div`
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  padding: 20px;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));
  return {
    props: {}
  };
}

export default ChannelFixMessage;
