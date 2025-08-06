import { Suspense } from 'react';
import { ClientAuth } from './components/ClientSync';

//ui
import { ComponentLoader } from '@genesyshub/core/ui/components/ComponentLoader';

export default async function Page(props: { params: Promise<{}> }) {
  return (
    <Suspense fallback={<ComponentLoader />}>
      <ClientAuth />
    </Suspense>
  );
}
