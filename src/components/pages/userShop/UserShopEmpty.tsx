import { useRouter } from 'next/router';
import { Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';

function UserShopEmpty() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    router.push('/camelSeller');
  };

  return (
    <Flexbox
      alignment="center"
      direction="vertical"
      customStyle={{ marginTop: 80, textAlign: 'center' }}
      gap={8}
    >
      {router.query?.tab === '0' || !router.query?.tab ? (
        <>
          <Typography variant="h3" weight="bold">
            판매중인 매물이 없어요.
          </Typography>
          <Typography variant="h4">카멜에서 내 명품을 등록하고 판매해보세요!</Typography>
          <Button
            variant="contained"
            customStyle={{ marginTop: 20, color: common.cmn20 }}
            onClick={handleClick}
          >
            매물 등록하기
          </Button>
        </>
      ) : (
        <Typography variant="h3" weight="bold">
          판매완료된 매물이 없어요.
        </Typography>
      )}
    </Flexbox>
  );
}

export default UserShopEmpty;
