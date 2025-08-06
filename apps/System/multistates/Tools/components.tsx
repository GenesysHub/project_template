'use client';

import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import {
  IconCalendar,
  IconClearAll,
  IconDatabase,
  IconDeviceFloppy,
  IconDownload,
  IconPlayerPlay,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
import { CreateDiagramItem } from '../Diagram/components';
import { ObjectData } from '../Diagram/Plugins/DiagramPreset/components';
import { syncObservable } from '@legendapp/state/sync';

import { createDiagramItem } from '@genesyshub/core/ui/components/Diagrams/utils';
import Divider from '@genesyshub/core/ui/components/Divider';

import { getLayout, api$, stepper$ } from '@genesyshub/core/core/layout';
import { router$ } from '@genesyshub/core/core/Router/router';
import { presets$, handleImportPreset, getTriggerToolIdFromIds, runTools, handleDownloadPreset } from '@genesyshub/core/core/Tools';
import { getStatus, selectedBackground, getApps } from '@genesyshub/core/core/utils';

/* CHECK THIS STORAGE PERSISTANCE */

export const toolSidebar$ = observable<any>();
syncObservable(toolSidebar$, { persist: { name: 'toolSidebar$' } });

export const handleSelectPreset = (key: string) => {
  const defaultPreset = toolSidebar$.defaultPreset;
  const defaultLayout = getLayout()
    .filter((layout: any) => !layout.type.get()?.startsWith('diagram'))
    .map((item: any) => item.get());
  if (defaultPreset.get() === key) {
    defaultPreset.set(undefined);
    getLayout().set(defaultLayout);
  } else {
    const nonDiagramLayouts = getLayout()
      .filter((layout: any) => !layout.type.get()?.startsWith('diagram'))
      .map((layout: any) => layout.get());

    getLayout().set(nonDiagramLayouts);

    defaultPreset.set(key);
    const preset = presets$[key].get();

    if (preset?.layouts) {
      getLayout().push(...preset.layouts);
    }
  }
};

export const ToolSidebar = observer((props) => {
  const status = getStatus(props.id);
  const defaultPreset = toolSidebar$.defaultPreset;
  const appId = router$.path.get()?.replace('/', '');
  const params = router$.params.get();

  const diagrams$ = getLayout().filter((layout: any) => layout.type.get()?.startsWith('diagram'));
  const diagrams = diagrams$.map((item: any) => item.get());
  const diagrams_preset = presets$[defaultPreset.get()].layouts;

  const defaultLayout = getLayout()
    .filter((layout: any) => !layout.type.get()?.startsWith('diagram'))
    .map((item: any) => item.get());

  const projects = Object.entries(presets$ || {});

  const previousPreset = useRef(defaultPreset.get());

  /* useEffect(() => {
    const page = getApp(appId).layouts.pages.find(
      (page: any) => page.section.get() === params.section,
    );

    if (!page?.layout) return;

    const layoutKeys = new Set(page.layout.map((item: any) => item.key.get?.()));

    diagrams_preset?.forEach((diagram: any) => {
      const key = diagram.key.get?.();
      if (!key || layoutKeys.has(key)) return; // Skip if key is missing or already exists
      page.layout.push(diagram.get());
      layoutKeys.add(key); // Track key to avoid duplicates in same loop
    });
  }, [appId, params, diagrams_preset]); */

  useEffect(() => {
    if (!defaultPreset.get()) return;
    if (previousPreset.current !== defaultPreset.get()) {
      previousPreset.current = defaultPreset.get();
      return;
    }

    diagrams_preset.set(diagrams);
  }, [diagrams, defaultPreset.get()]);

  const [presetName, setPresetName] = useState<string | undefined>(undefined);

  const [newDate, setNewDate] = useState<any>();

  const handleSavePreset = () => {
    if (!presetName) return;
    presets$[presetName].set({
      layouts: diagrams,
    });

    setPresetName(undefined);
    defaultPreset.set(presetName);
  };

  return (
    <Box h={status.size.h.get()} p={6}>
      <Stack>
        <Group justify="space-between" gap={0}>
          <Group gap={4}>
            <ActionIcon onClick={() => getLayout().set(defaultLayout)}>
              <IconClearAll size={'1rem'} stroke={1} />
            </ActionIcon>
            <CreateDiagramItem />
          </Group>

          <TextInput
            size="xs"
            w={120}
            value={presetName || ''}
            onChange={(e) => setPresetName(e.currentTarget.value)}
            leftSection={
              <ActionIcon
                onClick={(e) => {
                  e.stopPropagation();
                  handleImportPreset();
                }}
              >
                <IconUpload size={'1rem'} stroke={1} />
              </ActionIcon>
            }
            rightSection={
              <ActionIcon disabled={!presetName} onClick={handleSavePreset}>
                <IconDeviceFloppy size={'1rem'} stroke={1} />
              </ActionIcon>
            }
          />
        </Group>
        <Divider />

        {projects.map(([presetKey, presetData]: any) => {
          //if (!presetKey || presetKey === 'undefined') return
          const tools = Object.values(presetData.layouts || {}).filter(
            (layout: any) =>
              api$[layout.key.get()].config.variant.get() === 'tool' ||
              api$[layout.key.get()].config.variant.get() === 'preset',
          );

          const loading = stepper$[presetKey]?.loading[0]; //toolSidebar$.layouts.layouts[presetKey]?.loading || observable(false);

          const selected = defaultPreset.get() === presetKey;
          const bg = selectedBackground(selected);

          //console.log('testpresetundefined 02', presetKey);
          return (
            <Card key={presetKey} bg={bg} onClick={() => handleSelectPreset(presetKey)}>
              <Group justify="space-between">
                <Group gap={4}>
                  <ActionIcon
                    loading={loading.get()}
                    disabled={tools.length === 0}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const triggerToolid = getTriggerToolIdFromIds(
                        tools.map((tool: any) => tool.key.get()),
                      );
                      triggerToolid && (await runTools(triggerToolid));
                    }}
                  >
                    <IconPlayerPlay size={'1rem'} stroke={1} />
                  </ActionIcon>
                  <Text size="sm">{presetKey}</Text>
                  <Badge size="xs">{presetData.layouts?.length || 0}</Badge>
                </Group>

                <Group gap={0}>
                  <ActionIcon onClick={(e) => e.stopPropagation()}>
                    <Popover position="right">
                      <PopoverTarget>
                        <IconDatabase size={'1rem'} stroke={1} />
                      </PopoverTarget>
                      <PopoverDropdown w={400} p={4}>
                        <ObjectData objects={presetData.layouts} fileName={presetKey} />
                      </PopoverDropdown>
                    </Popover>
                  </ActionIcon>

                  {tools.length !== 0 && (
                    <ActionIcon onClick={(e) => e.stopPropagation()}>
                      <Popover position="right">
                        <PopoverTarget>
                          <IconCalendar size={'1rem'} stroke={1} />
                        </PopoverTarget>
                        <PopoverDropdown w={400}>
                          <Stack onClick={(e) => e.stopPropagation()}>
                            <TimeInput
                              onChange={(e) => setNewDate(e.currentTarget.value)}
                              size="xs"
                              label="New cron"
                              description="Create new cron event, this will be triggered every day at selected times."
                            />
                            <Button
                              fullWidth
                              disabled={!newDate}
                              size={'xs'}
                              onClick={() => presets$[presetKey].crons.push(newDate)}
                            >
                              Set cron at {newDate}
                            </Button>
                            <Divider label={'Crons'} />

                            {(presetData.crons || []).map((cron: any, index: number) => (
                              <TimeInput
                                key={index}
                                onChange={(e) => cron.set(e.currentTarget.value)}
                                value={cron.get()}
                                size="xs"
                                rightSection={
                                  <ActionIcon onClick={() => cron.delete()}>
                                    <IconTrash size={'1rem'} stroke={1} />
                                  </ActionIcon>
                                }
                              />
                            ))}
                          </Stack>
                        </PopoverDropdown>
                      </Popover>
                    </ActionIcon>
                  )}
                  {/* <ActionIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      presets$[presetKey].layouts.set(diagrams);
                    }}
                  >
                    <IconDeviceFloppy size={'1rem'} stroke={1} />
                  </ActionIcon> */}
                  <ActionIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPreset(presetKey);
                    }}
                  >
                    <IconDownload size={'1rem'} stroke={1} />
                  </ActionIcon>
                  <ActionIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      presets$[presetKey].delete();
                    }}
                  >
                    <IconTrash size={'1rem'} stroke={1} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
});

//const Preset

export const ToolsPage = observer((props) => {
  const status = getStatus(props.id);
  const tools = getApps().tools;

  return (
    <Box h={status.size.h.get()} p={6} pt={0}>
      <SimpleGrid cols={3}>
        {tools.map((tool: any) => {
          //console.log('aiusdklasd', tool.get());

          const app = { name: 'app name' };
          return (
            <Card>
              <Group justify="space-between">
                <Stack>
                  <Group gap={4}>
                    <ActionIcon
                      onClick={() => {
                        const newid = `${tool.name.get()}_${nanoid(6)}`;
                        createDiagramItem({
                          id: newid,
                          config: { variant: 'tool' },
                        });
                        api$[newid].tools.push({
                          tool: tool.name,
                          props: tool.args,
                        });
                        console.log('iuaghsdljkasd', api$[newid].tools.get());
                      }}
                    >
                      <IconPlayerPlay size={'1rem'} stroke={1} />
                    </ActionIcon>
                    <Text size="sm">{tool.name.get()}</Text>
                  </Group>
                  <Text c={'dimmed'} size="xs">
                    {tool.description.get()}
                  </Text>
                  <Group>
                    <Badge>{app.name}</Badge>
                  </Group>
                </Stack>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    </Box>
  );
});
