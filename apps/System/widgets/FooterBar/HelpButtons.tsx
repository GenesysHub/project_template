'use client';

import { observer } from '@legendapp/state/react';
import { ActionIcon, Popover, PopoverDropdown, PopoverTarget } from '@mantine/core';
import { IconPaint, IconSettings, IconTournament } from '@tabler/icons-react';
import { observable } from '@legendapp/state';
import { useEffect } from 'react';
import Recorder from './Recorder';

import { getLayout, stepper$ } from '@genesyshub/core/core/layout';
import { presets$ } from '@genesyshub/core/core/Tools';
import { Widget, getApp } from '@genesyshub/core/core/utils';

const stylesPopover$ = observable<any>({ presets: { opened: false } });
const StylesPopover = observer(() => {
  const showPophover = stylesPopover$.chats.opened;
  return (
    <Popover
      closeOnClickOutside={true}
      onClose={() => showPophover.set(false)}
      opened={showPophover.get()}
      trapFocus
      position="right-start"
      offset={{ mainAxis: 10, crossAxis: 0 }}
    >
      <Popover.Target>
        <ActionIcon onClick={() => showPophover.set(!showPophover.get())}>
          <IconPaint size={'1.1rem'} stroke={1} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown m={0} p={0} pos={'absolute'} w={300}>
        <Widget id="System" widget="globalStyles" />
      </Popover.Dropdown>
    </Popover>
  );
});

const settingsPopover$ = observable<any>({ presets: { opened: false } });
const SettingsPopover = observer(() => {
  const showPophover = settingsPopover$.chats.opened;
  return (
    <Popover
      closeOnClickOutside={true}
      onClose={() => showPophover.set(false)}
      opened={showPophover.get()}
      trapFocus
      position="right-start"
      offset={{ mainAxis: 10, crossAxis: 0 }}
    >
      <Popover.Target>
        <ActionIcon onClick={() => showPophover.set(!showPophover.get())}>
          <IconSettings size={'1.1rem'} stroke={1} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown m={0} p={0} pos={'absolute'} w={300}>
        <Widget id="System" widget="globalSettings" />
      </Popover.Dropdown>
    </Popover>
  );
});

const diagramManager$ = observable<any>({ presets: { opened: false } });
const DiagramPopover = observer((props) => {
  //Test import api app into UI components
  if (!getApp('System').app.id.get()) {
    alert('Missing System app!');
  }
  const { toolSidebar$ } = getApp('System').app.api;

  const diagrams = getLayout()
    .filter((layout: any) => layout.type.get()?.startsWith('diagram'))
    .map((item: any) => item.get());
  const showPophover = diagramManager$.presets.opened;
  const defaultPreset = toolSidebar$.defaultPreset;
  const projects = Object.values(presets$ || {});
  const allIds = projects.flatMap((project: any) =>
    project.layouts.flatMap((layout: any) => layout.key.get()),
  );

  const isLoading = allIds.some((id) => {
    const stepper = stepper$[id].get();
    if (!stepper || !stepper.loading) return false; // Skip if invalid

    // If `loading` is an array or object with numeric keys
    const loadingStates = Object.values(stepper.loading);
    return loadingStates.some((state) => state === true);
  });

  return (
    <>
      <Popover
        closeOnClickOutside={true}
        onClose={() => showPophover.set(false)}
        opened={showPophover.get()}
        trapFocus
        position="right-start"
        offset={{ mainAxis: 10, crossAxis: 0 }}
      >
        <PopoverTarget>
          <ActionIcon loading={isLoading} onClick={() => showPophover.set(!showPophover.get())}>
            <IconTournament
              size="1rem"
              stroke={diagrams.length !== 0 && defaultPreset.get() ? 2 : 1}
            />
          </ActionIcon>
        </PopoverTarget>
        <PopoverDropdown m={0} p={0} pos={'absolute'} w={300}>
          {/* <ToolSidebar /> */}
          <Widget id="System" widget="toolsManager" />
        </PopoverDropdown>
      </Popover>
    </>
  );
});

function handleOpenedPopover() {
  const settings = settingsPopover$.chats.opened;
  const diagrams = diagramManager$.presets.opened;

  useEffect(() => {
    if (settings.get()) {
      diagrams.set(false);
    }
  }, [settings.get()]);

  useEffect(() => {
    if (diagrams.get()) {
      settings.set(false);
    }
  }, [diagrams.get()]);
}

const HelpButtons = observer((props) => {
  const children = (
    <>
      <StylesPopover />
      <Recorder />
      <SettingsPopover {...props} />
      <DiagramPopover {...props} />
    </>
  );

  handleOpenedPopover();

  return children;
});

export default HelpButtons;
