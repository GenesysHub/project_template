import { getStatus } from '@genesyshub/core/core/utils';
import { observer } from '@legendapp/state/react';
import { Center, Stack, Text } from '@mantine/core';

const App = observer((props) => {
  const status = getStatus(props.id);
  return (
    <Stack justify="center" h={status.size.h.get()}>
      <Center>
        <Text c="dimmed">Test template b</Text>
      </Center>
    </Stack>
  );
});

export default App;
