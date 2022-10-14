import { useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { Button, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { productsKeywordInduceTriggerState, productsKeywordState } from '@recoil/productsKeyword';

interface ProductsKeywordAlertProps {
  index: number;
  measure?: () => void;
}

function ProductsKeywordAlert({ index, measure }: ProductsKeywordAlertProps) {
  const [{ dialog, latestTriggerTime }, setProductsKeywordInduceTriggerState] = useRecoilState(
    productsKeywordInduceTriggerState
  );
  const setProductsKeywordState = useSetRecoilState(productsKeywordState);

  const [isIntersecting, setIntersecting] = useState(false);

  const alertRef = useRef(null);
  const observer = useMemo(() => {
    let newObserver: IntersectionObserver | null = null;

    try {
      newObserver = new IntersectionObserver(([e]) => setIntersecting(e.isIntersecting));
    } catch {
      setIntersecting(true);
    }

    return newObserver;
  }, []);

  useEffect(() => {
    if (observer && alertRef.current) {
      observer.observe(alertRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [observer]);

  useEffect(() => {
    if (isIntersecting && !dialog && !latestTriggerTime) {
      setProductsKeywordInduceTriggerState((prevState) => ({
        ...prevState,
        dialog: true
      }));
    }
  }, [setProductsKeywordInduceTriggerState, isIntersecting, dialog, latestTriggerTime]);

  useEffect(() => {
    if (measure && typeof measure === 'function') {
      measure();
    }
  }, [measure]);

  return (
    <CustomAlert ref={alertRef}>
      <Typography variant="body2" weight="bold">
        {index % 2 === 0
          ? '같은 필터 또 적용하기 귀찮다면?'
          : '이 매물목록 다음에도 편하게 보려면?'}
      </Typography>
      <Button
        brandColor="primary-light"
        variant="outlined"
        startIcon={<Icon name="BookmarkFilled" size="small" />}
        size="medium"
        customStyle={{ whiteSpace: 'nowrap' }}
        onClick={() => setProductsKeywordState(true)}
      >
        필터 저장하기
      </Button>
    </CustomAlert>
  );
}

const CustomAlert = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.palette.common.bg02};
  padding: 12px;
  border-radius: 8px;
  min-height: 60px;
`;

export default ProductsKeywordAlert;
