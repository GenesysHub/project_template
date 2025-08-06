'use client';

import { observer } from '@legendapp/state/react';
import {
  Stack,
  ActionIcon,
  Group,
  Select,
  Card,
  Badge,
  Space,
  Button,
  ScrollAreaAutosize,
  PopoverTarget,
  PopoverDropdown,
  Popover,
  Text,
} from '@mantine/core';
import {
  IconDatabase,
  IconLayout,
  IconLayoutNavbarFilled,
  IconLayoutSidebar,
  IconPlus,
  IconTemplate,
  IconTool,
  IconTools,
} from '@tabler/icons-react';
import { useState } from 'react';
import { observable } from '@legendapp/state';
import { Carousel } from '@mantine/carousel';
import DiagramDeno from './Plugins/DiagramDeno/components';
import DiagramWidget from './Plugins/DiagramWidget/components';
import { DiagramNote } from './Plugins/DiagramNote/components';
import { DiagramSchema } from './Plugins/DiagramSchema/components';
import { DiagramDocument } from './Plugins/DiagramDocument/components';
import { DiagramTool } from './Plugins/DiagramTool/components';
import { DiagramObject } from './Plugins/DiagramObject/components';
import { DiagramBuilder } from './Plugins/DiagramBuilder/components';
import { DiagramPreset } from './Plugins/DiagramPreset/components';
import DiagramLayout from './Plugins/DiagramLayout/components';

import { DiagramDefault } from '@genesyshub/core/ui/components/Diagrams';
import {
  getColorHover,
  resolveDiagramTypeColor,
} from '@genesyshub/core/ui/components/Diagrams/Connectors/connectors';
import { createDiagramItem } from '@genesyshub/core/ui/components/Diagrams/utils';
//import { desktops$ } from '@genesyshub/ui/components/Draggable';
import Icon from '@genesyshub/core/ui/components/Menu/DynamicIcon';

import { api$, stepper$, getLayout } from '@genesyshub/core/core/layout';
import { window$ } from '@genesyshub/core/core/Router/window';
import { runTools } from '@genesyshub/core/core/Tools';
import { getStatus, getApp, Widget } from '@genesyshub/core/core/utils';


const flattenObject = (obj: any, parentKey = ''): Record<string, string> => {
  const result: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  });

  return result;
};

const diagramVariants$ = observable<string[]>([
  'layout',
  'preset',
  'widget',
  'api',
  'note',
  'schema',
  'document',
  'tool',
  'object',
  'builder',
  'agent',
  'styles',
]);

export const DiagramItem = observer((props) => {
  const api = api$[props.id];

  return (
    <Stack gap={0} p={0} m={0}>
      <Space h={30} />
      {api.config.variant.get() === 'layout' && <DiagramLayout {...props} />}
      {api.config.variant.get() === 'preset' && <DiagramPreset {...props} />}
      {api.config.variant.get() === 'tool' && <DiagramTool {...props} />}
      {api.config.variant.get() === 'widget' && <DiagramWidget {...props} />}
      {api.config.variant.get() === 'api' && <DiagramDeno {...props} />}
      {api.config.variant.get() === 'note' && <DiagramNote {...props} />}
      {api.config.variant.get() === 'schema' && <DiagramSchema {...props} />}
      {api.config.variant.get() === 'document' && <DiagramDocument {...props} />}
      {api.config.variant.get() === 'object' && <DiagramObject {...props} />}

      {api.config.variant.get() === 'builder' && <DiagramBuilder {...props} />}
      {/* {api.config.variant.get() === 'agent' && (
        <Widget id={'Agents'} widget={'agent_page'} config={props} />
      )} */}
      {!api.config.variant.get() && <DiagramDefault {...props} />}
      <Space h={6} />
    </Stack>
  );
});

export const DiagramCompact = observer((props) => {
  const api = api$[props.id];
  const isLoading = stepper$[props.id].loading.get() || {};
  //@ts-ignore
  const loadingIndex = Object.values(isLoading).findIndex((status: boolean) => status === true);
  const isAnyLoading = loadingIndex !== -1;

  const variant = api.config.variant.get();
  const status = getStatus(props.id);

  const color = getColorHover(props.id);
  return (
    <Stack
      h={status.size.h.get()}
      className={'drag'}
      justify="center"
      align="center"
      onDoubleClick={() => {
        getLayout(props.id).type.set('diagram');
      }}
      pt={7}
      bg={isAnyLoading ? resolveDiagramTypeColor(api.config.variant.get()) : 'transparent'}
    >
      <Popover offset={10}>
        <PopoverTarget>
          <div>
            {variant === 'schema' && (
              <>
                {/* <Text size='xs' c={color}>{props.id}</Text> */}
                <Icon color={color} icon={api.values.icon.get()} />
              </>
            )}
            {variant === 'tool' && (
              <>
                <IconTool />
              </>
            )}
            {variant === 'widget' && (
              <>
                {(api.widget.type.get() === 'left' || api.widget.type.get() === 'sidebar') && (
                  <IconLayoutSidebar color={color} size={'1rem'} stroke={1} />
                )}
                {(api.widget.type.get() === 'right' ||
                  api.widget.type.get() === 'content' ||
                  api.widget.type.get() === 'grid') && (
                  <IconLayout color={color} size={'1rem'} stroke={1} />
                )}
                {(api.widget.type.get() === 'menu' || api.widget.type.get()?.startsWith('bar')) && (
                  <IconLayoutNavbarFilled color={color} size={'1rem'} stroke={1} />
                )}
              </>
            )}
            {variant === 'preset' && (
              <>
                <IconTools />
              </>
            )}
            {variant === 'object' && (
              <>
                <IconDatabase />
              </>
            )}
            {variant === 'builder' && (
              <>
                <IconTemplate />
              </>
            )}
          </div>
        </PopoverTarget>
        <PopoverDropdown>
          <Stack>
            {/* <Text>
              {key} {variant}
            </Text> */}

            {variant === 'schema' && (
              <>
                <Group>
                  <Text>{api.key.get()}</Text>
                  {api.status.widget.name.get()}
                  <Badge>{api.values.type.get()}</Badge>
                </Group>
              </>
            )}

            {variant === 'tool' && (
              <>
                <Badge>{api.tools[0].tool.get()}</Badge>{' '}
                <Button onClick={() => runTools(props.id)} size="xs">
                  Run
                </Button>
              </>
            )}

            {variant === 'widget' && <>This is the popover of widgets</>}
          </Stack>
        </PopoverDropdown>
      </Popover>
    </Stack>
  );
});

export function deleteDiagramItem(id: string) {
  const bar$ = getLayout(id);
  const diagrams = getApp(bar$.widget.appId.get()).app.api.diagrams;
  //delete parents
  Object.values(api$).forEach((api) => {
    const currentInputs = api.inputs.get();
    if (currentInputs?.includes(id)) {
      const updatedInputs = currentInputs.filter((inputId: string) => inputId !== id);
      api.inputs.set(updatedInputs); // Update the inputs using the observable setter
    }
  });

  //delete item from mapped diagrams
  diagrams.list[diagrams.default.get()].find((item: any) => item.key.get() === id)?.delete();
}

export const CreateDiagramItem = observer(() => {
  const [newDiagramType, setNewDiagramType] = useState<any>(undefined);
  return (
    <Select
      placeholder="New"
      variant="transparent"
      key={newDiagramType}
      clearable
      onClear={() => setNewDiagramType(undefined)}
      w={100}
      size="xs"
      data={diagramVariants$.get()}
      value={newDiagramType}
      onChange={setNewDiagramType}
      leftSection={
        <ActionIcon
          variant="transparent"
          color="gray"
          size={'sm'}
          onClick={() =>
            createDiagramItem({
              name: `Diagram ${newDiagramType}`,
              config: { variant: newDiagramType },
            })
          }
        >
          <IconPlus size={'1rem'} stroke={1} />
        </ActionIcon>
      }
    />
  );
});

export const DesktopCard = observer(({ desktop }: { desktop: string }) => {
  //desktop is deprecated
  const desktop$ = observable<any>()/* desktops$.list[desktop] */;
  return (
    <>
      <Carousel
        w={window$.innerWidth.get()}
        slideSize="20%"
        slideGap="xl"
        loop
        align="center"
        withControls={false}
        dragFree
      >
        {desktop$.apps.map((id: any) => {
          return (
            <Carousel.Slide>
              <Card w={300}>
                <div
                  style={{
                    width: '100%', // Keep the original width
                    height: '100%', // Keep the original height
                    overflow: 'hidden', // Hide any overflow from the scaled content
                  }}
                >
                  <div
                    style={{
                      transform: 'scale(0.5)', // Scale down the content
                      transformOrigin: 'top left', // Scale from the top-left corner
                      width: '200%', // Double the width to counteract scaling
                      height: 300, // Double the height to counteract scaling
                    }}
                  >
                    <ScrollAreaAutosize h={600}>
                      <Widget id={id.get()} widget={'app'} />
                    </ScrollAreaAutosize>
                  </div>
                </div>
              </Card>
            </Carousel.Slide>
          );
        })}
      </Carousel>
    </>
  );
});
