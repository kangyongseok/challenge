import { useRouter } from 'next/router';
import { Alert, Flexbox, Icon, Typography } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface LegitLiveGuideAlertProps {
  message?: string;
  name?: string;
  customStyle?: CustomStyle;
}

function LegitLiveGuideAlert({
  message = '실시간 사진감정 이용하는 방법을 알려드려요!',
  name = attrProperty.legitName.LEGIT_MAIN,
  customStyle
}: LegitLiveGuideAlertProps) {
  const router = useRouter();

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_BANNER, {
      name,
      title: attrProperty.legitTitle.HOWTO
    });
    SessionStorage.set(sessionStorageKeys.legitGuideEventProperties, {
      name
    });
    router.push('/legit/guide');
  };

  return (
    <StyledAuthLiveGuideAlert brandColor="grey" round="8" css={customStyle} onClick={handleClick}>
      <Flexbox alignment="center" justifyContent="space-between" gap={10}>
        <AlertMessage gap={4} alignment="center">
          <CommentIcon />
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {message}
          </Typography>
        </AlertMessage>
        <Icon name="CaretRightOutlined" width={15} height={15} />
      </Flexbox>
    </StyledAuthLiveGuideAlert>
  );
}

const StyledAuthLiveGuideAlert = styled(Alert)`
  margin-top: 16px;
  padding: 16px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.grey['90']};
  cursor: pointer;
`;

const AlertMessage = styled(Flexbox)`
  flex-grow: 1;
  text-bverflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.00002 1.33337C11.6667 1.33337 14.6667 4.33337 14.6667 8.00004C14.6667 9.53337 14.1334 11 13.1334 12.2L14.4667 13.5334C14.7334 13.8 14.7334 14.2 14.4667 14.4667C14.3334 14.6 14.2 14.6667 14 14.6667H8.00002C4.33335 14.6667 1.33335 11.6667 1.33335 8.00004C1.33335 4.33337 4.33335 1.33337 8.00002 1.33337ZM10.6667 8.66671C11.0667 8.66671 11.3334 8.40004 11.3334 8.00004C11.3334 7.60004 11.0667 7.33337 10.6667 7.33337C10.2667 7.33337 10 7.60004 10 8.00004C10 8.40004 10.2667 8.66671 10.6667 8.66671ZM8.00002 8.66671C8.40002 8.66671 8.66669 8.40004 8.66669 8.00004C8.66669 7.60004 8.40002 7.33337 8.00002 7.33337C7.60002 7.33337 7.33335 7.60004 7.33335 8.00004C7.33335 8.40004 7.60002 8.66671 8.00002 8.66671ZM5.33335 8.66671C5.73335 8.66671 6.00002 8.40004 6.00002 8.00004C6.00002 7.60004 5.73335 7.33337 5.33335 7.33337C4.93335 7.33337 4.66669 7.60004 4.66669 8.00004C4.66669 8.40004 4.93335 8.66671 5.33335 8.66671Z"
        fill="#1833FF"
      />
    </svg>
  );
}

export default LegitLiveGuideAlert;
