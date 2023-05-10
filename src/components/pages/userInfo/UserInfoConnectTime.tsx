import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { getFormattedActivatedTime } from '@utils/formats';

function UserInfoConnectTime({ dateActivated, type }: { dateActivated: string; type?: 'bg' }) {
  const getTimeForamt = getFormattedActivatedTime(dateActivated);
  const {
    theme: {
      palette: { common, primary }
    }
  } = useTheme();

  const getColor = () => {
    if (type === 'bg') {
      return common.uiBlack;
    }
    if (getTimeForamt.icon === 'time') {
      return common.ui60;
    }
    return primary.light;
  };

  return (
    <Flexbox
      alignment="center"
      customStyle={{
        margin: 'auto'
      }}
    >
      {getTimeForamt.icon === 'time' ? (
        <TimeIcon name="TimeOutlined" customStyle={{ color: getColor() }} />
      ) : (
        <DotIcon color={getColor()} />
      )}
      <Typography variant="body2" customStyle={{ color: getColor() }}>
        {getTimeForamt.text}
      </Typography>
    </Flexbox>
  );
}

const TimeIcon = styled(Icon)`
  margin-right: 2px;
  height: 14px !important;
  width: 14px;
`;

const DotIcon = styled.div<{ color: string }>`
  width: 5px;
  height: 5px;
  background: ${({ color }) => color};
  border-radius: 50%;
  margin-right: 5px;
`;

export default UserInfoConnectTime;
