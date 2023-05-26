import { useQuery } from '@tanstack/react-query';
import { Grid } from '@mrcamelhub/camel-ui';

import { NewProductGridCard } from '@components/UI/molecules';

import { fetchContentProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';

function ButlerExhibitionProductGrid() {
  const { data: { content = [] } = {} } = useQuery(
    queryKeys.commons.contentProducts({ id: 18 }),
    () => fetchContentProducts({ id: 18 })
  );

  return (
    <Grid
      component="section"
      container
      rowGap={32}
      customStyle={{
        marginTop: 32
      }}
    >
      {content.map((product) => (
        <Grid key={`butler-exhibition-product-${product.id}`} item xs={2}>
          <NewProductGridCard product={product} hideLabel />
        </Grid>
      ))}
    </Grid>
  );
}

export default ButlerExhibitionProductGrid;
