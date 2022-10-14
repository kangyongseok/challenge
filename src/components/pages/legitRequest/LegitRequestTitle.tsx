import { Flexbox, Icon, Typography, dark } from 'mrcamel-ui';

import { Image } from '@components/UI/atoms';

interface LegitRequestTitleProps {
  brandLogo: string;
  brandName: string;
  categoryName: string;
  title: string;
}

function LegitRequestTitle({ brandLogo, brandName, categoryName, title }: LegitRequestTitleProps) {
  return (
    <Flexbox
      component="section"
      alignment="center"
      gap={12}
      customStyle={{ padding: '0 20px 32px', userSelect: 'none' }}
    >
      <Flexbox direction="vertical" gap={4} customStyle={{ flex: 1 }}>
        <Flexbox alignment="center">
          <Typography variant="h4" customStyle={{ color: dark.palette.common.ui60 }}>
            {categoryName}
          </Typography>
          <Icon
            name="CaretRightOutlined"
            width={16}
            height={16}
            customStyle={{ color: dark.palette.common.ui60 }}
          />
          <Typography variant="h4" customStyle={{ color: dark.palette.common.ui60 }}>
            {brandName}
          </Typography>
        </Flexbox>
        <Typography variant="h3" weight="medium">
          {title}
        </Typography>
      </Flexbox>
      <Image
        src={brandLogo}
        width={110}
        height={110}
        disableAspectRatio
        customStyle={{ margin: '0 auto' }}
      />
    </Flexbox>
  );
}

export default LegitRequestTitle;
