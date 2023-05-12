import { useEffect, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import Toast from '@mrcamelhub/camel-ui-toast';
import {
  Alert,
  BottomSheet,
  Box,
  Button,
  Flexbox,
  Icon,
  Image,
  Input,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/react';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { executedShareURl } from '@utils/common';

import { deviceIdState, dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function EventInterfereInKing() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const deviceId = useRecoilValue(deviceIdState);
  const setDialogState = useSetRecoilState(dialogState);

  const [open, setOpen] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [content, setContent] = useState('');

  const { mutate, isLoading } = useMutation(postSurvey);

  const handleClickClear = (e: MouseEvent<HTMLOrSVGElement>) => {
    if (e.currentTarget.dataset.name === 'name') {
      setName('');
    } else {
      setPhoneNumber('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.name === 'name') {
      setName(e.currentTarget.value);
    } else {
      setPhoneNumber(e.currentTarget.value.replace(/[^0-9]/g, ''));
    }
  };

  const handleChangeContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.currentTarget.value.length > 300) return;

    setContent(e.currentTarget.value);
  };

  const handleClick = () => {
    logEvent(attrKeys.events.SUBMIT_EVENT_DETAIL, {
      name: attrProperty.name.EVENT_DETAIL,
      title: '2302_CAMEL_OPINION',
      att: 'CAMEL_OPINION',
      inputName: name,
      inputPhone: phoneNumber,
      inputOpinion: content,
      userPhone: accessUser?.phone
    });

    mutate(
      {
        deviceId,
        answer: 0,
        options: `${name}|${phoneNumber}|${content}`,
        surveyId: 3
      },
      {
        onSuccess: () => {
          setOpen(false);
          setOpenToast(true);
          setName('');
          setPhoneNumber('');
          setContent('');
        }
      }
    );
  };

  const handleClickJoinEvent = () => {
    logEvent(attrKeys.events.CLICK_EVENT_DETAIL, {
      name: attrProperty.name.EVENT_DETAIL,
      title: '2302_CAMEL_OPINION',
      att: 'JOIN'
    });
    setOpen(true);
  };

  const handleClickShare = () => {
    const shareData = {
      title: '카멜 참견왕 이벤트',
      description: '카멜에 마음껏 참여하고, 네이버페이 받아가세요!',
      image: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/event-interfere-in-king-main.png`,
      url: 'https://mrcamel.co.kr/events/interfereInKing'
    };

    if (
      !executedShareURl({
        url: shareData.url,
        title: shareData.title,
        text: shareData.description
      })
    ) {
      setDialogState({ type: 'SNSShare', shareData });
    }
  };

  useEffect(() => {
    logEvent(attrKeys.events.VIEW_EVENT_DETAIL, {
      name: attrProperty.name.EVENT_DETAIL,
      title: '2302_CAMEL_OPINION',
      att: 'JOIN'
    });
  }, []);

  return (
    <>
      <GeneralTemplate
        disablePadding
        header={
          <Header
            leftIcon={
              <Box
                onClick={() => router.back()}
                customStyle={{
                  padding: 16
                }}
              >
                <Icon name="CloseOutlined" />
              </Box>
            }
            showRight={false}
            rightIcon={
              <Box onClick={handleClickShare} customStyle={{ padding: '16px 8px' }}>
                <Icon name="ShareOutlined" />
              </Box>
            }
          >
            <Typography variant="h3" weight="bold">
              카멜 참견왕 이벤트
            </Typography>
          </Header>
        }
        footer={
          <Box
            customStyle={{
              width: '100%',
              minHeight: 40
            }}
          >
            <Button
              variant="solid"
              brandColor="primary"
              size="xlarge"
              fullWidth
              onClick={handleClickJoinEvent}
              customStyle={{
                position: 'fixed',
                left: 0,
                bottom: 0,
                height: 80,
                borderRadius: 0
              }}
            >
              <Typography
                variant="h2"
                weight="bold"
                customStyle={{
                  color: common.uiWhite
                }}
              >
                이벤트 참여하기
              </Typography>
            </Button>
          </Box>
        }
      >
        <Image
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/event-interfere-in-king-main.png`}
          alt="Event Img"
          disableAspectRatio
          customStyle={{
            minHeight: '100%'
          }}
        />
      </GeneralTemplate>
      <BottomSheet open={open} onClose={() => setOpen(false)} fullScreen disableSwipeable>
        <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
          <Box customStyle={{ flex: 1, padding: '32px 20px 52px', overflowY: 'auto' }}>
            <Typography variant="h2" weight="bold">
              카멜 참견왕 이벤트 참여
            </Typography>
            <Typography
              variant="h4"
              customStyle={{
                marginTop: 4,
                color: common.ui60
              }}
            >
              카멜에 마음껏 참여하고, 네이버페이 받아가세요!
            </Typography>
            <Flexbox direction="vertical" gap={12}>
              <Typography
                weight="bold"
                customStyle={{
                  marginTop: 20,
                  color: common.ui80
                }}
              >
                이름
              </Typography>
              <Input
                fullWidth
                name="name"
                onChange={handleChange}
                value={name}
                size="xlarge"
                endAdornment={
                  name ? (
                    <Icon
                      name="DeleteCircleFilled"
                      color={common.ui80}
                      data-name="name"
                      onClick={handleClickClear}
                    />
                  ) : undefined
                }
                placeholder="이름을 입력해주세요."
              />
            </Flexbox>
            <Flexbox direction="vertical" gap={12}>
              <Typography
                weight="bold"
                customStyle={{
                  marginTop: 20,
                  color: common.ui80
                }}
              >
                경품받을 핸드폰번호
              </Typography>
              <Input
                fullWidth
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                name="phoneNumber"
                onChange={handleChange}
                value={phoneNumber}
                size="xlarge"
                endAdornment={
                  phoneNumber ? (
                    <Icon
                      name="DeleteCircleFilled"
                      color={common.ui80}
                      data-name="phoneNumber"
                      onClick={handleClickClear}
                    />
                  ) : undefined
                }
                placeholder="경품을 받으실 번호를 입력해주세요"
              />
            </Flexbox>
            <Flexbox direction="vertical" gap={12}>
              <Typography
                weight="bold"
                customStyle={{
                  marginTop: 20,
                  color: common.ui80
                }}
              >
                의견을 작성해주세요
              </Typography>
              <Flexbox
                direction="vertical"
                customStyle={{
                  minHeight: 200,
                  border: `1px solid ${common.line01}`,
                  borderRadius: 8,
                  overflow: 'hidden'
                }}
              >
                <TextArea
                  maxLength={300}
                  onChange={handleChangeContent}
                  value={content}
                  placeholder="카멜에 참견하고 싶은 내용을 입력해주세요! 풍부한 내용을 적으면 당첨 확률이 올라갑니다!"
                  spellCheck={false}
                />
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    padding: '0 12px 12px',
                    color: common.ui80,
                    '& > span': {
                      color: common.ui60
                    }
                  }}
                >
                  <span>{content.length}</span> / 300자
                </Typography>
              </Flexbox>
            </Flexbox>
            <Alert
              round={8}
              customStyle={{
                marginTop: 12,
                padding: 12,
                backgroundColor: common.bg03
              }}
            >
              <Flexbox gap={8}>
                <Box
                  customStyle={{
                    minWidth: 2,
                    width: 2,
                    height: 2,
                    marginTop: 6,
                    borderRadius: '50%',
                    backgroundColor: common.ui60
                  }}
                />
                <Typography
                  variant="body2"
                  customStyle={{
                    color: common.ui60
                  }}
                >
                  이벤트 참여 시, 경품지급을 위한 개인정보 수집이용 (이름, 연락처 등)에 동의하는
                  것으로 간주되며 경품 발송 후 파기 처리합니다.
                </Typography>
              </Flexbox>
              <Flexbox gap={8}>
                <Box
                  customStyle={{
                    minWidth: 2,
                    width: 2,
                    height: 2,
                    marginTop: 6,
                    borderRadius: '50%',
                    backgroundColor: common.ui60
                  }}
                />
                <Typography
                  variant="body2"
                  customStyle={{
                    color: common.ui60
                  }}
                >
                  이벤트에 응모하신 내용에 대한 소유권 및 사용권은 (주)미스터카멜에 귀속됩니다.
                </Typography>
              </Flexbox>
            </Alert>
          </Box>
          <Button
            variant="solid"
            brandColor="primary"
            size="xlarge"
            fullWidth
            onClick={handleClick}
            disabled={!name || !phoneNumber || !content || isLoading}
            customStyle={{
              width: 'calc(100% - 40px)',
              margin: '0 20px 20px'
            }}
          >
            이벤트 참여하기
          </Button>
        </Flexbox>
      </BottomSheet>
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        이벤트 참여가 완료되었습니다!
      </Toast>
    </>
  );
}

const TextArea = styled.textarea`
  flex: 1;
  padding: 12px;
  outline: 0;
  resize: none;

  ${({
    theme: {
      typography: { h4 }
    }
  }): CSSObject => ({
    fontSize: h4.size,
    fontWeight: h4.weight.regular,
    letterSpacing: h4.letterSpacing,
    lineHeight: h4.lineHeight
  })}

  &::placeholder {
    ${({
      theme: {
        palette: { common }
      }
    }): CSSObject => ({
      color: common.ui80
    })}
  }
`;

export default EventInterfereInKing;
