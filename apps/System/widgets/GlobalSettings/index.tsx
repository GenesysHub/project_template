import { config$ } from '@genesyshub/core/core/constants';
import { observer } from '@legendapp/state/react';
import {
  useMantineColorScheme,
  Stack,
  Group,
  Checkbox,
  Text,
  Divider,
  Slider,
} from '@mantine/core';
import { IconMoonStars } from '@tabler/icons-react';
//import { useClerk } from '@clerk/nextjs';

const GlobalSettings = observer(() => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  //const { signOut } = useClerk();

  return (
    <Stack p={10} gap={4}>
      <Text size="md">Global settings</Text>
      <Group justify="space-between">
        <Text size="sm">Dark theme</Text>
        <Checkbox
          icon={IconMoonStars}
          checked={colorScheme === 'dark'}
          onChange={toggleColorScheme /* theme$.set */}
        />
      </Group>
      {/* <Group justify="space-between">
        <Text size="sm">Firewall</Text>
        <Checkbox
          checked={firewall$.disabled.get()}
          onChange={(event) => {
            firewall$.disabled.set(event.currentTarget.checked);
            window.location.reload();
          }}
        />
      </Group> */}

      <Slider
        color="blue"
        value={config$.settings.transition.get()}
        onChange={(e: any) => config$.settings.transition.set(e)}
        min={0}
        step={0.1}
        max={1}
        label={'Transition time'}
      />

      <Divider label={'Default modes'} />

      {Object.entries(config$.settings.mode).map(([key, mode]: any) => {
        return (
          <Group justify="space-between" key={key}>
            <Text size="sm">{key.charAt(0).toUpperCase() + key.slice(1)} mode</Text>
            <Checkbox
              checked={mode.get()}
              onChange={(event) => {
                mode.set(event.currentTarget.checked);
              }}
            />
          </Group>
        );
      })}

      {/* <Divider />
      <SplashCursorEditor /> */}
      {/* <Divider /> */}

      {/* <Group justify="space-between">
        <Text size="sm">Disconnect</Text>
        <ActionIcon variant="light" color="red" onClick={() => signOut()}>
          <IconPower size="1.1rem" />
        </ActionIcon>
      </Group> */}
    </Stack>
  );
});

export default GlobalSettings;
