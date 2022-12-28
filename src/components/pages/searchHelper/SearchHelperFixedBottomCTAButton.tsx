import { useSetRecoilState } from 'recoil';
import { Box, Button, CustomStyle, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { searchHelperPopupStateFamily } from '@recoil/searchHelper';

interface SearchHelperFixedBottomCTAButtonProps {
  onClickNext: () => void;
  onClickClose?: () => void;
  disabled?: boolean;
  showEnableSkip?: boolean;
  showEnableEdit?: boolean;
  showEnableNext?: boolean;
  customStyle?: CustomStyle;
}

function SearchHelperFixedBottomCTAButton({
  onClickNext,
  onClickClose,
  disabled = false,
  showEnableSkip = false,
  showEnableEdit = false,
  showEnableNext = false,
  customStyle
}: SearchHelperFixedBottomCTAButtonProps) {
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('break'));

  const handleClickClose = () => {
    if (onClickClose) onClickClose();

    setSearchHelperPopup(true);
  };

  return (
    <Box component="section" customStyle={{ minHeight: 96, zIndex: 1 }}>
      <ButtonGroups css={customStyle}>
        {(showEnableSkip || showEnableNext || showEnableEdit) && (
          <InfoLabel variant="body1" weight="medium">
            {showEnableSkip && '3개 중 1개만 설정하셔도 돼요'}
            {showEnableNext && '다음 단계로 넘어가실 수 있어요'}
            {showEnableEdit && '선택한 조건을 터치하면 수정할 수 있어요'}
          </InfoLabel>
        )}
        <Button
          variant={showEnableSkip ? 'outline' : 'solid'}
          size="large"
          brandColor="primary"
          fullWidth
          disabled={disabled}
          onClick={onClickNext}
        >
          {showEnableEdit && !showEnableSkip && '네, 맞아요'}
          {!showEnableEdit && showEnableSkip && '건너뛰기'}
          {!showEnableEdit && !showEnableSkip && '다음'}
        </Button>
        <StopButton variant="body2" weight="medium" onClick={handleClickClose}>
          검색집사 그만할래요.
        </StopButton>
      </ButtonGroups>
    </Box>
  );
}

const ButtonGroups = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  text-align: center;
`;

const InfoLabel = styled(Typography)`
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  margin: 0 auto 20px;
  padding: 8px 16px;
  border-radius: 16px;
  width: fit-content;
`;

const StopButton = styled(Typography)`
  margin-top: 16px;
  text-decoration: underline;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
`;

export default SearchHelperFixedBottomCTAButton;
