import { Box, Label, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

function LegitGuideTitle() {
  return (
    <Box component="section" customStyle={{ marginTop: 32, textAlign: 'center' }}>
      <NewLabel text="NEW" variant="contained" size="xsmall" brandColor="primary" />
      <Typography variant="h2" customStyle={{ marginTop: 8 }}>
        판매중인 사진으로 간편하게,
      </Typography>
      <Typography variant="h1" weight="bold">
        실시간 사진감정!
      </Typography>
    </Box>
  );
}

const NewLabel = styled(Label)`
  width: 32px;
  height: 19px;
  border-radius: 10px;
  font-weight: 700;
`;

export default LegitGuideTitle;
