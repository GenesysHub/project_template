import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { syncObservable } from '@legendapp/state/sync';
import { Stack, Text, Card, Group, Select, Tooltip, Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

import Icon from '@genesyshub/core/ui/components/Menu/DynamicIcon';
import Divider from '@genesyshub/core/ui/components/Divider';
import { InputEditor } from '@genesyshub/core/ui/components/InputEditor';
import { InputProperties } from '@genesyshub/core/ui/components/InputProperties';

import { api$ } from '@genesyshub/core/core/layout';
import { getTool, useTool } from '@genesyshub/core/core/Tools';
import { toolsV2$, getStatus } from '@genesyshub/core/core/utils';

import { ToolDocumentationPopover } from '@genesyshub/core/ui/components/Tools';

const toolCard$ = observable<any>();
const ToolStepperCard = observer(({ props, tool, index, api }: any) => {
  const component = api.tools[index];
  const res = api.response;
  const tool$ = getTool(tool.tool.get());

  const renderSelectOption: any = ({ option, checked }: any) => (
    <Stack>
      <Group flex="1" gap="xs">
        {option.icon && <Icon icon={option.icon} stroke={0.8} />}
        <Text size="xs">{option.value}</Text>

        {checked && <IconCheck size={'1rem'} stroke={1} style={{ marginInlineStart: 'auto' }} />}
      </Group>
      <Text size="xs" c={'dimmed'}>
        {option.data.description}
      </Text>
    </Stack>
  );

  return (
    <div>
      <Stack gap={4}>
        <Select
          m={4}
          leftSection={
            tool$ && (
              <Tooltip label="Auth documentation">
                <ToolDocumentationPopover tool={tool$} />
              </Tooltip>
            )
          }
          renderOption={renderSelectOption}
          searchable
          placeholder="Select a tool"
          size="xs"
          data={toolsV2$.groups()}
          value={tool.tool.get()}
          onChange={(e: any) => {
            e && tool.set({ tool: e, id: props.id, props: {} });
            component.show[index].set(true);
          }}
        />

        {tool.tool.get() && (
          <>
            {/* <Button
              m={4}
              //size="xs"
              onClick={async () => {
                await runTools(props.id);
              }}
            >
              Execute tools
            </Button> */}
            <Divider label={'parameters'} opened>
              <Card withBorder m={10} p={0}>
                {Object.entries(tool$?.parameters.properties || {}).map(
                  ([key, param]: any, index: number) => {
                    return (
                      <div key={key}>
                        {index !== 0 && <Divider />}
                        <InputProperties
                          properties={{
                            id: props.id,
                            index: index,
                            param: param,
                            paramKey: key,
                            value: tool.props[key],
                          }}
                          p={6}
                        />
                      </div>
                    );
                  },
                )}
                <Divider />
                <Button
                  m={4}
                  size="xs"
                  onClick={async () => {
                    await useTool(props.id);
                  }}
                >
                  Execute {tool.tool.get()}
                </Button>
              </Card>
            </Divider>
            {/* {!!tool$?.documentation.get() && (
              <Divider label={'documentation'} opened>
                <TextEditor content$={tool$.documentation} id={tool.tool.get()} />
              </Divider>
            )} */}

            {!!res[index].get() && (
              <>
                <Divider label={'response #todo'}>
                  <ResponseComponent id={props.id} res={res[index][0].result} />
                </Divider>
              </>
            )}
          </>
        )}
      </Stack>
    </div>
  );
});

const responseComponent$ = observable<any>();
syncObservable(responseComponent$, {
  persist: {
    name: 'responseComponent$',
  },
});

const ResponseComponent = observer(({ id, res }: any) => {
  //const response_path = [id, 'response', 0, 0, 'result'];

  /* const widget = responseComponent$[id].widget;
  const code = responseComponent$[id].code;
  const loading = responseComponent$[id].loading; */

  /* async function updateRender(res: any, path: string[]) {
    try {
      loading.set(true);
      widget.set(generateSchema(path, res, id));
      code.set(buildCodeFromJSON(widget));
    } catch {
      code.set(``);
    } finally {
      loading.set(false);
    }
  } */

  //const section = responseComponent$[id].section;

  //const schema = generateSchema$[id];
  //const selected = schema.default.get();
  /* useEffect(() => {
    updateRender(res.get(), response_path);
  }, [res.get(), selected]);
 */
  return (
    <div>
      {/*  <SegmentedControl
        data={['render', 'widget', 'json']}
        value={section.get()}
        onChange={section.set}
      /> */}
      <Button size="xs" onClick={() => res.delete()}>
        Delete response
      </Button>
      {/* render options:
      <Select
        data={['Stack', 'SimpleGrid']}
        value={schema.default.get()}
        onChange={(e) => schema.default.set(e)}
      />
      <InputEditor data={schema.items[selected].params} editable={true} language="json" /> */}
      {/* {section.get() === 'render' && (
        <>
          push as widget:
          {renderComponent(code.get())}
        </>
      )}
      {section.get() === 'widget' && (
        <>
          <Button
            size={'xs'}
            onClick={() => {
              createDiagramFromWidget(id, widget);
            }}
          >
            Create Component
          </Button>
          <InputEditor data={widget} language="json" editable={true} />
        </>
      )}
        {section.get() === 'json' && (
        <>
          <InputEditor h={200} data={res} editable={true} language="json" />
        </>
      )}
      */}

      <InputEditor h={200} data={res} editable={true} language="json" />
    </div>
  );
});

export const DiagramTool = observer((props) => {
  const api = api$[props.id];
  const status = getStatus(props.id);
  const type = status.type.get();

  return (
    <Stack w={status.size.w.get() - 2}>
      {api.tools.length === 0 || !api.tools.get() ? (
        <>
          <Text ta={'center'} pt={10} size="xl">
            TOOL manager
          </Text>
          <Text ta={'center'} size="sm" px={20}>
            You can create a chain of tools and use a single merged call to execute all.
          </Text>

          <Button onClick={() => api.tools.push({})}>Create new function</Button>
        </>
      ) : (
        <>
          <ToolStepperCard props={props} tool={api.tools[0]} index={0} api={api} />
        </>
      )}
    </Stack>
  );
});
