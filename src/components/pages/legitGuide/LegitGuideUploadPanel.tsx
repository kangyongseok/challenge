import { Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

function LegitGuideUploadPanel() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      component="section"
      direction="vertical"
      alignment="center"
      customStyle={{ marginTop: 51, padding: '0 40px' }}
    >
      <Typography variant="h3" weight="bold">
        직접 사진을 찍어 신청해보세요!
      </Typography>
      <Typography customStyle={{ marginTop: 8, textAlign: 'center', color: common.ui60 }}>
        걱정마세요. 촬영 가이드에 따라 사진을 올려주세요.
        <br />
        감정이 완료되면, 앱 알림으로 알려드려요!
      </Typography>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 0,
          marginTop: 30,
          paddingBottom: 'calc(176.21145374449338% + 41px)'
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe
          src="https://demo.arcade.software/0ZCOygLc9QmiXEdB4vkF?embed"
          frameBorder="0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{ margin: '53px 0 56px', textAlign: 'center' }}
      >
        지금 바로, 사진을 올려보세요!
      </Typography>
    </Flexbox>
  );
}

export default LegitGuideUploadPanel;
