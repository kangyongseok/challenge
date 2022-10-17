import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

interface LegitRequestOpinionProps {
  description: string;
}

function LegitRequestOpinion({ description }: LegitRequestOpinionProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <Flexbox component="section" direction="vertical" gap={20}>
      <Typography variant="h3" weight="medium">
        감정사 의견입니다!
      </Typography>
      <Box customStyle={{ padding: 20, borderRadius: 8, backgroundColor: common.bg03 }}>
        <Typography weight="bold">camel</Typography>
        <Typography variant="body2" customStyle={{ marginTop: 4, color: common.ui60 }}>
          카멜 실시간 사진감정팀
        </Typography>
        <Typography
          variant="h4"
          dangerouslySetInnerHTML={{
            __html: description.replaceAll(/\r?\n/gi, '<br />')
          }}
          customStyle={{ marginTop: 8 }}
        />
      </Box>
    </Flexbox>
  );
}

export default LegitRequestOpinion;
