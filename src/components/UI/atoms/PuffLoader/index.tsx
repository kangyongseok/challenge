import { Box, FistRound, SecondRound, Wrapper } from './PuffLoadet.styles';

function PuffLoader() {
  return (
    <Wrapper justifyContent="center" alignment="center">
      <Box>
        <FistRound />
        <SecondRound />
      </Box>
    </Wrapper>
  );
}

export default PuffLoader;
