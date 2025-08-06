import { observer } from '@legendapp/state/react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
} from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

import { InputProperties } from '@genesyshub/core/ui/components/InputProperties';
import { getDataFromPathRecursive } from '@genesyshub/core/core/getData';

import { api$, stepper$ } from '@genesyshub/core/core/layout';
import { presets$, getTriggerToolIdFromIds, getTool, runTools } from '@genesyshub/core/core/Tools';
import { getType, downloadData, getStatus, formatDate } from '@genesyshub/core/core/utils';

/* TODO MIGRATE ALSO CRON, DOWNLOAD AND DELETE */

export const ObjectData = ({ objects, fileName }: { objects: string[]; fileName?: string }) => {
  const objectsIds = Object.values(objects || {})
    .filter((layout: any) => api$[layout.key.get()].config.variant.get() === 'object')
    .map((item: any) => item.key.get());

  const objectsDb = objectsIds.map((id: string) => api$[id].database);

  const allObjectsData = objectsDb.flatMap((item: any) => {
    return Object.entries(item || {}).map(([key, value]: any) => {
      const data = getDataFromPathRecursive(value.get());
      return {
        key,
        value: data?.get() ? data : value,
        source: item,
      };
    });
  });

  if (allObjectsData.length === 0) return null;

  return (
    <Stack onClick={(e) => e.stopPropagation()}>
      <Text size="sm">Data</Text>
      <Text size="xs" c={'dimmed'}>
        Output object values obtained from objects diagram in this preset
      </Text>

      {objectsDb.map((sourceItem: any, sourceIndex: any) => {
        // Filter data for this specific source item
        const itemData = allObjectsData.filter((data: any) => data.source === sourceItem);

        if (itemData.length === 0) return null;

        return (
          <div key={`source-${sourceIndex}`}>
            <Divider label={sourceItem.get()?.name || `Object ${sourceIndex + 1}`} />
            <Text size="xs" fw={500} mt={sourceIndex > 0 ? 'md' : 0}>
              {sourceItem.get()?.name || `Object ${sourceIndex + 1}`}
            </Text>
            {itemData.map(({ key, value }: any) => {
              const type = getType(value.get());
              return (
                <div key={key}>
                  {type === 'string' ? (
                    <TextInput
                      label={key}
                      size="xs"
                      value={value.get()}
                      onChange={(e) => value.set(e.currentTarget.value)}
                      rightSection={
                        <ActionIcon
                          onClick={() =>
                            downloadData(
                              value.get(),
                              `${fileName}_${key}_${formatDate(Date.now()).full}`,
                            )
                          }
                        >
                          <IconDownload size={'1rem'} stroke={1} />
                        </ActionIcon>
                      }
                    />
                  ) : (
                    <Group justify="apart">
                      <Group gap="xs">
                        <Text size="sm">{key}:</Text>
                        <Text c="dimmed" size="sm">
                          {type}
                        </Text>
                      </Group>
                      <ActionIcon
                        onClick={() =>
                          downloadData(
                            value.get(),
                            `${fileName}_${key}_${formatDate(Date.now()).simple}`,
                          )
                        }
                      >
                        <IconDownload size={'1rem'} stroke={1} />
                      </ActionIcon>
                    </Group>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </Stack>
  );
};
export function getUnlinkedPropsFromPreset(defaultPreset: any) {
  const presets = presets$;
  const preset = presets[defaultPreset];

  const unlinkedProps: {
    toolKey: string;
    paramKey: string;
    paramValue: any;
  }[] = [];

  const layoutTools = preset.layouts;

  layoutTools.forEach((tool: any) => {
    if (tool.key.get() === defaultPreset) return;

    const toolKey = tool.key.get();
    const toolApi = api$[toolKey];
    const tool$ = toolApi?.tools?.[0];

    if (!tool$) return;

    const props = tool$.props;

    Object.entries(props || {}).forEach(([paramKey, paramValue]: [string, any]) => {
      const rawValue = paramValue.get();

      // Try resolving it from the API context
      const resolved = getDataFromPathRecursive(rawValue)?.get();

      // If resolved exists (is truthy), it means it's linked — skip it
      const isLinked = !!resolved; //resolved !== undefined && resolved !== null;

      if (!isLinked) {
        unlinkedProps.push({
          toolKey,
          paramKey,
          paramValue,
        });
      }
    });
  });

  return unlinkedProps;
}

/* export function getUnlinkedPropsFromPreset(defaultPreset: any) {
  const presets = presets$;
  const preset = presets[defaultPreset];

  const unlinkedProps: {
    toolKey: string;
    paramKey: string;
    paramValue: any;
  }[] = [];

  console.log('uhbyasd', preset.get());

  preset.layouts.forEach((tool: any) => {
    if (tool.key.get() === defaultPreset) return;
    const toolKey = tool.key.get();
    const toolApi = api$[toolKey];
    const tool$ = toolApi?.tools?.[0];

    if (!tool$) return;

    const props = tool$.props;

    Object.entries(props || {}).forEach(([paramKey, paramValue]: any) => {
      const resolved = getDataFromPathRecursive(paramValue.get(), api$).get();
      const isLinked = !!resolved;

      if (!isLinked) {
        console.log('9u8yi0asd', { paramKey, paramValue: !!paramValue.get(), resolved, isLinked });
        unlinkedProps.push({
          toolKey,
          paramKey,
          paramValue,
        });
      }
    });
  });

  return unlinkedProps;
} */

const ToolData = observer((props /* { preset }: { preset: any } */) => {
  const api = api$[props.id];
  const status = getStatus(props.id);
  const defaultPreset = api.preset;

  const presets = presets$;
  const preset = presets[defaultPreset.get()];

  const triggerToolId = getTriggerToolIdFromIds(preset.layouts.map((tool: any) => tool.key.get()));

  const tools = preset.layouts.filter((tool: any) => {
    const type = api$[tool.key.get()]?.config.variant.get();
    return type === 'tool';
  });

  const anyLoading = preset.layouts.some((tool: any) => {
    return stepper$[tool.key.get()]?.loading[0].get() === true;
  });

  const activeIndex = tools.findIndex((tool: any) => {
    const key = tool.key.get();
    return stepper$[key]?.loading[0].get() === true;
  });

  const unlinkedProps = getUnlinkedPropsFromPreset(defaultPreset.get());
  const values = api.values;
  return (
    <>
      <Stepper active={activeIndex} /* orientation="vertical" */ iconSize={24} size="xs">
        {tools.map((tool: any, index: number) => {
          const key = tool.key.get();
          const processing = stepper$[key]?.loading[0].get();
          const toolApi = api$[key];
          const tool$ = toolApi.tools[0];

          const toolDefaultData = getTool(tool$.tool.get())?.parameters.properties;

          return <Stepper.Step key={key} label={tool$.tool.get()} loading={processing} />;
        })}
      </Stepper>

      <Alert color="orange" mt={20}>
        <Text size="xs">
          All not linked params should be displayed here, even if undefined, or if the link source
          is from the preset;
        </Text>
      </Alert>
      <Card withBorder p={0} mt={20}>
        {unlinkedProps.map((prop, index) => {
          const tool$ = api$[prop.toolKey].tools[0];
          const tool = getTool(tool$.tool.get());
          const key = prop.paramKey;
          const param = tool?.parameters.properties[key];

          return (
            <div key={key}>
              {index !== 0 && <Divider />}
              <InputProperties
                properties={{
                  id: props.id,
                  index: index,
                  param: param,
                  paramKey: prop.paramKey,
                  value: tool$.props[prop.paramKey],
                }}
                p={6}
                leftSection={
                  <Checkbox
                    ml={6}
                    onChange={(e) =>
                      e.currentTarget.checked
                        ? values[prop.paramKey].set(tool$.props[prop.paramKey])
                        : values[prop.paramKey].delete()
                    }
                  />
                }
              />
            </div>
          );
        })}
      </Card>
      <Text ta={'center'} c={'dimmed'} size="xs">
        *Unlinked parameters are manually entered (hardcoded) values and can be edited directly
        here. Linked parameters are auto-filled and updated through the data routing system.
      </Text>
      <Button
        mt={20}
        loading={anyLoading}
        fullWidth
        disabled={!triggerToolId}
        onClick={async () => {
          if (!triggerToolId) return;
          await runTools(triggerToolId);
          api.response.set(api$[triggerToolId].response[0][0].result);
        }}
      >
        Run preset
      </Button>
    </>
  );
});

export const DiagramPreset = observer((props) => {
  const api = api$[props.id];
  //const values = api.values;
  const status = getStatus(props.id);

  const defaultPreset = api.preset;
  const h = status.size.h.get() - 6;

  const presets = presets$;
  const preset = presets[defaultPreset.get()];

  const unlinkedProps = getUnlinkedPropsFromPreset(defaultPreset.get());

  console.log('Preset data:', api.get(), preset.get(), unlinkedProps);

  const layouts = preset?.layouts || [];
  const layoutMatch = layouts.some((layout: any) => layout.key.get() === props.id);

  return (
    <Stack h={h - 40} justify={defaultPreset.get() ? undefined : 'center'}>
      {!defaultPreset.get() && (
        <Stack align="center">
          <Text size="lg">Presets</Text>
          <Text size="xs">Learn more about presets...</Text>
        </Stack>
      )}
      <Select
        clearable
        p={defaultPreset.get() ? 10 : 20}
        size={defaultPreset.get() ? 'xs' : 'sm'}
        placeholder="Select preset"
        value={defaultPreset.get()}
        data={Object.keys(presets || {})}
        onChange={(e) => defaultPreset.set(e)}
      />
      {layoutMatch && (
        <Alert p={6} mx={10} color={'red'}>
          <Text ta={'center'} size="xs">
            You can't auto call this preset, this will create a loop.
          </Text>
        </Alert>
      )}
      {!layoutMatch && !defaultPreset.get() && (
        <>
          <Text size="xs" ta={'center'}>
            Examples #TODO
          </Text>
          <SimpleGrid cols={2} p={20}>
            <Card h={100} withBorder></Card>
            <Card h={100} withBorder></Card>
            <Card h={100} withBorder></Card>
            <Card h={100} withBorder></Card>
          </SimpleGrid>
        </>
      )}
      {!layoutMatch && defaultPreset.get() && (
        <Card mb="md" p={10}>
          <ToolData {...props} />
        </Card>
      )}
    </Stack>
  );
});
