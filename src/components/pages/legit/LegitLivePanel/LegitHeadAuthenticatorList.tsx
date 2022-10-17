import { useCallback, useEffect, useRef } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { UserAvatar } from '@components/UI/organisms';
import { Skeleton } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function LegitHeadAuthenticatorList() {
  const router = useRouter();
  const swipeRef = useRef(null);
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { isLoading, data: { authenticators = [] } = {} } = useQuery(
    queryKeys.dashboards.legit(),
    fetchLegit,
    { refetchOnMount: true }
  );

  const handleScroll = () => {
    logEvent(attrKeys.legit.SWIPE_X_LEGIT, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.PROFILE
    });
  };

  useEffect(() => {
    if (swipeRef.current) {
      (swipeRef.current as HTMLDivElement).addEventListener('scroll', debounce(handleScroll, 1000));
    }
  }, []);

  const handleClick = useCallback(
    (userId: number, name: string) => () => {
      logEvent(attrKeys.legit.CLICK_LEGIT_PROFILE, {
        name: attrProperty.legitName.LEGIT_MAIN,
        att: name
      });

      router.push(`/legit/profile/${userId}`);
    },
    [router]
  );

  return (
    <Flexbox component="section" direction="vertical" gap={32} customStyle={{ width: '100%' }}>
      <Flexbox direction="vertical" alignment="center" gap={4}>
        <Typography variant="h3" weight="bold">
          Authenticators
        </Typography>
        <Typography variant="body2" customStyle={{ color: common.ui60 }}>
          사진감정에 참여하시는 전문가분들입니다
        </Typography>
      </Flexbox>
      <Box customStyle={{ overflowX: 'auto', width: '100%' }} ref={swipeRef}>
        <Flexbox
          gap={12}
          customStyle={{ width: 'fit-content', padding: '0 20px', margin: '0 auto' }}
        >
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <Card key={`authenticator-skeleton-${index}`}>
                  <Box customStyle={{ minHeight: 105 }}>
                    <Skeleton
                      width="96px"
                      height="96px"
                      disableAspectRatio
                      customStyle={{ borderRadius: '50%' }}
                    />
                  </Box>
                  <Flexbox direction="vertical" alignment="center" gap={6}>
                    <Skeleton width="64px" height="20px" isRound disableAspectRatio />
                    <Skeleton width="160px" height="32px" isRound disableAspectRatio />
                  </Flexbox>
                  <Skeleton width="32px" height="32px" isRound disableAspectRatio />
                </Card>
              ))
            : authenticators.map(({ userId, image, name, title, dateActivated }) => (
                <Card key={`authenticator-${userId}`} onClick={handleClick(userId, name)}>
                  <UserAvatar
                    src={image}
                    dateActivated={dateActivated}
                    customStyle={{ height: 105 }}
                  />
                  <Flexbox
                    direction="vertical"
                    gap={6}
                    alignment="center"
                    customStyle={{ flex: 1 }}
                  >
                    <Typography variant="h4" weight="bold" customStyle={{ whiteSpace: 'nowrap' }}>
                      {name}
                    </Typography>
                    <Description
                      variant="body2"
                      customStyle={{ wordBreak: 'keep-all' }}
                      dangerouslySetInnerHTML={{
                        __html: `${title.replaceAll(/\r?\n/gi, '<br />')}`
                      }}
                    />
                  </Flexbox>
                  <IconBox>
                    <Icon name="CaretRightOutlined" width={16} height={16} />
                  </IconBox>
                </Card>
              ))}
        </Flexbox>
      </Box>
    </Flexbox>
  );
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 32px 20px;
  row-gap: 20px;
  background-color: ${({ theme }) => theme.palette.common.bg01};
  border-radius: 8px;
  cursor: pointer;
  width: 240px;
`;

const IconBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme: { palette } }) => palette.common.ui98};
  border-radius: 8px;
  padding: 8px;
`;

const Description = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-align: center;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  overflow: hidden;
`;

export default LegitHeadAuthenticatorList;
