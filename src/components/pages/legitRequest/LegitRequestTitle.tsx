import { Flexbox, Icon, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';

interface LegitRequestTitleProps {
  brandLogo: string;
  brandName: string;
  categoryName: string;
  title: string;
  isEditMode?: boolean;
}

function LegitRequestTitle({
  brandLogo,
  brandName,
  categoryName,
  title,
  isEditMode = false
}: LegitRequestTitleProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      component="section"
      alignment="center"
      gap={12}
      customStyle={{
        padding: isEditMode ? '0 20px' : '0 20px 32px',
        userSelect: 'none',
        backgroundColor: common.bg03
      }}
    >
      <Flexbox direction="vertical" gap={4} customStyle={{ flex: 1 }}>
        <Flexbox alignment="center">
          <Typography variant="h4" customStyle={{ color: common.ui60 }}>
            {categoryName}
          </Typography>
          <Icon
            name="CaretRightOutlined"
            width={16}
            height={16}
            customStyle={{ color: common.ui60 }}
          />
          <Typography variant="h4" customStyle={{ color: common.ui60 }}>
            {brandName}
          </Typography>
        </Flexbox>
        <Typography variant="h3" weight="medium">
          {title}
        </Typography>
      </Flexbox>
      <Image
        src={brandLogo}
        alt="Brand Logo Img"
        width={110}
        height={110}
        round={8}
        disableAspectRatio
        customStyle={{ margin: '0 auto' }}
      />
    </Flexbox>
  );
}

export default LegitRequestTitle;
