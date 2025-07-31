import { ComponentLoader } from '@genesyshub/core/UI/ComponentLoader';
import { Suspense } from 'react';
import { ClientAuth } from './components/ClientSync';

export default async function Page(props: { params: Promise<{}> }) {
  return (
      <Suspense fallback={<ComponentLoader />}>
        <ClientAuth />
      </Suspense>
  );
}