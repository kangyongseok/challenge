import { useRouter } from 'next/router';
import { Flexbox, Typography } from 'mrcamel-ui';

function UserShopEmpty() {
  const router = useRouter();

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
