import { useEffect } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'mrcamel-ui';

import {
  LegitRequestEdit,
  LegitRequestForm,
  LegitRequestSelectBrand,
  LegitRequestSelectCategory,
  LegitRequestSelectModel
} from '@components/pages/legitRequest';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitRequest() {
  const router = useRouter();

  const [{ categoryId, brandId }, setLegitRequestState] = useRecoilState(legitRequestState);
  const setProductLegitParamsState = useSetRecoilState(productLegitParamsState);
  const resetLegitRequestState = useResetRecoilState(legitRequestState);
  const resetProductLegitParamsState = useResetRecoilState(productLegitParamsState);

  const { data: accessUser } = useQueryAccessUser();

  const step = String(router.query?.step || '');

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_PROCESS);
  }, []);

  useEffect(() => {
    if (!accessUser) {
      router.back();
      return;
    }
    if (
      router.isReady &&
      !['selectCategory', 'selectBrand', 'selectModel', 'form', 'edit'].includes(step)
    ) {
      router.replace('/legit/request/selectCategory');
    }
  }, [accessUser, router, step]);

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
    <ThemeProvider theme="dark">
      {step === 'selectCategory' && <LegitRequestSelectCategory />}
      {step === 'selectBrand' && <LegitRequestSelectBrand />}
      {step === 'selectModel' && <LegitRequestSelectModel />}
      {step === 'form' && <LegitRequestForm />}
      {step === 'edit' && <LegitRequestEdit />}
    </ThemeProvider>
  );
}

export default LegitRequest;
