'use client';

import { observer } from '@legendapp/state/react';
import { Alert, Box, Card, Code, Divider, Stack } from '@mantine/core';

//core
import { router$ } from '@genesyshub/core/core/Router/router';
import { downloadData, getApp } from '@genesyshub/core/core/utils';
import { window$ } from '@genesyshub/core/core/Router/window';

//apps
//import System from 'apps/System';

//ui
import { ActiveButton } from '@genesyshub/ui/components/ActiveButton';
import Button from '@genesyshub/ui/components/Button';
import InputEditor from '@genesyshub/ui/components/InputEditorCompact';

//#todo, automap apps
const apps: any[] = [];

const Recovery = observer(() => {
  const appId = router$.path.get()?.split('/').filter(Boolean);
  const appToReset = getApp(appId[0]).app;
  console.log(appToReset.get());
  const params = router$.params.get();
  const app = apps.find((app) => app.id === appId[0]);
  return (
    <>
      <Stack h={window$.innerHeight.get()} align="center" justify="center">
        <Alert w={400} title={'Danger zone'} color="orange">
          Resetting the app will overwrite your current API data with the default values. Please
          ensure you close all other pages before proceeding. If you have important data, make a
          backup first to avoid losing any information.
        </Alert>

        <Card withBorder w={400}>
          <Stack gap={10}>
            <Code>
              {appId[0]} - {appId[1]} - {JSON.stringify(params)}
            </Code>
            <Divider />
            <Button
              onClick={() => {
                downloadData(appToReset.get(), `Backup_${appId[0]}_${Date.now()}`);
              }}
            >
              Backup app data {appId[0]}
            </Button>
            <InputEditor h={300} data={appToReset.api} editable={true} language="json" />
          </Stack>
        </Card>
        <Box w={400}>
          <ActiveButton
            label={`Reset app ${appId[0]}`}
            confirmLabel="Click to proceed"
            color="red"
            onClick={async () => {
              console.log('app', app?.api.get());
              appToReset.api.delete();
              appToReset.api.set(app?.api.get());
            }}
          />
        </Box>
      </Stack>
    </>
  );
});

export default Recovery;
