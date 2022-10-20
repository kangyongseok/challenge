import { useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Typography, useTheme } from 'mrcamel-ui';

import LegitOpinion from '@components/UI/molecules/LegitOpinion';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { legitAdminOpinionEditableState } from '@recoil/legitAdminOpinion/atom';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitAdminRequestOpinion() {
  const router = useRouter();
  const { id } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const editable = useRecoilValue(legitAdminOpinionEditableState);
  const { data: accessUser } = useQueryAccessUser();

  const { data: { legitOpinions = [], isLegitHead } = {} } = useQuery(
    queryKeys.productLegits.legit(Number(id)),
    () => fetchProductLegit(Number(id)),
    {
      enabled: !!id
    }
  );

  const myLegitOpinion = useMemo(
    () => legitOpinions.find(({ roleLegit: { userId } }) => userId === (accessUser || {}).userId),
    [legitOpinions, accessUser]
  );

  if (editable || !myLegitOpinion) return null;

  return (
    <Box component="section" customStyle={{ margin: '52px 0' }}>
      {isLegitHead && myLegitOpinion.result === 3 ? (
        <Box
          customStyle={{
            padding: 20,
            backgroundColor: common.bg03,
            borderRadius: 8
          }}
        >
          <Typography weight="bold">camel</Typography>
          <Typography variant="body2" customStyle={{ marginTop: 4, color: common.ui60 }}>
            카멜 실시간 사진감정팀
          </Typography>
          <Typography
            variant="h4"
            dangerouslySetInnerHTML={{
              __html: myLegitOpinion.description.replaceAll(/\r?\n/gi, '<br />')
            }}
            customStyle={{ marginTop: 8 }}
          />
        </Box>
      ) : (
        <LegitOpinion legitOpinion={myLegitOpinion} />
      )}
    </Box>
  );
}

export default LegitAdminRequestOpinion;
