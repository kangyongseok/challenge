import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { Divider } from '@components/UI/molecules';
import LegitUploadPhoto from '@components/pages/legitRequest/LegitUploadPhoto';

import { CommonPhotoGuideDetail } from '@dto/common';

interface LegitRequestOpinionProps {
  isLoading: boolean;
  description: string;
  samplePhotoGuideDetails: CommonPhotoGuideDetail[];
  onClickSamplePhotoGuide: () => void;
}

function LegitRequestOpinion({
  isLoading,
  description,
  samplePhotoGuideDetails,
  onClickSamplePhotoGuide
}: LegitRequestOpinionProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={32}
      customStyle={{ padding: '32px 20px', borderRadius: 8, backgroundColor: common.bg02 }}
    >
      {description.length > 0 && (
        <>
          <Box>
            <Typography weight="bold">camel</Typography>
            <Typography variant="body2" customStyle={{ marginTop: 4, color: common.ui60 }}>
              카멜 실시간 사진감정팀
            </Typography>
            <Typography
              variant="h4"
              dangerouslySetInnerHTML={{
                __html: description.replace(/\r?\n/g, '<br />')
              }}
              customStyle={{ marginTop: 8 }}
            />
          </Box>
          <Divider />
        </>
      )}
      <Box>
        <LegitUploadPhoto
          mode="sample"
          isLoading={isLoading}
          showPhotoGuide={false}
          photoGuideDetails={samplePhotoGuideDetails}
          photoGuideImages={samplePhotoGuideDetails.map(({ id, imageSample }) => ({
            photoGuideId: id,
            imageUrl: imageSample
          }))}
          onClickSample={onClickSamplePhotoGuide}
        />
      </Box>
    </Flexbox>
  );
}

export default LegitRequestOpinion;
