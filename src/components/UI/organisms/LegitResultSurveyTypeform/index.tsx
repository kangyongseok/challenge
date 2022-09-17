import { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import amplitude from 'amplitude-js';
import type { BehavioralType } from '@typeform/embed/types/base';
import { PopupButton } from '@typeform/embed-react';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { LEGIT_SESSION_ID } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitResultSurveyTypeform() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: accessUser } = useQueryAccessUser();
  const [loadSurveyTypeform, setLoadSurveyTypeform] = useState(false);
  const [open, setOpen] = useState<BehavioralType | undefined>(undefined);

  const { data: { userId, status } = {} } = useQuery(
    queryKeys.products.productLegit({ productId }),
    () => fetchProductLegit(productId),
    {
      enabled: router.pathname === '/products/[id]/legit/result' && !!id
    }
  );

  const handleSubmit = () => {
    logEvent(attrKeys.legitResult.SUBMIT_LEGIT_SURVEY);
    LocalStorage.set(LEGIT_SESSION_ID, amplitude.getInstance().getSessionId());
  };

  const handleRouteChangeComplete = () => {
    logEvent(attrKeys.legitResult.VIEW_LEGIT_SURVEY);
    setOpen('load');
  };

  useEffect(() => {
    if (
      router.pathname === '/products/[id]/legit/result' &&
      !!id &&
      status === 30 &&
      accessUser &&
      accessUser.userId === userId &&
      LocalStorage.get(LEGIT_SESSION_ID) !== amplitude.getInstance().getSessionId()
    ) {
      setLoadSurveyTypeform(true);
    }
  }, [router.pathname, accessUser, id, loadSurveyTypeform, status, userId]);

  useEffect(() => {
    if (loadSurveyTypeform) router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      if (loadSurveyTypeform) router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [loadSurveyTypeform, router.events]);

  if (!loadSurveyTypeform) return null;

  return (
    <PopupButton
      id="Mcpmlqs5"
      open={open}
      onClose={() => {
        setOpen(undefined);
        setLoadSurveyTypeform(false);
      }}
      tracking={{
        utm_source: 'owned',
        utm_medium: 'legit',
        utm_campaign: 'sprint1-1',
        utm_term: String(accessUser?.userId)
      }}
      onSubmit={handleSubmit}
      style={{
        display: 'none'
      }}
    >
      <span />
    </PopupButton>
  );
}

export default LegitResultSurveyTypeform;
