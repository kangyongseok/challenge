import { useEffect, useState } from 'react';

import { Avatar, Box, Button, Flexbox, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import { PopupButton } from '@typeform/embed-react';

function LegitParticipantsIntro() {
  const {
    theme: {
      palette: { common },
      box
    }
  } = useTheme();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={32}
      customStyle={{
        marginTop: 52,
        padding: '32px 20px 20px',
        borderRadius: box.round['16'],
        backgroundColor: common.white
      }}
    >
      <Typography variant="h3">
        <strong>참여하고 계시는 분들을</strong>
        <br />
        소개합니다.
      </Typography>
      <Flexbox direction="vertical" gap={24}>
        <Flexbox gap={16} alignment="center">
          <Avatar
            width={48}
            height={48}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/participants/kim.png`}
            alt="User Img"
            customStyle={{ minWidth: 48, borderRadius: '50%' }}
          />
          <Flexbox direction="vertical" gap={4}>
            <Flexbox gap={7} alignment="flex-end">
              <Typography variant="h4" weight="bold">
                김*성
              </Typography>
              <Typography
                variant="body2"
                customStyle={{
                  color: common.grey['60']
                }}
              >
                명품감정횟수 총 100회
              </Typography>
            </Flexbox>
            <Typography
              variant="body2"
              customStyle={{
                color: common.grey['40']
              }}
            >
              前 L감정원, 경력 3년 명품 감정사
            </Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox gap={16} alignment="center">
          <Avatar
            width={48}
            height={48}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/participants/yoon.png`}
            alt="User Img"
            customStyle={{ minWidth: 48, borderRadius: '50%' }}
          />
          <Flexbox direction="vertical" gap={4}>
            <Flexbox gap={7} alignment="flex-end">
              <Typography variant="h4" weight="bold">
                윤*환
              </Typography>
              <Typography
                variant="body2"
                customStyle={{
                  color: common.grey['60']
                }}
              >
                명품감정횟수 총 500회
              </Typography>
            </Flexbox>
            <Typography
              variant="body2"
              customStyle={{
                color: common.grey['40']
              }}
            >
              現 중고명품 매입 및 거래 경력 12년 H사 대표
            </Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox gap={16} alignment="center">
          <Avatar
            width={48}
            height={48}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/participants/lee.png`}
            alt="User Img"
            customStyle={{ minWidth: 48, borderRadius: '50%' }}
          />
          <Flexbox direction="vertical" gap={4}>
            <Flexbox gap={7} alignment="flex-end">
              <Typography variant="h4" weight="bold">
                이*명
              </Typography>
              <Typography
                variant="body2"
                customStyle={{
                  color: common.grey['60']
                }}
              >
                명품감정횟수 총 1000회
              </Typography>
            </Flexbox>
            <Typography
              variant="body2"
              customStyle={{
                color: common.grey['40']
              }}
            >
              前 명품 거래액 1위 T사 경력 6년 명품감정사
            </Typography>
          </Flexbox>
        </Flexbox>
      </Flexbox>
      <Box customStyle={{ '& > div': { width: '100% !important' } }}>
        <Tooltip
          open
          message={
            <>
              <Typography variant="body2" weight="bold" customStyle={{ color: common.white }}>
                감정사가 아니어도 참여할 수 있어요!
              </Typography>
              <Typography variant="body2" weight="light" customStyle={{ color: common.white }}>
                (인증판매자, 노출 증가, 판매 대행 등 리워드 제공)
              </Typography>
            </>
          }
          placement="bottom"
          triangleLeft={12}
          customStyle={{
            top: -24,
            width: 'calc(100% - 24px)',
            height: 'fit-content',
            whiteSpace: 'normal',
            zIndex: 1
          }}
        >
          {isMounted && (
            <PopupButton id="rmVuaCLl" as="div" style={{ width: '100%' }}>
              <Button fullWidth brandColor="black" size="small">
                사진명품감정 참여하기
              </Button>
            </PopupButton>
          )}
        </Tooltip>
      </Box>
    </Flexbox>
  );
}

export default LegitParticipantsIntro;
