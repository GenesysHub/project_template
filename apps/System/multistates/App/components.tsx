import { observer } from '@legendapp/state/react';
import { Code, Stack } from '@mantine/core';
import { DesktopCard } from '../Diagram/components';

import { router$ } from '@genesyshub/core/core/Router/router';
import { config$ } from '@genesyshub/core/core/constants';

export const Menu = (props: any) => {
  return <>System default menu!</>;
};

const System = observer((props) => {
  const desktop = router$.params.desktop.get();
  const config = config$.default.get();

  return (
    <>
      {desktop ? (
        <>
          {desktop}
          <DesktopCard desktop={desktop} />
        </>
      ) : (
        <>
          <Code>{JSON.stringify(config)}</Code>
        </>
      )}
    </>
  );
});

export default System;
