import { Button, Tooltip } from '@mrcamelhub/camel-ui';
import type { Color } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

interface LegitRequestBottomButtonProps {
  disabled?: boolean;
  onClick: () => void;
  text: string;
  showTooltip?: boolean;
  tooltipMessage?: string;
  backgroundColor?: Color;
}

function LegitRequestBottomButton({
  disabled = false,
  onClick,
  text,
  showTooltip = false,
  tooltipMessage = '',
  backgroundColor
}: LegitRequestBottomButtonProps) {
  return (
    <ButtonWrapper>
      <ButtonBox backgroundColor={backgroundColor}>
        <Button
          size="xlarge"
          variant="solid"
          brandColor="primary"
          fullWidth
          onClick={onClick}
          disabled={disabled}
        >
          {text}
        </Button>
        <Tooltip
          open={showTooltip}
          message={tooltipMessage}
          customStyle={{
            left: typeof window !== 'undefined' ? window.innerWidth / 2 - 20 : -20,
            top: -41
          }}
        />
      </ButtonBox>
    </ButtonWrapper>
  );
}

const ButtonWrapper = styled.section`
  position: relative;
  width: 100%;
  min-height: 92px;
`;

const ButtonBox = styled.div<{ backgroundColor?: Color }>`
  position: fixed;
  width: 100%;
  bottom: 0;
  padding: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    },
    backgroundColor
  }) => backgroundColor || common.bg02};
`;

export default LegitRequestBottomButton;
