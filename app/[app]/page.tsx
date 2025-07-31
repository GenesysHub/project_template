import { ComponentLoader } from '@genesyshub/core/UI/ComponentLoader';
import { Suspense } from 'react';
import { ClientAuth } from '@/app/components/ClientSync';

export default async function AppPage(props: { params: Promise<{ app: string }> }) {
  const { app } = await props.params;

  return (
    <Suspense fallback={<ComponentLoader />}>
      <ClientAuth app={app} />
    </Suspense>
  );
}
