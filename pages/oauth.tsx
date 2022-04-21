import React from 'react';
import { GetServerSidePropsContext } from 'next';

function Oauth() {
  return <div>loading...</div>;
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  return {
    props: { query }
  };
}
export default Oauth;
