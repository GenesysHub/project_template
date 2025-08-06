import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { syncObservable } from '@legendapp/state/sync';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  MultiSelect,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  ScrollAreaAutosize,
  SegmentedControl,
  Select,
  SimpleGrid,
  Space,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconAppWindow,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconJson,
  IconPlus,
  IconProgressCheck,
  IconSettings,
  IconSkull,
  IconTerminal,
  IconTrash,
} from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';

import { getParents } from '@genesyshub/core/ui/components/Diagrams';
import { getDiagramIds, createDiagramItem } from '@genesyshub/core/ui/components/Diagrams/utils';
import { FunctionCard } from '@genesyshub/core/ui/components/InputEditor/Templates/Items/FunctionManager';
import { DataNavigator } from '@genesyshub/core/ui/components/InputEditor/Templates/Items/SourceManager';

import { getDataFromPathRecursive } from '@genesyshub/core/core/getData';
import { context$, contextV2$ } from '@genesyshub/core/ui/utils/context';

import { InputProperties } from '@genesyshub/core/ui/components/InputProperties';

import Icon from '@genesyshub/core/ui/components/Menu/DynamicIcon';
import { InputEditor } from '@genesyshub/core/ui/components/InputEditor';
import Divider from '@genesyshub/core/ui/components/Divider';
import { getSchema } from '@genesyshub/core/ui/components/DataManager/utils';

import { imports$ } from '@genesyshub/core/core/constants';
import { api$, getLayout } from '@genesyshub/core/core/layout';
import { router$ } from '@genesyshub/core/core/Router/router';
import {
  getStatus,
  getApp,
  renderComponentFromJSON,
  getWidgets,
  resolveDiagramId,
  new$,
  downloadData,
} from '@genesyshub/core/core/utils';
import { callTool } from '@genesyshub/core/core/Tools';

export const DiagramBuilder = observer((props) => {
  const status = getStatus(props.id);
  /* const type = status.type.get();
  const h = status.size.h.get(); */
  return <DiagramEditor {...props} />;
});

const DiagramEditor = observer((props) => {
  const api = api$[props.id];
  const values = api.values;
  //const parents = api.inputs.map((input: any) => api$[input.get()].get());
  const variant = api.config.builder;
  const status = getStatus(props.id);
  const h = status.size.h.get();

  return (
    <Stack>
      {
        !variant.get() ? (
          <>
            <Select
              label="Select a variant"
              placeholder="functions, component, styles, render..."
              size="xs"
              data={['functions', 'component', 'styles', 'render']}
              value={variant.get()}
              onChange={(e: any) => variant.set(e)}
            />
          </>
        ) : null
        //<Text size="sm">{variant.get()}</Text>
      }

      {variant.get() === 'functions' && (
        <>
          <Button
            size="xs"
            onClick={() => {
              console.log('asdasdasd', values.get());
            }}
          >
            Create new server (only on localhost)
          </Button>
          {/*           
          <TextInput value={diagramEditor$[props.id][variant.get()]['test'].get()} onChange={} />
           */}
          <Button size="xs" onClick={() => values.push(`console.log('Hello')`)}>
            New function
          </Button>
          <Divider label={'Test custom function'} />
          {values.map((f: any) => {
            return (
              <>
                <InputEditor h={400} language="javascript" data={f} editable={true} />
                <Button
                  size="xs"
                  onClick={() => alert('renderComponent deprecated') /* renderComponent(f.get()) */}
                >
                  Execute function
                </Button>
                <Button size="xs" color="red" onClick={() => f.delete()}>
                  Delete function
                </Button>
              </>
            );
          })}
        </>
      )}
      {variant.get() === 'component' && <DynamicObjectBuilder {...props} />}
      {variant.get() === 'styles' && (
        <>
          {values[0].get() ? (
            <InputEditor h={h - 10} language="css" data={values[0]} editable={true} />
          ) : (
            values[0].set(`body { background: yellow; }`)
          )}
        </>
      )}

      {variant.get() === 'render' && <DiagramRender {...props} />}
    </Stack>
  );
});

const DynamicObjectBuilder = observer((props: any) => {
  const api = api$[props.id];

  !api.values[0].get() && api.values[0].set({ type: 'div', props: {}, children: [] });

  return Object.values(api.values || {}).map((component: any, index: number) => {
    return <CreateComponent key={index} props={props} component={component} index={index} />;
  });
});

//push and sync value #todo, autosync first render like diagram objects
async function syncCustomWidget(props: { id: string }, appId: string, widget: any) {
  const app = getApp(appId).app;
  const key = props.id;
  console.log('ahisdjka 01', app.get(), key);
  if (!app.widgets.get()?.includes(key)) {
    app.widgets.push(key);
  }
  await app.customWidgets[key].set(widget);
}

//Refactor this
const CreateComponent = observer(({ props, component, index }: any) => {
  const api = api$[props.id];
  console.log('api.params', api.params.get());
  const components$ = contextV2$.components();

  const groups = contextV2$
    .groups()
    .map((item: any) => ({ value: item.group, label: item.group, icon: 'IconBrandMantine' }));

  const filterGroups = api.builder.filterGroups;
  if (!filterGroups.get()) {
    filterGroups.set(['OS', 'mantine', 'react', 'html']);
  }

  const componentsGroups$ = contextV2$.groups({ groups: filterGroups, type: ['component'] });

  const diagramIds = getDiagramIds();

  const parents_w = getParents(api.inputs, 'builder');

  //this is unecessary?
  /* useEffect(() => {
    component.children.set(api.inputs.map((id: any) => parents_w[id.get()]?.[0]));
  }, [parents_w]); */

  const component$ = observable(components$[component.type.get()]);

  const matchingId = diagramIds.find((input: any) =>
    api$[input].inputs.some((nestedInput: any) => nestedInput.get() === props.id),
  );

  const item = getLayout(matchingId);
  const hidden = !!item?.hidden?.get();

  const renderSelectGroups: any = ({ option, checked }: any) => (
    <Group flex="1" gap="xs">
      <Icon icon={context$.library(option.value).info.icon.get()} stroke={0.8} />
      <Text size="xs">{option.value}</Text>
      <Text size="xs" c={'dimmed'}>
        {context$.library(option.value).info.description.get()}
      </Text>

      {checked && <IconCheck size={'1rem'} stroke={1} style={{ marginInlineStart: 'auto' }} />}
    </Group>
  );

  const renderSelectOption: any = ({ option, checked }: any) => (
    <Group flex="1" gap="xs">
      {option.icon && <Icon icon={option.icon} stroke={0.8} />}
      <Text size="xs">{option.value}</Text>
      <Text size="xs" c={'dimmed'}>
        {option.data.description.get()}
      </Text>

      {checked && <IconCheck size={'1rem'} stroke={1} style={{ marginInlineStart: 'auto' }} />}
    </Group>
  );

  const parent_merged = [api.values[0]];

  const wrappable = component$.wrap.get();

  const layout = api.values[0];
  const mode = api.builder.mode;

  useEffect(() => {
    if (!mode.get()) {
      mode.set('component');
    }
  }, [mode.get()]);

  const renderComponent = renderComponentFromJSON(props, layout);
  const renderEdtior = renderLayoutEditor(props, layout);

  const widgets = getWidgets({ id: props.id });
  const widgetData = widgets.map((w) => w.peek()); // Extract values once
  console.log('iuashdas', widgetData);

  //const source = 'items';
  /* const [source, setSource] = useState<any>('items');
  const [itemIndex, setIndex] = useState<any>(0); */

  const [newKey, setNewKey] = useState<any>();
  return (
    <Stack p={6}>
      <SegmentedControl
        //disabled={!wrappable}
        value={mode.get()}
        onChange={(e) => mode.set(e)}
        data={['layout', 'component']}
      />
      <Card>{widgetData.map((item) => item.appId).join(', ')}</Card>
      {/* {Object.keys(getParents(api.inputs, 'builder') || {}).length} */}
      {Object.keys(getParents(api.inputs, 'object') || {}).length > 0 && (
        <Divider label={'testing map'} opened>
          <Text c="dimmed" size="xs" ta={'center'}>
            This is a mask object used to have dynamic content when rendering lists using this item.
            Work only with object linked to widget. Status: #TODO
          </Text>
          <>
            {Object.keys(getParents(api.inputs, 'object') || {}).map((objectId, index) => {
              const db = api$[objectId].database;
              const dbSettingsOptions = api.settings.database[objectId].options;
              const customMaps = api.settings.database[objectId].dynamic;
              const source = dbSettingsOptions.source;
              const itemIndex = dbSettingsOptions.itemIndex;
              const data = getDataFromPathRecursive(db[source.get()].get());
              const defaultItem = data;

              return (
                <Card key={objectId} withBorder>
                  <Stack key={`${objectId}_${source.get()}_${index}`}>
                    <Group justify="space-between">
                      <Badge>{resolveDiagramId(objectId) || objectId}</Badge>
                      <Group>
                        <Select
                          size="xs"
                          placeholder="data source"
                          data={Object.keys(db)}
                          value={source.get()}
                          onChange={(e) => source.set(e)}
                        />

                        {Array.isArray(data.get()) && Object.keys(data).length > 0 && (
                          <>
                            <Select
                              size="xs"
                              w={70}
                              placeholder="0"
                              data={Object.keys(data)}
                              //@ts-ignore
                              value={itemIndex.get() || 0}
                              onChange={(e) => itemIndex.set(e)}
                              leftSection={
                                <ActionIcon onClick={() => console.log(data[index].get())}>
                                  <IconTerminal size={'1rem'} stroke={1} />
                                </ActionIcon>
                              }
                            />
                          </>
                        )}

                        <Popover>
                          <PopoverTarget>
                            <ActionIcon>
                              <IconJson size={'1rem'} stroke={1} />
                            </ActionIcon>
                          </PopoverTarget>
                          <PopoverDropdown w={600}>
                            <SimpleGrid cols={2}>
                              <InputEditor h={200} data={getSchema(defaultItem)} language="json" />
                              <InputEditor
                                h={200}
                                data={defaultItem}
                                editable={true}
                                language="json"
                              />
                            </SimpleGrid>
                          </PopoverDropdown>
                        </Popover>
                      </Group>
                    </Group>
                    <Divider />

                    {source.get() && (
                      <>
                        <Group>
                          <TextInput
                            leftSection={
                              <ActionIcon onClick={() => customMaps[newKey].set('')}>
                                <IconPlus size={'1rem'} stroke={1} />
                              </ActionIcon>
                            }
                            size="xs"
                            onChange={(e) => setNewKey(e.currentTarget.value)}
                          />
                        </Group>
                        {Object.entries(customMaps).map(([key, map]: any) => {
                          const path = map.path;
                          const pathParts = path.get();
                          const updatedPathParts = [itemIndex.get(), ...pathParts.slice(1)];
                          const fixedPath = [
                            objectId,
                            'database',
                            source.get(),
                            ...updatedPathParts,
                          ];

                          return (
                            <div key={key}>
                              <Group justify="space-between">
                                <Group gap={4}>
                                  {key}
                                  {typeof data.get() === 'object' ? (
                                    <DataNavigator data={data} output={map.path} />
                                  ) : (
                                    <Badge>{data.get()}</Badge>
                                  )}
                                </Group>
                                <Group gap={4}>
                                  <Button
                                    onClick={() => {
                                      api.values[0].children[0].set(fixedPath);
                                    }}
                                    size={'xs'}
                                  >
                                    test link {key} to children[0]
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      api.values[0].params[key].set(
                                        fixedPath /* map.path.get() */,
                                        /* getDataFromPathRecursive(map.path.get(), data).get() */
                                      );
                                    }}
                                    size={'xs'}
                                  >
                                    link to {key} of this component
                                  </Button>
                                </Group>
                              </Group>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </Stack>
                </Card>
              );
            })}
          </>
          <Divider mt={50} />
        </Divider>
      )}

      {mode.get() === 'component' && (
        <>
          <Card withBorder>
            <MultiSelect
              renderOption={renderSelectGroups}
              placeholder="Filter by packages"
              clearable
              variant="transparent"
              data={groups}
              value={filterGroups.get()}
              onChange={(e: any) => filterGroups.set(e)}
              size="xs"
            />
            <Select
              renderOption={renderSelectOption}
              searchable
              leftSection={
                <Tooltip label={'Render component'}>
                  <ActionIcon
                    variant="transparent"
                    color="gray"
                    onClick={() => {
                      if (matchingId) {
                        item.hidden.set(!hidden);
                      } else {
                        const id = nanoid(6);
                        createDiagramItem({
                          id,
                          config: { variant: 'builder', builder: 'render' },
                        });
                        api$[id].inputs.push(props.id);
                      }
                    }}
                  >
                    {matchingId ? (
                      hidden ? (
                        <IconEyeOff size={'1rem'} stroke={1} />
                      ) : (
                        <IconEye size={'1rem'} stroke={1} />
                      )
                    ) : (
                      <IconAppWindow size={'1rem'} stroke={1} />
                    )}
                  </ActionIcon>
                </Tooltip>
              }
              data={componentsGroups$}
              value={component.type.get()}
              onChange={(e: any) => {
                component.type.set(e);
              }}
              size="xs"
            />

            <Space h={10} />
            {component$?.id.get() && <FunctionCard functionKey={component$.id.get()} />}
          </Card>
          <Divider label={'params'} opened>
            <>
              #todo, try to link this input value with the dynamic value set above
              <TextInput
                size="xs"
                label="default content"
                value={api.values[0].children[0].get()}
                onChange={(e) => api.values[0].children[0].set(e.currentTarget.value)}
              />
              <Divider />
              <MultiSelect
                size="xs"
                placeholder="params"
                value={api.params.get()}
                onChange={(e: any) => api.params.set(e)}
                data={Object.keys(component$?.parameters.properties || {})}
              />
              {console.log('api params', api.params.get(), component$.get())}
              {api.params.map((key: any) => {
                const param = component$?.parameters.properties[key.get()];
                if (!param) return null;

                return (
                  <Card key={key.get()} withBorder>
                    <Stack>
                      <InputProperties
                        properties={{
                          id: props.id,
                          index: index,
                          param: param,
                          paramKey: key.get(),
                          value: component.params[key.get()],
                        }}
                      />
                    </Stack>
                  </Card>
                );
              })}
              <Text size="xs" c={'dimmed'}>
                #todo create new custom param
              </Text>
            </>
          </Divider>
        </>
      )}
      {mode.get() === 'layout' && (
        <>
          <Divider label={'children'} opened>
            {/* {Object.keys(parents_w).map((key) => (
              <div key={key}>
                {Object.values(parents_w[key]).map((item: any, index: number) => (
                  <Card key={index} bg={'dark'}>
                    {item.type} ({key})
                  </Card>
                ))}
              </div>
            ))} */}
            {renderEdtior}
          </Divider>
        </>
      )}
      {/* {wrappable && (
        <Divider label={'children'} opened>
          <Alert>
            <Text size="xs">- link component id (dont push the children data)</Text>
            <Text size="xs">
              - fix undefined params (show all) <IconSettings size={'1rem'} stroke={1} />
            </Text>
            <Text size="xs">
              - improve layout logic (let stack layout + liked compoents etc...)
            </Text>
          </Alert>
          <SimpleGrid cols={3}>
            <Button
              size="xs"
              onClick={() => {
                layout.set(simpleConfig);
              }}
            >
              set simple grid test
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() => {
                layout.delete();
              }}
            >
              remove layout
            </Button>
            <Button
              size="xs"
              color="green"
              onClick={() => {
                setShowEditor(!showEditor);
              }}
            >
              {showEditor ? `hide editor` : `show editor`}
            </Button>
          </SimpleGrid>
          {Object.keys(parents_w).map((key) => (
            <div key={key}>
              {Object.values(parents_w[key]).map((item: any, index: number) => (
                <Card key={index} bg={'dark'}>
                  {item.type} ({key})
                </Card>
              ))}
            </div>
          ))}
          {showEditor ? renderEdtior : renderComponent}
        </Divider>
      )} */}
      <Divider label={'preview'} opened>
        {renderComponent}
        {/* B: (default rendering (#old, to migrate))
        <ParentComponent parent_merged={observable(parent_merged)} props={props} /> */}
      </Divider>

      {/* <Divider label={'className'}>
        <>
          {Object.entries(parents_s).map(([key, style]: any) => {
            const item = getLayout(key);

            return (
              <Card withBorder>
                <Group justify="space-between">
                  {key}
                  <Group gap={4}>
                    <ActionIcon
                      onClick={() => {
                        item.hidden.set(!item.hidden.get());
                      }}
                    >
                      {item.hidden.get() ? (
                        <IconEyeOff size={'1rem'} stroke={1} />
                      ) : (
                        <IconEye size={'1rem'} stroke={1} />
                      )}
                    </ActionIcon>
                    <ActionIcon disabled={item.hidden.get()} onClick={() => updateInputs(api, key)}>
                      <IconLinkOff size={'1rem'} stroke={1} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            );
          })}

          <Button
            size={'xs'}
            onClick={() => {
              const id = nanoid(6);
              createDiagramItem({
                id,
                config: { variant: 'builder', builder: 'styles' },
              });
              api.inputs.push(id);
            }}
          >
            add className to this component
          </Button>
        </>
      </Divider> */}
    </Stack>
  );
});

/* function ParentComponent({ parent_merged, props }: any) {
  return parent_merged.map((json: any) => renderComponentFromJSON(props, json));
} */
/*
"I need to create a dynamic JSON builder for UI components that follows this nested structure pattern. The structure represents a hierarchy of components (like 'Stack', 'SimpleGrid', 'Avatar', 'MantineButton') with children arrays, params, props, and source fields.

Key requirements:
1. The structure should be built from a simpler configuration format
2. It should support layout components like 'Stack' and 'SimpleGrid' as containers
3. Each container should be able to nest other components
4. The builder should allow adding components at any level after initial creation
5. The output must match the schema shown in the example with proper nesting, params, props, etc.
Example of desired simplified input:
- Create a 'SimpleGrid' root with cols: 2
-- Add a 'Stack' child with gap: 20
--- Add an 'Avatar' with src ['BSAF94','database','src']
--- Add a 'MantineButton'
The function should transform this into the detailed JSON structure with proper nesting."
 */

const layoutComponentKeys = ['SimpleGrid', 'Stack', 'Group', 'Card'];

function renderLayoutEditor(props: any = {}, json: any, path: number[] = []) {
  const api = api$[props.id];
  const parents_w = getParents(api.inputs, 'builder');

  const { type, params, children, source } = json;

  //const isLayoutComponent = layoutComponentKeys.includes(type.get());

  // Add new layout child
  const addLayoutChild = (childType: string) => {
    const newChild = observable({
      type: childType,
      params: {},
      children: [],
      source: [],
    });
    console.log('Newlayoutchild', newChild);
    children.push(newChild.get());
  };

  const changeLayoutType = (newType: string | null) => {
    const currentParams = params.get();
    const newParams = { ...currentParams };

    type.set(newType);
    params.set(newParams);
  };

  const components$ = contextV2$.components();
  const component$ = observable(components$[type.get()]);

  const uniqueKey = `${type.get()}_${path.join('-')}`;
  const showContent = api.layoutSettings.show[uniqueKey];
  const linkedComponent = api.layoutSettings.link[uniqueKey];

  //linkedComponent = render custom widget aka NO LAYOUT
  //show se

  return !json.get() ? (
    <>
      <Select
        w={90}
        clearable
        size="xs"
        variant="unstyled"
        placeholder="layout"
        value={type.get()}
        onChange={changeLayoutType}
        data={layoutComponentKeys}
      />
    </>
  ) : children.get() ? (
    <Card /* bg={`dark.${9 - path.length || 0}`}  */ key={uniqueKey} p={0} withBorder>
      <Group justify="space-between">
        <Group gap={0}>
          <ActionIcon onClick={() => showContent.set(!showContent.get())}>
            {showContent.get() ? (
              <IconChevronUp size={'1rem'} stroke={1} />
            ) : (
              <IconChevronDown size={'1rem'} stroke={1} />
            )}
          </ActionIcon>
          <Popover>
            <PopoverTarget>
              <ActionIcon>
                <IconSettings size={'1rem'} stroke={1} />
              </ActionIcon>
            </PopoverTarget>
            <PopoverDropdown p={0}>
              {Object.keys(component$.parameters.properties).map((key: any, index: number) => {
                const param = component$?.parameters.properties[key];
                if (!param) return null;

                return (
                  <div key={key}>
                    {index > 0 && <Divider />}
                    <InputProperties
                      properties={{
                        id: props.id,
                        index: index,
                        param: param,
                        paramKey: key,
                        value: params[key],
                      }}
                    />
                  </div>
                );
              })}
              <Button fullWidth size="xs">
                Add new custom #todo
              </Button>
            </PopoverDropdown>
          </Popover>

          <Select
            w={90}
            clearable
            size="xs"
            variant="unstyled"
            placeholder="layout"
            value={type.get()}
            onChange={changeLayoutType}
            data={layoutComponentKeys}
          />
        </Group>

        <Group gap={4}>
          <Select
            w={90}
            clearable
            size="xs"
            variant="unstyled"
            placeholder="Link"
            data={Object.keys(parents_w)}
            value={linkedComponent.get()}
            onChange={(e) => {
              //e && children.push(parents_w[e][0]);
              linkedComponent.set(e);
              console.log('ashdoiasjd', /* api.get(), */ json.get(), /* api.values[0].get(), */ e);
              e ? json.children.push(e) : json.children.delete();
              //api.values[0].children.set(e);
              //component.children.set(e)
            }}
          />
          <TextInput
            defaultValue={linkedComponent.get()}
            onChange={(e) => {
              json.children.set([e.currentTarget.value]);
              linkedComponent.set(e.currentTarget.value);
            }}
          />
          <Badge bg={'green'}>{linkedComponent.get() ? `linked component` : 'layout'}</Badge>
          {!linkedComponent.get() &&
            children.map((child: any, index: number) => (
              <Badge key={index}>{child.type.get()}</Badge>
            ))}
          <ActionIcon onClick={() => json.delete()} color="red">
            <IconTrash size={'1rem'} stroke={1} />
          </ActionIcon>
        </Group>
      </Group>

      {showContent.get() &&
        (!linkedComponent.get() ? (
          <>
            <Divider />
            <div
              style={{
                display: type.get() === 'SimpleGrid' ? 'grid' : 'flex',
                gridTemplateColumns:
                  type.get() === 'SimpleGrid'
                    ? `repeat(${params.cols.get() || 1}, 1fr)`
                    : undefined,
                flexDirection: type.get() === 'Stack' ? 'column' : undefined,
                gap: params.gap.get() ? `${params.gap.get()}px` : '8px',
                padding: '8px',
                justifyContent: params.justify?.get() || 'flex-start',
                alignItems: type.get() === 'Stack' ? params.align?.get() || 'stretch' : undefined,
              }}
            >
              {children.map((child: any, index: number) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: 'auto',
                    width: '100%',
                    alignSelf: 'flex-start',
                  }}
                >
                  <ScrollAreaAutosize>
                    {renderLayoutEditor(props, child, [...path, index])}
                  </ScrollAreaAutosize>
                </div>
              ))}
            </div>
            <SimpleGrid cols={2} p={8} /* mt={'-16px'} */>
              <Select
                //label="Select a layout item to be push inside this area"
                key={children.length}
                placeholder="Add layout"
                data={layoutComponentKeys}
                onChange={(value) => value && addLayoutChild(value)}
                size="xs"
              />
              {/* <Select
                //label="Select a linked component to be render inside this area"
                placeholder="Link component"
                data={Object.keys(parents_w)}
                value={linkedComponent.get()}
                size="xs"
                onChange={(e) => {
                  linkedComponent.set(e);
                }}
              /> */}
            </SimpleGrid>
          </>
        ) : (
          <>
            <Alert p={4} color="red">
              <Text size="xs">
                Problem: linked componen work like a wrap, linked component should have its own
                wrap/layout if needed, dont push that value from here
              </Text>
            </Alert>
            C: {linkedComponent.get()}
            #forced render with linkedComponent (but need to set the source/child as id, and then
            autorender the relative item like path stuff)
            <ScrollAreaAutosize>
              {renderComponentFromJSON(
                { id: linkedComponent.get() },
                api$[linkedComponent.get()].values[0] /* json */,
              )}
            </ScrollAreaAutosize>
          </>
        ))}
    </Card>
  ) : (
    <></>
  );
}

/* function cssStyle(styles: string) {
  return styles
    ?.match(/body\s*{[^}]*}/g)
    ?.map((block) => block.replace(/body\s*{([^}]*)}/, '$1').trim())
    ?.join('\n');
}
 */
/* function updateInputs(api: any, input: string) {
  const inputs = api.inputs; // Retrieve the old list
  const currentInputs = inputs.get(); // Get the raw list
  const exist = inputs.get().includes(input);
  let newList = [];
  if (exist) {
    newList = currentInputs.filter((item: string) => item !== input);
  } else {
    newList = [...currentInputs, input];
  }
  api.inputs.set(newList);
} */

function getAllIds(id: string): string[] {
  const ids = new Set<string>();
  function collectIds(currentId: string) {
    if (!currentId || ids.has(currentId)) return;
    ids.add(currentId);
    const inputs = api$[currentId]?.inputs.get() || [];
    inputs.forEach((inputId: string) => {
      collectIds(inputId);
    });
  }
  collectIds(id);
  return Array.from(ids);
}

const diagramRenderSection = observable<any>();
syncObservable(diagramRenderSection, {
  persist: { name: 'diagramRenderSection$' },
  debounceSet: 100,
});

//old!!!
const DiagramRender = observer((props) => {
  const api = api$[props.id];
  const appId = router$.path.get()?.replace('/', '');
  const parents = api.inputs.map((input: any) => api$[input.get()]);
  const status = getStatus(props.id);
  const h = status.size.h.get();
  const parent_value = parents[0]?.values[0];
  const section = diagramRenderSection[props.id].section.get() || 'editor';
  const store = diagramRenderSection[props.id].store;
  const imports = diagramRenderSection[props.id].imports;

  const parents_value = parents.map((parent: any) => parent.values[0]);

  /*  const parents_value2 = parents.map((parent: any) => parent.values[0].get());
  const parent_code_merged = `<div>${parents_value.map((json: string) =>
    buildCodeFromJSON(json),
  )}</div>`; */

  function test(data: any) {
    const id = `imported_${nanoid(6)}`;
    const item = {
      custom_key: id,
      type: 'diagram',
      appId: 'System',
      widgetId: 'diagram',
      //inputs,
      config: { variant: 'builder', builder: 'component' },
    };
    new$(item);

    api$[id].values.push(data);
  }

  console.log('uahsdnijokasdasd', api$['KHYyG5'].get());

  return (
    <>
      <SegmentedControl
        size="xs"
        data={['preview', 'create', 'editor', 'import', 'push', 'widget']}
        value={section}
        onChange={(e: any) => diagramRenderSection[props.id].section.set(e)}
      />
      {section === 'import' && (
        <>
          <SimpleGrid cols={2}>
            <InputEditor h={h - 61} language="json" data={imports} editable={true} />
            {/* <InputEditor
              h={h - 61}
              editable={false}
              language="typescript"
              data={buildCodeFromJSON(imports)}
            /> */}
          </SimpleGrid>
          <Button onClick={() => test(imports.get())}>Import</Button>
        </>
      )}
      {section === 'create' && (
        <>
          <Text size="xs">Create new setup</Text>

          <Button
            onClick={() => {
              //console.log('create widget from', parent_value.get(), parents_value);
            }}
          >
            create
          </Button>
          <Text size="xs">Download current setup</Text>

          <Button
            onClick={() => {
              downloadData(
                getAllIds(props.id).map((id) => api$[id].get()),
                props.id,
              );
            }}
          ></Button>
        </>
      )}
      {section === 'widget' && (
        <>
          <Text size="xs">Push this item as widget</Text>
          {!appId && 'No app id!'}
          <Button
            disabled={!appId}
            onClick={() => {
              console.log('create widget from', parent_value.get(), parents_value);
              //const parent_merged = [api.values[0] ];
              //const data = parent_merged.map((parent) => parent.get());
              console.log('create widget from', parent_value.get());

              imports$[appId][props.id].set(parent_value.get());
            }}
          >
            Test push #toremove
          </Button>
        </>
      )}
      {section === 'push' && (
        <>
          <Button
            size="xs"
            onClick={() => {
              const allIds = getAllIds(props.id);

              allIds.forEach((customId) => {
                const pushData: any = {
                  action: 'post',
                  name: customId,
                  data: api$[customId].get(),
                  type: 'json',
                };

                pushWidgetJSONonScorerApi(pushData);
              });
            }}
          >
            Push group {JSON.stringify(getAllIds(props.id))}
          </Button>
          {/* <Button size="xs" onClick={() => pushWidgetJSONonScorerApi(pushData)}>
            Push this JSON app
          </Button> */}
          <Button
            size="xs"
            onClick={async () =>
              diagramRenderSection[props.id].store.set(
                await callTool('fetchapi', { url: 'https://api.scorer.app/files/widget_' }),
              )
            }
          >
            fetch {props.id}
          </Button>

          <Divider />
          <Stack gap={6}>
            {console.log(
              'getAllIds(props.id)',
              props.id,
              getAllIds(props.id).map((id) => api$[id].get()),
            )}
            <Text size={'xs'} c={'dimmed'}>
              Installed deps:
            </Text>
            {getAllIds(props.id).map((id: string) => {
              return <Text size={'xs'}>{id}</Text>;
            })}
            Store deps:
            {store.map((id: any) => {
              const fullValue = id.get();
              const separatorIndex = fullValue.indexOf('_');
              const category = fullValue.slice(0, separatorIndex);
              const nameWithType = fullValue.slice(separatorIndex + 1);
              const [name, type] = nameWithType.split('.');

              //console.log('ui9ahsjdoklsa', id.get());
              const deps = getAllIds(name);
              return (
                <Card>
                  <Group justify="space-between">
                    <Group gap={4}>
                      <Text size={'sm'}>
                        {category} {type}
                      </Text>
                      {deps.map((dep) => (
                        <Badge
                          size="xs"
                          color={
                            dep === name
                              ? 'green'
                              : getAllIds(id.get()).includes(dep)
                              ? 'orange'
                              : 'blue'
                          }
                        >
                          {dep}
                        </Badge>
                      ))}
                    </Group>

                    <Group gap={4}>
                      {getAllIds(props.id).includes(name) ? (
                        <ActionIcon
                          onClick={async () => {
                            const full_name = `${category}_${name}.${type}`;
                            const url = `https://api.scorer.app/file/${full_name}`;
                            const data = await callTool('fetchapi', { url });

                            console.log('asdhuoasijdsad', {
                              url,
                              parents: getAllIds(name),
                              data,
                            });
                          }}
                        >
                          <IconProgressCheck size={'1rem'} stroke={1} />
                        </ActionIcon>
                      ) : (
                        <ActionIcon
                          onClick={async () => {
                            const url = `https://api.scorer.app/file/${category}_${name}.${type}`;
                            console.log('asdhuoasijdsad', {
                              url,
                              parents: getAllIds(name),
                              data: await callTool('fetchapi', {
                                url,
                              }),
                            });
                          }}
                        >
                          <IconDownload size={'1rem'} stroke={1} />
                        </ActionIcon>
                      )}

                      <ActionIcon onClick={() => store[id.get()].delete()}>
                        <IconTrash size={'1rem'} stroke={1} />
                      </ActionIcon>
                      <ActionIcon
                        onClick={async () => {
                          await pushWidgetJSONonScorerApi({
                            action: 'delete',
                            name,
                            type,
                          });
                          store[id.get()].delete();
                        }}
                      >
                        <IconSkull size={'1rem'} stroke={1} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </>
      )}

      {section === 'editor' && (
        <>
          {parents_value.map((parent: any) => {
            return (
              <SimpleGrid cols={2} key={parent.get()}>
                <InputEditor h={h - 61} language="json" data={parent} editable={true} />
                {/* <InputEditor
                  h={h - 61}
                  editable={false}
                  language="typescript"
                  data={buildCodeFromJSON(parent)}
                /> */}
              </SimpleGrid>
            );
          })}
        </>
      )}

      {/* {section === 'preview' && renderComponent(buildCodeFromJSON(parent_value, props.id))} */}

      <div style={{ display: section === 'preview' ? undefined : 'none' }}>
        renderComponent AND buildCodeFromJSON DEPRECATED (AND ALSO THIS COMPONENT)
        {/* {renderComponent(parent_code_merged)} */}
        {/* <InputEditor h={h - 61} editable={false} language="json" data={parent_code_merged} /> */}
      </div>

      {/* {renderComponent(section === 'preview' ? buildCodeFromJSON(parent_value, props.id) : null)} */}
    </>
  );
});

//old test, to remove
async function pushWidgetJSONonScorerApi({
  action,
  name,
  data,
  type,
}: {
  action: 'delete' | 'post' | 'fetch' | string;
  name?: string;
  data?: any;
  type?: 'json' | 'js';
}) {
  let req;

  //use name, match with all items available, get the relative category automatically
  const category = `widget`;

  if (action === 'fetch') {
    (req = await fetch(
      `https://api.scorer.app/file/${category}_${name ? name : null}${type && `.${type}`}`,
    )),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
  } else if (action === 'post') {
    await fetch(
      `https://api.scorer.app/file/${category}_${name ? name : null}${type && `.${type}`}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
  } else if (action === 'delete') {
    await fetch(
      `https://api.scorer.app/file/${category}_${name ? name : null}${type && `.${type}`}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  console.log('pushWidgetJSONonScorerApi', req);
  return await req;
}
