import { Flexbox, Icon } from 'mrcamel-ui';

function UserInfoStar({ maxScore, curnScore }: { maxScore: number; curnScore: number }) {
  return (
    <Flexbox alignment="center" justifyContent="center" gap={1}>
      {Array.from({ length: 5 }, (_, index) => {
        return index < (maxScore === 10 ? Math.floor(Number(curnScore) / 2) : Number(curnScore)) ? (
          <Icon name="StarFilled" width={16} height={16} color="#FFD911" />
        ) : (
          <Icon name="StarOutlined" width={16} height={16} color="#FFD911" />
        );
      })}
    </Flexbox>
  );
}

export default UserInfoStar;
