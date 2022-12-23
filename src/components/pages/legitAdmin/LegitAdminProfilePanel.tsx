import { useCallback } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

import { LegitProfileInfo, LegitProfileOpinionLegitList } from '@components/pages/legitProfile';

import { fetchLegitProfile } from '@api/user';
import { fetchLegitsBrands } from '@api/model';

import queryKeys from '@constants/queryKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitAdminProfilePanel() {
  const router = useRouter();

  const { data: accessUser } = useQueryAccessUser();

  const {
    isLoading,
    isFetched,
    data: { profile, cntOpinion = 0, roleSeller } = {}
  } = useQuery(
    queryKeys.users.legitProfile(accessUser?.userId || 0),
    () => fetchLegitProfile(accessUser?.userId || 0),
    {
      enabled: !!accessUser?.userId
    }
  );
  const { data: legitsBrands = [] } = useQuery(queryKeys.models.legitsBrands(), () =>
    fetchLegitsBrands()
  );

  const handleClickEditProfile = useCallback(() => {
    if (accessUser?.userId) {
      router.push({
        pathname: `/legit/profile/${accessUser.userId}`,
        query: { isEdit: true }
      });
    }
  }, [accessUser?.userId, router]);

  return accessUser?.userId && (isLoading || (isFetched && profile)) ? (
    <>
      <LegitProfileInfo
        isLoading={isLoading}
        profile={profile}
        legitsBrands={legitsBrands}
        cntOpinion={cntOpinion}
        showEdit
        hideBlur
        onClickEditProfile={handleClickEditProfile}
        sellerId={roleSeller?.sellerId}
        infoCustomStyle={{
          paddingTop: 20
        }}
      />
      <LegitProfileOpinionLegitList userId={accessUser.userId} />
    </>
  ) : null;
}

export default LegitAdminProfilePanel;
