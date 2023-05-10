import { useRecoilState } from 'recoil';
import { Box, Flexbox, Icon, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelReceivedMessageFilteredState } from '@recoil/channel';

interface ChannelsReceivedMessagesFilterProps {
  isLoading?: boolean;
}

function ChannelsReceivedMessagesFilter({
  isLoading = false
}: ChannelsReceivedMessagesFilterProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const [isChannelReceivedMessageFiltered, setChannelReceivedMessageFilteredState] = useRecoilState(
    channelReceivedMessageFilteredState
  );

  const handleClickFilter = () => {
    logEvent(attrKeys.channel.CLICK_SORT, {
      name: attrProperty.name.CHANNEL,
      title: attrProperty.title.RECEIVE,
      att: isChannelReceivedMessageFiltered ? 'OFF' : 'ON'
    });
    setChannelReceivedMessageFilteredState(!isChannelReceivedMessageFiltered);
  };

  return (
    <Box
      component="section"
      customStyle={{ padding: '8px 20px', backgroundColor: common.bg02 }}
      onClick={handleClickFilter}
    >
      {isLoading ? (
        <Flexbox alignment="center" gap={4} customStyle={{ padding: '8px 0' }}>
          <Skeleton width={20} height={20} round={8} disableAspectRatio />
          <Skeleton width={65} height={20} round={8} disableAspectRatio />
        </Flexbox>
      ) : (
        <Flexbox alignment="center" gap={4} customStyle={{ padding: '8px 0' }}>
          <Icon
            name={isChannelReceivedMessageFiltered ? 'CheckboxCheckedFilled' : 'CheckboxOutlined'}
            size="medium"
            customStyle={{ color: isChannelReceivedMessageFiltered ? primary.light : common.ui60 }}
          />
          <Typography>매물별 보기</Typography>
        </Flexbox>
      )}
    </Box>
  );
}

export default ChannelsReceivedMessagesFilter;
