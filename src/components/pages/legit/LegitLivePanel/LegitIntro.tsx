import { useEffect, useMemo, useRef, useState } from 'react';

import { useInfiniteQuery, useQuery } from 'react-query';
import { Box, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { fetchUserLegitTargets } from '@api/user';
import { fetchLegitProducts } from '@api/product';
import { fetchLegitDashboard } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';

import commaNumber from '@utils/commaNumber';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitIntro() {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();
  const [resultRealCount, setResultRealCount] = useState(0);
  const [resultFakeCount, setResultFakeCount] = useState(0);
  const [index, setIndex] = useState(0);

  const resultRealCountIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const resultFakeCountIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const loopIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const { data: accessUser } = useQueryAccessUser();

  const { data: { resultReal = 0, resultFake = 0 } = {} } = useQuery(
    queryKeys.dashboard.legitDashboard(),
    fetchLegitDashboard,
    {
      refetchOnMount: true
    }
  );

  const { data: products = [] } = useQuery(queryKeys.users.legitTargets(), fetchUserLegitTargets, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  const [params] = useState({
    page: 0,
    size: 8,
    isOnlyResult: true
  });
  const { data: { pages = [] } = {} } = useInfiniteQuery(
    queryKeys.products.legitProducts(params),
    ({ pageParam = 0 }) =>
      fetchLegitProducts({
        ...params,
        page: pageParam
      })
  );

  const legitProducts = useMemo(() => pages.map(({ content }) => content).flat(), [pages]);

  useEffect(() => {
    if (resultReal) {
      resultRealCountIntervalRef.current = setInterval(() => {
        setResultRealCount((prevCount) => {
          const newRealCount = prevCount + Math.floor(Math.random() * 5) + 1;
          if (newRealCount >= resultReal) {
            if (resultRealCountIntervalRef.current) {
              clearInterval(resultRealCountIntervalRef.current);
            }
            return resultReal;
          }
          return newRealCount;
        });
      }, 10);
    }

    return () => {
      if (resultRealCountIntervalRef.current) {
        clearInterval(resultRealCountIntervalRef.current);
      }
    };
  }, [resultReal]);

  useEffect(() => {
    if (resultFake) {
      resultFakeCountIntervalRef.current = setInterval(() => {
        setResultFakeCount((prevCount) => {
          const newFakeCount = prevCount + Math.floor(Math.random() * 3) + 1;
          if (newFakeCount >= resultFake) {
            if (resultFakeCountIntervalRef.current) {
              clearInterval(resultFakeCountIntervalRef.current);
            }
            return resultFake;
          }
          return newFakeCount;
        });
      }, 10);
    }

    return () => {
      if (resultFakeCountIntervalRef.current) {
        clearInterval(resultFakeCountIntervalRef.current);
      }
    };
  }, [resultFake]);

  useEffect(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }

    if (legitProducts.length) {
      loopIntervalRef.current = setInterval(() => {
        setIndex((prevState) => {
          if (prevState + 1 === legitProducts.length) {
            return 0;
          }
          return prevState + 1;
        });
      }, 2000);
    }
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, [legitProducts]);

  if (accessUser && products.length) return null;

  return (
    <StyledLegitIntro component="section" direction="vertical">
      <NewLabel text="NEW" size="xsmall" />
      <Box customStyle={{ position: 'absolute', top: 56, left: 15 }}>
        <LegitIcon />
      </Box>
      <Box customStyle={{ position: 'absolute', top: 16, left: 68 }}>
        <AuthenticIcon />
      </Box>
      <Box customStyle={{ position: 'absolute', top: 23, right: 17 }}>
        <FakeIcon />
      </Box>
      <Flexbox justifyContent="center" customStyle={{ marginTop: 32, textAlign: 'center' }}>
        <Typography variant="h3" customStyle={{ color: common.white }}>
          구매가 망설여진다면,
          <br />
          <strong>실시간 정가품 감정</strong> 받아보세요
        </Typography>
      </Flexbox>
      <LegitIntroContent justifyContent="center" gap={60}>
        <Flexbox direction="vertical">
          <LegitLabel>
            <Icon name="OpinionAuthenticFilled" width={15} height={15} color="white" />
            <Typography variant="small2" weight="bold" customStyle={{ color: common.white }}>
              정품의견
            </Typography>
          </LegitLabel>
          <LegitCounter gap={2}>
            <Typography variant="h1" weight="bold" customStyle={{ color: common.white }}>
              {commaNumber(resultRealCount)}
            </Typography>
            <Typography variant="body2" customStyle={{ color: common.white }}>
              건
            </Typography>
          </LegitCounter>
        </Flexbox>
        <Flexbox direction="vertical">
          <LegitLabel>
            <Icon name="OpinionFakeFilled" width={15} height={15} color="white" />
            <Typography variant="small2" weight="bold" customStyle={{ color: common.white }}>
              가품의심
            </Typography>
          </LegitLabel>
          <LegitCounter gap={2}>
            <Typography variant="h1" weight="bold" customStyle={{ color: common.white }}>
              {commaNumber(resultFakeCount)}
            </Typography>
            <Typography variant="body2" customStyle={{ color: common.white }}>
              건
            </Typography>
          </LegitCounter>
        </Flexbox>
      </LegitIntroContent>
      <Box
        customStyle={{
          height: 59,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        <LegitLiveTransform index={index} dataHeight={59}>
          {legitProducts.map(({ result, productId, productResult: { title } }) => (
            <LegitLive key={`legit-live-${productId}`} gap={10} justifyContent="space-between">
              <LegitLiveTitle gap={4} alignment="center">
                <Label
                  variant="contained"
                  text="LIVE"
                  size="xsmall"
                  customStyle={{
                    backgroundColor: secondary.red.light
                  }}
                />
                <Typography
                  variant="body2"
                  weight="medium"
                  customStyle={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    color: common.white
                  }}
                >
                  {title}
                </Typography>
              </LegitLiveTitle>
              <Flexbox gap={3} alignment="center" customStyle={{ whiteSpace: 'nowrap' }}>
                {result === 1 && (
                  <>
                    <Typography variant="body2" weight="bold">
                      👍
                    </Typography>
                    <Typography variant="body2" weight="bold" customStyle={{ color: common.white }}>
                      정품의견
                    </Typography>
                  </>
                )}
                {result === 2 && (
                  <>
                    <Typography variant="body2" weight="bold">
                      👎
                    </Typography>
                    <Typography variant="body2" weight="bold" customStyle={{ color: common.white }}>
                      가품의심
                    </Typography>
                  </>
                )}
                {result !== 1 && result !== 2 && (
                  <>
                    <Typography variant="body2" weight="bold">
                      🤚
                    </Typography>
                    <Typography variant="body2" weight="bold" customStyle={{ color: common.white }}>
                      감정불가
                    </Typography>
                  </>
                )}
              </Flexbox>
            </LegitLive>
          ))}
        </LegitLiveTransform>
      </Box>
    </StyledLegitIntro>
  );
}

const StyledLegitIntro = styled(Flexbox)`
  position: relative;
  width: 100%;
  min-height: 240px;
  margin-top: 42px;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: #205fff;
  box-shadow: 0 16px 40px rgba(69, 77, 244, 0.2);
`;

const LegitIntroContent = styled(Flexbox)`
  flex-grow: 1;
  margin-top: 12px;
`;

const LegitLabel = styled(Flexbox)`
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const LegitCounter = styled(Flexbox)`
  align-items: baseline;
`;

const LegitLive = styled(Flexbox)`
  padding: 20px 24px;
`;

const LegitLiveTitle = styled(Flexbox)`
  flex-grow: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const NewLabel = styled(Label)`
  position: absolute;
  top: -11.5px;
  left: 20px;
  height: auto;
  border-radius: 10px;
  border-width: 2px;
  font-weight: 700;
`;

const LegitLiveTransform = styled.div<{ dataHeight: number; gap?: number; index: number }>`
  display: flex;
  flex-direction: column;
  ${({ gap }) => (gap ? `gap: ${gap}px` : '')};
  transition: transform 700ms ease-in-out;
  transform: ${({ dataHeight, index }) => `translate3d(0px, -${dataHeight * index}px, 0px)`};
`;

function LegitIcon() {
  return (
    <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        opacity="0.1"
        d="M2.31691 21.6387L5.337 18.6692C5.98662 18.0764 6.80606 17.6836 7.69001 17.5413C8.57397 17.3991 9.48204 17.5138 10.2975 17.8709L11.6106 16.6102C10.0633 14.6254 9.35663 12.1514 9.6329 9.68647C9.90917 7.2215 11.1479 4.94852 13.0996 3.3251C15.0513 1.70168 17.5712 0.848366 20.152 0.936927C22.7327 1.02549 25.1827 2.04935 27.0087 3.80241C28.8347 5.55547 29.9012 7.90755 29.9935 10.3852C30.0857 12.8628 29.1969 15.282 27.5059 17.1557C25.8149 19.0295 23.4473 20.2186 20.8797 20.4839C18.3122 20.7491 15.7353 20.0707 13.6678 18.5852L12.3693 19.8318C12.785 20.6157 12.9339 21.505 12.7952 22.3745C12.6565 23.2439 12.237 24.0497 11.596 24.6781L8.50299 27.6476C7.68231 28.4345 6.56984 28.8765 5.40995 28.8765C4.25006 28.8765 3.13759 28.4345 2.31691 27.6476C1.90003 27.2562 1.56879 26.7889 1.34264 26.2729C1.11649 25.757 1 25.2029 1 24.6431C1 24.0834 1.11649 23.5293 1.34264 23.0133C1.56879 22.4974 1.90003 22.03 2.31691 21.6387ZM14.6891 15.6998C15.71 16.6775 17.0099 17.3427 18.4244 17.6115C19.839 17.8803 21.3048 17.7406 22.6367 17.21C23.9686 16.6794 25.1068 15.7818 25.9076 14.6304C26.7083 13.4791 27.1357 12.1258 27.1357 10.7414C27.1357 9.35702 26.7083 8.00369 25.9076 6.85238C25.1068 5.70106 23.9686 4.80341 22.6367 4.27282C21.3048 3.74223 19.839 3.60251 18.4244 3.8713C17.0099 4.14009 15.71 4.80534 14.6891 5.78301C14.0097 6.43357 13.4707 7.2064 13.103 8.05724C12.7352 8.90808 12.5459 9.82022 12.5459 10.7414C12.5459 11.6626 12.7352 12.5747 13.103 13.4256C13.4707 14.2764 14.0097 15.0493 14.6891 15.6998ZM4.37407 25.6026C4.5097 25.7339 4.67107 25.8381 4.84886 25.9092C5.02665 25.9803 5.21734 26.0169 5.40995 26.0169C5.60255 26.0169 5.79325 25.9803 5.97104 25.9092C6.14883 25.8381 6.31019 25.7339 6.44582 25.6026L9.53886 22.6332C9.67561 22.5029 9.78415 22.348 9.85822 22.1773C9.93229 22.0067 9.97042 21.8236 9.97042 21.6387C9.97042 21.4538 9.93229 21.2707 9.85822 21.1C9.78415 20.9293 9.67561 20.7744 9.53886 20.6442C9.40323 20.5129 9.24186 20.4087 9.06407 20.3376C8.88628 20.2665 8.69559 20.2299 8.50299 20.2299C8.31038 20.2299 8.11968 20.2665 7.94189 20.3376C7.7641 20.4087 7.60274 20.5129 7.46711 20.6442L4.37407 23.6136C4.23733 23.7438 4.12879 23.8988 4.05472 24.0694C3.98065 24.2401 3.94251 24.4232 3.94251 24.6081C3.94251 24.793 3.98065 24.9761 4.05472 25.1468C4.12879 25.3175 4.23733 25.4724 4.37407 25.6026Z"
        fill="white"
        stroke="white"
      />
    </svg>
  );
}

function AuthenticIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle opacity="0.1" cx="15.5" cy="15.5" r="12.5" stroke="white" strokeWidth="6" />
    </svg>
  );
}

function FakeIcon() {
  return (
    <svg width="38" height="37" viewBox="0 0 38 37" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        opacity="0.1"
        d="M36.597 1.55501C36.1561 1.1266 35.6315 0.786572 35.0535 0.554523C34.4755 0.322474 33.8555 0.203003 33.2294 0.203003C32.6032 0.203003 31.9833 0.322474 31.4053 0.554523C30.8273 0.786572 30.3027 1.1266 29.8618 1.55501L19 12.0676L8.13825 1.55501C7.2451 0.694329 6.03373 0.210803 4.77063 0.210803C3.50752 0.210803 2.29616 0.694329 1.40301 1.55501C0.50986 2.41569 0.00809464 3.58303 0.00809462 4.80021C0.00809459 6.0174 0.50986 7.18473 1.40301 8.04541L12.3122 18.5123L1.40301 28.9792C0.958443 29.4042 0.605582 29.9097 0.36478 30.4667C0.123978 31.0236 0 31.6211 0 32.2244C0 32.8278 0.123978 33.4253 0.36478 33.9822C0.605582 34.5392 0.958443 35.0447 1.40301 35.4697C1.84394 35.8981 2.36854 36.2381 2.94653 36.4701C3.52452 36.7022 4.14448 36.8217 4.77063 36.8217C5.39678 36.8217 6.01673 36.7022 6.59472 36.4701C7.17272 36.2381 7.69731 35.8981 8.13825 35.4697L19 24.957L29.8618 35.4697C30.3027 35.8981 30.8273 36.2381 31.4053 36.4701C31.9833 36.7022 32.6032 36.8217 33.2294 36.8217C33.8555 36.8217 34.4755 36.7022 35.0535 36.4701C35.6315 36.2381 36.1561 35.8981 36.597 35.4697C37.0416 35.0447 37.3944 34.5392 37.6352 33.9822C37.876 33.4253 38 32.8278 38 32.2244C38 31.6211 37.876 31.0236 37.6352 30.4667C37.3944 29.9097 37.0416 29.4042 36.597 28.9792L25.6878 18.5123L36.597 8.04541C37.0416 7.62051 37.3944 7.11498 37.6352 6.558C37.876 6.00102 38 5.4036 38 4.80021C38 4.19682 37.876 3.59941 37.6352 3.04242C37.3944 2.48544 37.0416 1.97992 36.597 1.55501Z"
        fill="white"
      />
    </svg>
  );
}

export default LegitIntro;
