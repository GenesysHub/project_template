import { Suspense } from 'react';
import { ClientAuth } from '../components/ClientSync';

//ui
import { ComponentLoader } from '@genesyshub/core/ui/components/ComponentLoader';

export default async function AppPage(props: { params: Promise<{ app: string }> }) {
  const { app } = await props.params;

  return (
    <Suspense fallback={<ComponentLoader />}>
      <ClientAuth app={app} />
    </Suspense>
  );
}
