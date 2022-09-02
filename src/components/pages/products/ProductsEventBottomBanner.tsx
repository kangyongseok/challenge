import { useEffect, useRef } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchContentsProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { HIDE_PRODUCTS_CRAZY_CURATION_BANNER_IDS } from '@constants/localStorage';
import { BOTTOM_NAVIGATION_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { creazycurationProductsEventBottomBannerOpenState } from '@recoil/crazycuration';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

function ProductsEventBottomBanner() {
  const router = useRouter();
  const triggered = useReverseScrollTrigger();

  const [open, setOpen] = useRecoilState(creazycurationProductsEventBottomBannerOpenState);
  const openTriggerTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: { contents: { id = 0, imageBanner = '', url = '/' } = {} } = {} } = useQuery(
    queryKeys.common.contentsProducts(0),
    () => fetchContentsProducts(0)
  );

  const handleClick = () => {
    logEvent(attrKeys.crazycuration.clickCrazyWeek, {
      name: attrProperty.name.productList,
      title: attrProperty.title.banner
    });
    setOpen(false);
    ChannelTalk.showChannelButton();
    const hideProductsCrazyCurationBannerIds =
      LocalStorage.get<number[]>(HIDE_PRODUCTS_CRAZY_CURATION_BANNER_IDS) || [];
    LocalStorage.set(
      HIDE_PRODUCTS_CRAZY_CURATION_BANNER_IDS,
      hideProductsCrazyCurationBannerIds.concat([id])
    );
    router.push(url);
  };

  const handleClose = () => {
    setOpen(false);
    ChannelTalk.showChannelButton();
    const hideProductsCrazyCurationBannerIds =
      LocalStorage.get<number[]>(HIDE_PRODUCTS_CRAZY_CURATION_BANNER_IDS) || [];
    LocalStorage.set(
      HIDE_PRODUCTS_CRAZY_CURATION_BANNER_IDS,
      hideProductsCrazyCurationBannerIds.concat([id])
    );
  };

  useEffect(() => {
    const hideProductsCrazyCurationBannerIds =
      LocalStorage.get<number[]>(HIDE_PRODUCTS_CRAZY_CURATION_BANNER_IDS) || [];

    if (id && !hideProductsCrazyCurationBannerIds.includes(id)) {
      openTriggerTimerRef.current = setTimeout(() => {
        ChannelTalk.hideChannelButton();
        setOpen(true);
      }, 1000 * 60);
    }

    return () => {
      if (openTriggerTimerRef.current) {
        clearTimeout(openTriggerTimerRef.current);
      }
    };
  }, [id, setOpen]);

  if (!open) return null;

  return (
    <StyledProductsEventBottomBanner triggered={triggered}>
      <Box customStyle={{ position: 'relative' }}>
        <Image width="100%" src={imageBanner} alt="Ad Banner Img" disableAspectRatio />
        <Flexbox
          customStyle={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          <Box customStyle={{ flexGrow: 1, height: '100%' }} onClick={handleClick} />
          <Box customStyle={{ minWidth: 50, height: '100%' }} onClick={handleClose} />
        </Flexbox>
      </Box>
    </StyledProductsEventBottomBanner>
  );
}

const StyledProductsEventBottomBanner = styled.div<{ triggered?: boolean }>`
  position: fixed;
  width: 100%;
  left: 0;
  bottom: ${BOTTOM_NAVIGATION_HEIGHT}px;
  cursor: pointer;
  opacity: 0;

  animation: ${({ triggered }) => (triggered ? 'fadeIn' : 'fadeOut')} 0.1s ease-in forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

export default ProductsEventBottomBanner;
