import { useRecoilValue } from 'recoil';
import { useQueryClient } from '@tanstack/react-query';
import { Flexbox, Icon, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber, getTenThousandUnitPrice } from '@utils/formats';

import {
  eventContentDogHoneyFilterState,
  eventContentProductsParamsState
} from '@recoil/eventFilter';
import useQueryContents from '@hooks/useQueryContents';

interface EventDogHoneyInfoProps {
  isLoading: boolean;
  onMoveFixedInfo: () => void;
}

function EventDogHoneyInfo({ isLoading, onMoveFixedInfo }: EventDogHoneyInfoProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const queryClient = useQueryClient();
  const {
    data: { realPriceAverage = 0 }
  } = useQueryContents();

  const eventContentProductsParams = useRecoilValue(eventContentProductsParamsState);
  const { totalElements } = useRecoilValue(eventContentDogHoneyFilterState);

  const handleClickReload = () => {
    logEvent(attrKeys.events.CLICK_REFRESH_PRODUCT, {
      name: attrProperty.name.EVENT_DETAIL,
      title: '2301_DOG_HONEY',
      keyword: eventContentProductsParams.keyword
    });
    onMoveFixedInfo();
    queryClient.resetQueries(queryKeys.commons.contentProducts(eventContentProductsParams));
  };

  return (
    <Flexbox
      component="section"
      gap={12}
      alignment="center"
      customStyle={{ padding: '12px 20px', backgroundColor: common.uiWhite, zIndex: 1 }}
    >
      {isLoading ? (
        Array.from({ length: 8 }, (_, index) => (
          <Flexbox key={`event-filter-skeleton-${index}`} direction="vertical" gap={20}>
            <Skeleton disableAspectRatio round={8} width={250} height={16} />
            <Skeleton disableAspectRatio round={8} width={74} height={20} />
          </Flexbox>
        ))
      ) : (
        <>
          <Flexbox alignment="center" customStyle={{ flex: 1 }}>
            <Typography variant="body2" customStyle={{ '& > span': { fontWeight: 'bold' } }}>
              평균실거래가
              <span>
                {eventContentProductsParams?.keyword?.length
                  ? ` ${commaNumber(getTenThousandUnitPrice(realPriceAverage).toFixed(0))}`
                  : ' -'}
                만원
              </span>
              <span style={{ fontWeight: 'normal', color: common.ui80 }}> | </span>
              전체
              <span> {totalElements === 0 ? '-' : commaNumber(totalElements)}</span>개
            </Typography>
          </Flexbox>
          <Flexbox
            gap={4}
            alignment="center"
            customStyle={{ cursor: 'pointer' }}
            onClick={handleClickReload}
          >
            <Icon name="RotateOutlined" customStyle={{ width: 20, height: 20 }} />
            <Typography variant="body1">새로고침</Typography>
          </Flexbox>
        </>
      )}
    </Flexbox>
  );
}

export default EventDogHoneyInfo;
