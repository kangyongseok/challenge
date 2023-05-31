import { useEffect, useRef } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { ThemeProvider } from '@mrcamelhub/camel-ui';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';
import {
  LegitRequestEdit,
  LegitRequestForm,
  LegitRequestSelectBrand,
  LegitRequestSelectCategory,
  LegitRequestSelectModel
} from '@components/pages/legitRequest';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { SAVED_LEGIT_REQUEST_STATE } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import useQueryUserData from '@hooks/useQueryUserData';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useOsAlarm from '@hooks/useOsAlarm';

function LegitRequest() {
  const router = useRouter();

  const [{ categoryId, brandId }, setLegitRequestState] = useRecoilState(legitRequestState);
  const setProductLegitParamsState = useSetRecoilState(productLegitParamsState);
  const resetLegitRequestState = useResetRecoilState(legitRequestState);
  const resetProductLegitParamsState = useResetRecoilState(productLegitParamsState);

  const { data: accessUser, isSuccess } = useQueryAccessUser();
  const { remove: removeUserData } = useQueryUserData();
  const { checkOsAlarm, openOsAlarmDialog, handleCloseOsAlarmDialog } = useOsAlarm();

  const checkOsAlarmTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const step = String(router.query?.step || '');

  useEffect(() => {
    removeUserData(SAVED_LEGIT_REQUEST_STATE);
    logEvent(attrKeys.legit.VIEW_LEGIT_PROCESS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    checkOsAlarmTimerRef.current = setTimeout(() => checkOsAlarm(), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (checkOsAlarmTimerRef.current) {
        clearTimeout(checkOsAlarmTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSuccess && !accessUser) {
      router.back();
    }
  }, [router, isSuccess, accessUser]);

  useEffect(() => {
    if (
      router.isReady &&
      !['selectCategory', 'selectBrand', 'selectModel', 'form', 'edit'].includes(step)
    ) {
      router.replace('/legit/request/selectCategory');
    }
  }, [router, step]);

  useEffect(() => {
    router.beforePopState(({ as }) => {
      const prevStep = step;
      const curLastPath = as.substring(as.lastIndexOf('/') + 1);

      if (
        (prevStep === 'selectCategory' && curLastPath === 'selectBrand') ||
        (prevStep === 'selectBrand' && curLastPath === 'selectModel') ||
        (prevStep === 'selectModel' && curLastPath === 'form') ||
        (prevStep === 'selectCategory' &&
          curLastPath === 'selectModel' &&
          categoryId === 0 &&
          brandId > 0)
      ) {
        router.back();
        return false;
      }

      if (prevStep !== 'selectBrand' && curLastPath === 'legit') {
        setTimeout(() => {
          resetLegitRequestState();
          resetProductLegitParamsState();
        }, 500);
      }

      if (
        (prevStep === 'selectBrand' && curLastPath === 'selectCategory') ||
        (prevStep === 'selectBrand' && curLastPath === 'legit')
      ) {
        setLegitRequestState((currVal) => ({ ...currVal, categoryId: 0, categoryName: '' }));
      }

      if (prevStep === 'selectModel' && curLastPath === 'selectBrand') {
        setLegitRequestState((currVal) => ({
          ...currVal,
          brandId: 0,
          brandName: '',
          brandLogo: ''
        }));
      }

      if (prevStep === 'selectModel' && curLastPath === 'selectCategory') {
        setLegitRequestState((currVal) => ({
          ...currVal,
          categoryId: 0,
          categoryName: ''
        }));
      }

      if (prevStep === 'form' && curLastPath === 'selectModel') {
        setLegitRequestState((currVal) => ({
          ...currVal,
          modelName: '',
          modelImage: '',
          isCompleted: false
        }));
        resetProductLegitParamsState();
      }

      return true;
    });
  }, [
    brandId,
    categoryId,
    resetLegitRequestState,
    resetProductLegitParamsState,
    router,
    setLegitRequestState,
    setProductLegitParamsState,
    step
  ]);

  useEffect(() => {
    document.body.className = 'legit-dark';

    return () => {
      document.body.removeAttribute('class');
    };
  }, []);

  return (
    <>
      <ThemeProvider theme="dark">
        {step === 'selectCategory' && <LegitRequestSelectCategory />}
        {step === 'selectBrand' && <LegitRequestSelectBrand />}
        {step === 'selectModel' && <LegitRequestSelectModel />}
        {step === 'form' && <LegitRequestForm />}
        {step === 'edit' && <LegitRequestEdit />}
      </ThemeProvider>
      <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default LegitRequest;
