import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import amplitude from 'amplitude-js';
import type { BehavioralType } from '@typeform/embed/types/base';
import { PopupButton } from '@typeform/embed-react';
import { useQuery } from '@tanstack/react-query';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import { LEGIT_SESSION_ID } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { getCookie, setCookie } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitResultSurveyTypeform() {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);
  const { data: accessUser } = useQueryAccessUser();
  const [loadSurveyTypeform, setLoadSurveyTypeform] = useState(false);
  const [open, setOpen] = useState<BehavioralType | undefined>(undefined);

  const { data: { userId, status } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: router.pathname === '/legit/[id]/result' && !!id
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

  const handleClose = () => {
    setCookie('hideLegitSurveyTypeform', 'done', 1);
    setOpen(undefined);
    setLoadSurveyTypeform(false);
  };

  useEffect(() => {
    if (
      router.pathname === '/legit/[id]/result' &&
      !!id &&
      status === 30 &&
      accessUser &&
      accessUser.userId === userId &&
      LocalStorage.get(LEGIT_SESSION_ID) !== amplitude.getInstance().getSessionId() &&
      !getCookie('hideLegitSurveyTypeform')
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
      onClose={handleClose}
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
