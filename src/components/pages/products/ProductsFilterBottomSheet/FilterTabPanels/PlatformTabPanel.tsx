import { useRef } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Grid } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  platformFilterOptionsSelector,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

import FilterOption from '../FilterOption';

function getPlatformImageSrc(hasImage: boolean, id: number) {
  if (!hasImage) return '';

  if (id === 161) {
    return 'https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/images/logo_icon_blue.png';
  }

  return `https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${id}.png`;
}

function PlatformTabPanel() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const siteUrls = useRecoilValue(platformFilterOptionsSelector);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );

  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleClick = (newCodeId: number, newId: number) => () => {
    const selectedSearchOptionIndex = selectedSearchOptions.findIndex(
      ({ codeId, id }) => codeId === newCodeId && id === newId
    );

    if (selectedSearchOptionIndex > -1) {
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: selectedSearchOptions.filter(
          (_, index) => index !== selectedSearchOptionIndex
        )
      }));
    } else {
      const selectedPlatformIndex = siteUrls.findIndex(({ id }) => id === newId);
      const selectedPlatform = siteUrls[selectedPlatformIndex];

      if (selectedPlatform) {
        logEvent(attrKeys.products.selectFilter, {
          name: attrProperty.name.productList,
          title: attrProperty.title.site,
          index: selectedPlatformIndex,
          count: selectedPlatform.count,
          value: selectedPlatform.name
        });

        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.concat(selectedPlatform)
        }));
      }
    }
  };

  return (
    <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
      <Box customStyle={{ flex: 1, padding: '8px 20px', overflowY: 'auto' }}>
        <Grid ref={scrollElementRef} container columnGap={8}>
          {siteUrls
            .filter(({ id }) => id === 161)
            .concat(siteUrls.filter(({ id }) => id !== 161))
            .map(({ id, codeId, hasImage, consonant, checked, count, name }) => (
              <Grid
                key={`platform-filter-option-${id}`}
                item
                xs={2}
                customStyle={{
                  height: 'fit-content'
                }}
              >
                <FilterOption
                  avatarSrc={getPlatformImageSrc(hasImage, id)}
                  data-consonant={`consonant-${consonant}`}
                  checked={checked}
                  count={count}
                  onClick={handleClick(codeId, id)}
                >
                  {name}
                </FilterOption>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Flexbox>
  );
}

export default PlatformTabPanel;
