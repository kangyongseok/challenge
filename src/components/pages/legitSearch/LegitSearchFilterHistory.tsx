import { Box, Chip, Icon } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

function LegitSearchFilterHistory() {
  return (
    <Box
      component="section"
      customStyle={{ position: 'relative', marginBottom: 8, padding: '8px 0' }}
    >
      <List>
        <Chip
          isRound={false}
          endIcon={<Icon name="CloseOutlined" width={14} height={14} color="ui80" />}
          // TODO UI 라이브러리 수정 필요
          customStyle={{
            '& > svg': {
              width: 14,
              height: 14
            }
          }}
        >
          구찌
        </Chip>
        <Chip
          isRound={false}
          endIcon={<Icon name="CloseOutlined" width={14} height={14} color="ui80" />}
          customStyle={{
            '& > svg': {
              width: 14,
              height: 14
            }
          }}
        >
          루이비통
        </Chip>
      </List>
      <ResetButton>
        <Icon name="RotateOutlined" color="ui60" />
      </ResetButton>
    </Box>
  );
}

const List = styled.section`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 6px;
  padding: 0 70px 0 20px;
  overflow-x: auto;
`;

const ResetButton = styled.div`
  position: absolute;
  top: 50%;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 32px;
  transform: translateY(-50%);
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
  cursor: pointer;
  &:before {
    content: '';
    position: absolute;
    right: 64px;
    display: block;
    width: 32px;
    height: 32px;
    background: linear-gradient(270deg, #f5f6f7 0%, rgba(245, 246, 247, 0) 100%);
  }
`;

export default LegitSearchFilterHistory;
