import { forwardRef } from 'react';

import { Box, Flexbox, Image } from '@mrcamelhub/camel-ui';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

const EventDogHoneyBanner = forwardRef<HTMLDivElement>(function EventDogHoneyBanner(_, ref) {
  return (
    <Flexbox
      ref={ref}
      component="section"
      justifyContent="center"
      customStyle={{ marginTop: isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0 }}
    >
      <Box customStyle={{ width: '100%' }}>
        <Image
          ratio="1:2"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/crazycuration/mainModal17.png`}
          customStyle={{ imageOrientation: 'from-image' }}
          alt="EventDogHoneyMain.png"
        />
      </Box>
    </Flexbox>
  );
});

export default EventDogHoneyBanner;
