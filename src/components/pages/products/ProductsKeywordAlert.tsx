import { useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { Alert, Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

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

  const {
    theme: {
      palette: { common },
      box: { shadow }
    }
  } = useTheme();

  const [isIntersecting, setIntersecting] = useState(false);

  const alertRef = useRef(null);
  const observer = useMemo(
    () => new IntersectionObserver(([e]) => setIntersecting(e.isIntersecting)),
    []
  );

  useEffect(() => {
    if (alertRef.current) {
      observer.observe(alertRef.current);
    }

    return () => {
      observer.disconnect();
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
    <Alert
      ref={alertRef}
      brandColor="primary-bgLight"
      round="8"
      customStyle={{
        height: 56,
        padding: '0px 16px',
        border: `1px solid ${common.grey['90']}`,
        boxShadow: shadow.category
      }}
    >
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ height: '100%' }}>
        <Typography variant="body2" weight="bold">
          {index % 2 === 0
            ? '같은 필터 또 적용하기 귀찮다면?'
            : '이 매물목록 다음에도 편하게 보려면?'}
        </Typography>
        <Chip
          brandColor="primary"
          startIcon={<Icon name="BookmarkFilled" size="small" />}
          size="small"
          customStyle={{ gap: 2, whiteSpace: 'nowrap' }}
          onClick={() => setProductsKeywordState(true)}
        >
          이 검색 저장
        </Chip>
      </Flexbox>
    </Alert>
  );
}

export default ProductsKeywordAlert;
