import { forwardRef } from 'react';

import { Box, Flexbox, Image } from 'mrcamel-ui';

const EventDogHoneyBanner = forwardRef<HTMLDivElement>(function EventDogHoneyBanner(_, ref) {
  return (
    <Flexbox ref={ref} component="section" justifyContent="center">
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
