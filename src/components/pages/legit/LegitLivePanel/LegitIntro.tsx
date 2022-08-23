import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper';
import { useQuery } from 'react-query';
import { Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserLegitTargets } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import LegitTrialCard from '../LegitTrialCard';

interface LegitIntroProps {
  forceRender?: boolean;
}

function LegitIntro({ forceRender = false }: LegitIntroProps) {
  const { data: accessUser } = useQueryAccessUser();

  const { data: products = [] } = useQuery(queryKeys.users.legitTargets(), fetchUserLegitTargets, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  if (accessUser && products.length && !forceRender) return null;

  return (
    <StyledLegitIntro component="section" direction="vertical">
      <Swiper
        effect="cards"
        cardsEffect={{ slideShadows: false }}
        modules={[EffectCards]}
        onSlideChange={() =>
          logEvent(attrKeys.legit.WIPE_X_LEGITCARD, {
            name: attrProperty.legitName.LEGIT_MAIN,
            title: attrProperty.legitTitle.LEGIT_VIDEO
          })
        }
        style={{ width: 'calc(100% - 20px)' }}
        initialSlide={1}
      >
        <SwiperSlide
          style={{
            filter: 'drop-shadow(0px 8px 32px #c6c7cc)'
          }}
        >
          <LegitTrialCard
            result={3}
            brandName="dior"
            tutorialName="dior"
            imageSrc={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-trial-dior-bag.png`}
          />
        </SwiperSlide>
        <SwiperSlide
          style={{
            filter: 'drop-shadow(0px 8px 32px #c6c7cc)'
          }}
        >
          <LegitTrialCard
            result={1}
            brandName="gucci"
            tutorialName="gucciShoes"
            imageSrc={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-trial-gucci-shoes.png`}
          />
        </SwiperSlide>
        <SwiperSlide
          style={{
            filter: 'drop-shadow(0px 8px 32px #c6c7cc)'
          }}
        >
          <LegitTrialCard
            result={2}
            brandName="gucci"
            tutorialName="gucci"
            imageSrc={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-trial-gucci-bag.png`}
          />
        </SwiperSlide>
      </Swiper>
    </StyledLegitIntro>
  );
}

const StyledLegitIntro = styled(Flexbox)`
  position: relative;
  width: 100%;
  margin-top: 42px;
  padding: 0 20px;
`;

export default LegitIntro;
