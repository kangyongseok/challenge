import { memo, useCallback, useRef, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { dialogState } from '@recoil/common';

const CARD_WIDTH = 136;
const CARD_GAP = 12;

const curationTitle = {
  2: attrProperty.title.rare,
  3: attrProperty.title.rare,
  4: attrProperty.title.lowPrice,
  5: attrProperty.title.priceDefense,
  6: attrProperty.title.camping
};

interface CrazycurationWeekProps {
  weekData: number[];
  isMobileWeb: boolean;
  logEventTitle: string;
}

function CrazycurationWeek({ weekData, isMobileWeb, logEventTitle }: CrazycurationWeekProps) {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();

  const setDialogState = useSetRecoilState(dialogState);
  const [activeCardIndex, setActiveCardIndex] = useState(weekData[0]);
  const curationCardList = useRef<HTMLDivElement | null>(null);

  const handleCardListScroll = debounce(() => {
    logEvent(attrKeys.crazycuration.swipeXCard, { name: attrProperty.name.crazyWeek });
  }, 500);

  const handleClickCuration = useCallback(
    (id: number, index: number) => () => {
      logEvent(attrKeys.crazycuration.clickCurationCard, {
        name: attrProperty.name.crazyWeek,
        title: logEventTitle,
        att: curationTitle[id as keyof typeof curationTitle]
      });
      setActiveCardIndex(id);
      curationCardList.current?.scrollTo({
        left: (index > 0 ? 20 : 0) + CARD_WIDTH * index + CARD_GAP * (index - 1),
        top: 0,
        behavior: 'smooth'
      });
    },
    [logEventTitle]
  );

  const handleClickNoti = useCallback(
    (isBottom: boolean) => () => {
      logEvent(attrKeys.crazycuration.clickPushNoti, {
        name: attrProperty.name.crazyWeek,
        title: isBottom ? attrProperty.title.bottom : attrProperty.title.curationCard
      });

      if (isMobileWeb) {
        window.location.href = 'https://camel.onelink.me/gPbg/mqmadk0q';
      } else {
        router.push({ pathname: '/mypage', hash: 'mypage-setting' });
      }
    },
    [isMobileWeb, router]
  );

  const handleClickShare = useCallback(() => {
    logEvent(attrKeys.crazycuration.clickShare, {
      name: attrProperty.name.crazyWeek,
      title: attrProperty.title.bottom
    });
    setDialogState({ type: 'SNSShare' });
  }, [setDialogState]);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={52}
      customStyle={{ padding: '52px 0 84px', backgroundColor: '#1A1A1A' }}
    >
      <Flexbox direction="vertical" alignment="center" gap={12}>
        <Logo />
        <Typography variant="h3" customStyle={{ color: palette.common.white, textAlign: 'center' }}>
          약한 매물은 가! 약빤 매물만 모아왔어요.
        </Typography>
      </Flexbox>
      <Flexbox
        ref={curationCardList}
        onScroll={handleCardListScroll}
        gap={CARD_GAP}
        customStyle={{ overflow: 'auto' }}
      >
        {weekData.map((id, index) =>
          activeCardIndex === id ? (
            <ActiveCurationCard
              key={`week-curation-card-on-${id}`}
              index={index}
              imageUrl={`https://${process.env.IMAGE_DOMAIN}/assets/images/crazycuration/weekOn${id}.png`}
            >
              {index === 0 && (
                <Typography
                  variant="h4"
                  weight="bold"
                  customStyle={{ position: 'absolute', top: 28, left: 20 }}
                >
                  내일은?
                </Typography>
              )}
              <CurationCardButton variant="contained" fullWidth onClick={handleClickNoti(false)}>
                {isMobileWeb ? '설치하고 소식받기' : '소식받기'}
              </CurationCardButton>
            </ActiveCurationCard>
          ) : (
            <CurationCard
              key={`week-curation-card-off-${id}`}
              index={index}
              imageUrl={`https://${process.env.IMAGE_DOMAIN}/assets/images/crazycuration/weekOff${id}.png`}
              onClick={handleClickCuration(id, index)}
            />
          )
        )}
      </Flexbox>
      <Flexbox
        direction="vertical"
        alignment="center"
        gap={32}
        customStyle={{ padding: '32px 12px' }}
      >
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{ color: palette.common.white, textAlign: 'center' }}
        >
          평일을 즐겁게 해줄 미친 매물들,
          <br />
          오픈할 때 알림받고 꿀매물 놓치지 마세요!
        </Typography>
        <Flexbox direction="vertical" gap={12} customStyle={{ width: '100%' }}>
          <NotiOnButton
            variant="ghost"
            brandColor="black"
            fullWidth
            size="xlarge"
            onClick={handleClickNoti(true)}
          >
            <Icon name="NotiFilled" />
            {isMobileWeb ? '설치하고 소식받기' : '소식받기'}
          </NotiOnButton>
          <ShareButton
            variant="contained"
            brandColor="black"
            fullWidth
            size="xlarge"
            onClick={handleClickShare}
          >
            <Icon name="ShareFilled" />
            친구에게 알려주기
          </ShareButton>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="311"
      height="66"
      viewBox="0 0 311 66"
      fill="none"
    >
      <path
        d="M130.286 13.1326C128.718 15.0438 126.515 15.9997 123.654 15.9997C118.669 15.9997 115.453 12.8223 115.453 8.81837C115.453 4.7115 118.865 1.55981 123.708 1.55981C126.571 1.55981 128.993 2.67094 130.452 4.68577L127.397 6.26083C126.351 5.22769 125.333 4.7115 123.736 4.7115C120.929 4.7115 119.14 6.4932 119.14 8.86983C119.14 11.195 120.874 12.8465 123.571 12.8465C125.195 12.8465 126.488 12.3295 127.397 11.2706L130.286 13.1326Z"
        fill="#5C67FF"
      />
      <path
        d="M143.29 13.9881C142.043 15.1319 140.721 15.7284 138.946 15.7284C135.37 15.7284 132.245 12.8434 132.245 8.7888C132.245 4.66245 135.211 1.82812 138.867 1.82812C140.561 1.82812 142.019 2.42462 143.29 3.61761V2.179H146.813V15.3799H143.29V13.9881ZM135.794 8.76385C135.794 11.0251 137.383 12.6921 139.582 12.6921C141.754 12.6921 143.449 11.1506 143.449 8.73968C143.449 6.42699 141.807 4.86128 139.582 4.86128C137.251 4.8644 135.794 6.60477 135.794 8.76697V8.76385Z"
        fill="#5C67FF"
      />
      <path
        d="M162.815 15.3807H159.292V8.99153C159.292 6.43089 158.763 4.86519 156.8 4.86519C155.055 4.86519 153.78 6.20711 153.78 8.91979V15.383H150.26V2.17979H153.782V3.69637C154.975 2.47843 156.511 1.83203 158.18 1.83203C159.924 1.83203 161.411 2.60241 162.285 4.19384C163.583 2.65231 164.881 1.83203 167 1.83203C168.562 1.83203 169.966 2.42853 170.761 3.37356C171.688 4.46519 171.794 5.90925 171.794 7.64961V15.3807H168.271V8.09718C168.271 5.9342 167.45 4.86519 165.862 4.86519C164.088 4.86519 162.817 6.15798 162.817 8.86755L162.815 15.3807Z"
        fill="#5C67FF"
      />
      <path
        d="M188.91 11.2469C187.959 13.5425 186.26 14.8587 183.379 15.5261C179.034 16.5343 175.443 14.192 174.452 10.4267C173.53 6.9272 175.379 3.06673 179.776 2.04684C184.096 1.04488 187.79 3.26088 188.857 7.31551C188.934 7.60557 188.946 7.75606 189.023 8.04612L178.017 10.599C178.853 12.4274 180.675 13.1315 182.63 12.6785C184.096 12.3386 184.971 11.7257 185.693 10.6364L188.91 11.2469ZM184.935 6.30497C184.078 4.91626 182.371 4.33848 180.545 4.76188C178.849 5.15174 177.747 6.25663 177.504 8.02896L184.935 6.30497Z"
        fill="#5C67FF"
      />
      <path d="M191.606 0.825738V15.3802H195.129V0L191.606 0.825738Z" fill="#5C67FF" />
      <path
        d="M63.1119 51.5625C59.6744 51.5625 57.1119 48.9688 57.1119 45.4375C57.1119 41.9062 59.6744 39.3125 63.1119 39.3125C65.1119 39.3125 66.8306 40.1562 67.9244 41.5625L72.8931 38.2812C70.7369 35.3438 67.2369 33.4688 63.1119 33.4688C56.2681 33.4688 51.1119 38.6562 51.1119 45.4375C51.1119 52.25 56.2681 57.4375 63.1119 57.4375C67.2369 57.4375 70.7369 55.5625 72.8931 52.5938L67.9244 49.3125C66.8306 50.7188 65.1119 51.5625 63.1119 51.5625ZM83.9169 49.1875L88.1044 57H94.6669L89.4481 48C91.7606 46.875 93.1356 44.75 93.1356 41.75C93.1356 36.7188 89.8231 33.875 83.7606 33.875H74.8544V57H80.8544V49.2188H83.0419C83.3544 49.2188 83.6356 49.2188 83.9169 49.1875ZM80.8544 44.3438V39.1562H83.7606C85.9794 39.1562 87.0731 40.125 87.0731 41.75C87.0731 43.4375 85.9794 44.3438 83.7606 44.3438H80.8544ZM110.097 52.625L111.472 57H117.941L110.003 33.875H102.722L94.7844 57H101.253L102.628 52.625H110.097ZM103.816 48.375L106.347 40.2188L108.909 48.375H103.816ZM137.121 51.4688H126.746L136.589 38.5V33.875H119.152V39.4062H128.652L118.808 52.4062V57H137.121V51.4688ZM152.488 48.4062L161.019 33.875H154.426L149.519 43.4375L144.613 33.875H137.988L146.488 48.4062V57H152.488V48.4062ZM202.473 33.875H196.036L192.161 48.1562L188.192 33.875H183.942L179.973 48.1562L176.129 33.875H169.661L176.723 57H182.098L186.098 42.7188L190.004 57H195.411L202.473 33.875ZM219.747 51.9375H210.341V47.4688H218.466V43.0625H210.341V38.9375H219.434V33.875H204.341V57H219.747V51.9375ZM238.021 51.9375H228.614V47.4688H236.739V43.0625H228.614V38.9375H237.708V33.875H222.614V57H238.021V51.9375ZM253.826 57H260.669L252.326 45.2188L260.013 33.875H253.451L246.888 43.9062V33.875H240.888V57H246.888V46.9062L253.826 57Z"
        fill="white"
      />
    </svg>
  );
}

const CardBase = styled.div<{ index: number; imageUrl: string }>`
  height: 280px;
  border-radius: 20px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: #333333;
  background-image: url(${({ imageUrl }) => imageUrl});
  cursor: pointer;

  :first-of-type {
    margin-left: 20px;
  }
  :last-of-type {
    margin-right: 20px;
  }
`;

const ActiveCurationCard = styled(CardBase)`
  position: relative;
  min-width: 240px;
`;

const CurationCard = styled(CardBase)`
  min-width: ${CARD_WIDTH}px;
`;

const CurationCardButton = styled(Button)`
  position: absolute;
  width: calc(100% - 24px);
  left: 12px;
  bottom: 20px;
  color: ${({ theme }) => theme.palette.common.black};
`;

const NotiOnButton = styled(Button)`
  width: auto;
  margin: 0 12px;
  display: flex;
  align-items: center;
  column-gap: 4px;
`;

const ShareButton = styled(Button)`
  width: auto;
  margin: 0 12px;
  display: flex;
  align-items: center;
  column-gap: 4px;
`;

export default memo(CrazycurationWeek);
