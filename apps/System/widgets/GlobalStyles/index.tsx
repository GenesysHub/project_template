import { new$ } from '@genesyshub/core/core/utils';
import { observer } from '@legendapp/state/react';
import {
  Stack,
  Text,
  ActionIcon,
} from '@mantine/core';
import { IconPaint } from '@tabler/icons-react';

const GlobalStyles = observer(() => {
  return (
    <Stack p={10} gap={4}>
      <ActionIcon
        variant="transparent"
        color="gray"
        onClick={() => {
          new$({
            type: 'window',
            custom_key: 'editor_bar',
            appId: 'builder',
            widgetId: 'editor',
          });
        }}
      >
        <IconPaint size={'1.1rem'} stroke={1} />
      </ActionIcon>

      <Text>#TODO</Text>
      <Text size='xs'>- manage zone (create new custom zone), change style, clone zone (custom layouting from 0)</Text>
      <Text size='xs'>- fix rules of zones</Text>
      <Text size='xs'>- put this bar in the right click?</Text>
    </Stack>
  );
});

export default GlobalStyles;
