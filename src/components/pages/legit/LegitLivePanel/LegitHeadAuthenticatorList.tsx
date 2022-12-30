import { useCallback, useEffect, useRef } from 'react';

import { useResetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Label, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { UserAvatar } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

import { legitProfileOpinionLegitsParamsState } from '@recoil/legitProfile';

function LegitHeadAuthenticatorList() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const resetLegitProfileOpinionLegitsParamsState = useResetRecoilState(
    legitProfileOpinionLegitsParamsState
  );

  const swipeRef = useRef(null);

  const { isLoading, data: { authenticators = [] } = {} } = useQuery(
    queryKeys.dashboards.legit(),
    () => fetchLegit(),
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
      resetLegitProfileOpinionLegitsParamsState();

      router.push(`/legit/profile/${userId}`);
    },
    [router, resetLegitProfileOpinionLegitsParamsState]
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
          {isLoading &&
            Array.from({ length: 3 }, (_, index) => (
              <Card key={`authenticator-skeleton-${index}`}>
                <Skeleton width={80} height={80} round="50%" disableAspectRatio />
                <Box customStyle={{ marginTop: 20 }}>
                  <Flexbox direction="vertical" alignment="center" gap={6}>
                    <Skeleton width={64} height={20} round={8} disableAspectRatio />
                    <Skeleton width={160} height={48} round={8} disableAspectRatio />
                  </Flexbox>
                  <Divider
                    css={{
                      margin: '20px 0'
                    }}
                  />
                  <Flexbox gap={4} justifyContent="center">
                    <Flexbox direction="vertical" alignment="center" gap={3}>
                      <Skeleton width={59} height={18} round={8} disableAspectRatio />
                      <Skeleton width={25} height={16} round={8} disableAspectRatio />
                    </Flexbox>
                    <Flexbox direction="vertical" alignment="center" gap={3}>
                      <Skeleton width={59} height={18} round={8} disableAspectRatio />
                      <Skeleton width={25} height={16} round={8} disableAspectRatio />
                    </Flexbox>
                  </Flexbox>
                </Box>
              </Card>
            ))}
          {!isLoading &&
            authenticators.map(
              ({ userId, image, name, title, dateActivated, cntReal = 0, cntFake = 0 }) => (
                <Card key={`authenticator-${userId}`} onClick={handleClick(userId, name)}>
                  <Flexbox direction="vertical" alignment="center" gap={20}>
                    <UserAvatar
                      width={80}
                      height={80}
                      src={image}
                      isRound
                      dateActivated={dateActivated}
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
                          __html: `${title
                            .replaceAll(/\r?\n/gi, '<br />')
                            .split('<br />')
                            .map((text) => text.replace(/^-|^- /, ''))
                            .join('<br />')}`
                        }}
                      />
                    </Flexbox>
                  </Flexbox>
                  <Flexbox direction="vertical" alignment="center" customStyle={{ width: '100%' }}>
                    <Divider />
                    <Flexbox gap={4}>
                      <Flexbox direction="vertical" alignment="center" gap={3}>
                        <Label
                          variant="ghost"
                          text={
                            <Flexbox alignment="center" gap={2}>
                              <Icon name="OpinionAuthenticOutlined" width={12} height={12} />
                              <Typography variant="small2" weight="medium" brandColor="primary">
                                정품의견
                              </Typography>
                            </Flexbox>
                          }
                          size="xsmall"
                        />
                        <Typography variant="body2" weight="bold">
                          {commaNumber(cntReal)}건
                        </Typography>
                      </Flexbox>
                      <Flexbox direction="vertical" alignment="center" gap={3}>
                        <Label
                          variant="ghost"
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          text={
                            <Flexbox alignment="center" gap={2}>
                              <Icon name="OpinionFakeFilled" width={12} height={12} color="red" />
                              <Typography variant="small2" weight="medium" brandColor="red">
                                가품의심
                              </Typography>
                            </Flexbox>
                          }
                          size="xsmall"
                          brandColor="red"
                        />
                        <Typography variant="body2" weight="bold">
                          {commaNumber(cntFake)}건
                        </Typography>
                      </Flexbox>
                    </Flexbox>
                  </Flexbox>
                </Card>
              )
            )}
        </Flexbox>
      </Box>
    </Flexbox>
  );
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 32px 32px 20px;
  background-color: ${({ theme }) => theme.palette.common.bg01};
  border-radius: 8px;
  cursor: pointer;
  width: 240px;
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

const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 20px 0;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.line02};
`;

export default LegitHeadAuthenticatorList;
