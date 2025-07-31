'use client'

import { Suspense, useEffect } from 'react';
//import { useUser } from '@clerk/nextjs';
import System from '@genesyshub/core/apps/System';
import { /* auth$, */ config$, useInitClientAuth } from '@genesyshub/core/core/constants';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { router$ } from '@genesyshub/core/core/Router/router';
import { observer } from '@legendapp/state/react';
import { ComponentLoader } from '@genesyshub/core/UI/ComponentLoader';
import Client from '@genesyshub/core/UI/App';
import Example from '@/apps/example';

const SyncRouter = observer(() => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    router$.path.set(pathname);
    router$.params.set(Object.fromEntries(searchParams.entries()));
  }, [pathname, searchParams]);

  useEffect(() => {
    const path = router$.path.get();
    const query = new URLSearchParams(router$.params.get()).toString();
    const url = query ? `${path}?${query}` : path;
    if (url !== window.location.pathname + window.location.search) {
      router.replace(url, { scroll: false });
    }
  }, [router$.path, router$.params]);

  return <></>;
});

/* function useSyncUser() {
  const { user } = useUser();

  useEffect(() => {
    auth$.user.set(user);
    auth$.role.set(user?.publicMetadata?.role);
    auth$.plan.set(user?.publicMetadata?.plan);
  }, [user]);
} */

const apps = [System, Example];

export const ClientAuth = observer(({ app }: { app?: string }) => {
  config$.default.app.set('System')

  //useSyncUser();

  useInitClientAuth(apps);

  /* const noApps = getApps().apps.length === 0;

  if (noApps) {
    typeof window !== 'undefined' && window.location.reload();
    //console.warn('Path first access');
  } */

  return (
    <Suspense fallback={<ComponentLoader />}>
      <SyncRouter />
      <Client />
    </Suspense>
  );
});