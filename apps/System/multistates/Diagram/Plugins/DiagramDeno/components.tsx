//import { useAuth } from '@clerk/nextjs';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { syncObservable } from '@legendapp/state/sync';
import {
  Stack,
  SegmentedControl,
  Group,
  Badge,
  Divider,
  Card,
  ActionIcon,
  Text,
  Button,
} from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

import { InputProperties } from '@genesyshub/core/ui/components/InputProperties';
import { InputEditor } from '@genesyshub/core/ui/components/InputEditor';

import { env$ } from '@genesyshub/core/core/enviroment';
import { getApps } from '@genesyshub/core/core/utils';

const denoDemoTest$ = observable<any>({
  code: 'return `Hello, ${input.name}!`;',
  response: {},
});

const providers = {
  localhost: 'http://localhost:8000',
  deno: 'deno.0xos.org',
};

const ToolsComponent = observer(({ tools, id }: any) => {
  //clerk is removed, token must be update on deno server if needed.
  //const { getToken } = useAuth();
  const token = '';

  return (
    <Stack>
      {Object.values(tools).map((tool: any, index: number) => {
        function isRequiredParam(required: any, data: any) {
          return required?.some((param: any) => {
            const value = data?.[param];
            return value === '' || value === undefined;
          });
        }

        const required = isRequiredParam(tool.parameters.required.get(), tool.args.get());

        console.log('hiuasd', required, tool.get(), tool.name.get());

        //@ts-ignore
        const provider = providers[apiComponent$[id].provider.get() || 'localhost'];

        return (
          <Card>
            <Stack>
              <Group>
                <ActionIcon
                  onClick={() => {
                    console.log('server.metadata.app.get()', tools.get());
                    alert('todo');
                  }}
                >
                  <IconDownload size={'1rem'} stroke={1} />
                </ActionIcon>

                <Text size="sm">{tool.name.get()}</Text>
                <Text size="xs" c="dimmed">
                  {tool.description.get()}
                </Text>
              </Group>
              <Stack>
                {Object.entries(tool.parameters.properties || {}).map(
                  ([key, param]: any, paramindex: number) => {
                    const data = tool.args[key];
                    return (
                      <Card>
                        <Stack key={key}>
                          {/* <PropertiesInputResolver
                            id={'default'}
                            index={paramindex}
                            param={param}
                            paramKey={key}
                            value={data}
                            disableLinking
                            required={tool.parameters.required.get()?.includes(key)}
                          /> */}
                          <InputProperties
                            properties={{
                              id: tool.key.get(),
                              index: paramindex,
                              param: param,
                              paramKey: key,
                              value: data,
                            }}
                            disableLinking
                            required={tool.parameters.required.get()?.includes(key)}
                          />
                        </Stack>
                      </Card>
                    );
                  },
                )}
              </Stack>
              <Button
                disabled={required}
                mt="md"
                fullWidth
                onClick={async () => {
                  async function runDenoTool(url: string, input?: any) {
                    //const token = await getToken();
                    const res = await fetch(url, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        code: denoDemoTest$.code.get(),
                        input,
                      }),
                    });

                    const data = await res.json();
                    console.log('res: ', data);
                    denoDemoTest$.response[tool.name.get()].set(data);
                  }
                  console.log('runDenoTool', tool.name.get(), tool.args.get());

                  await runDenoTool(`${provider}/tools/${tool.name.get()}`, tool.args.get());
                }}
              >
                {required ? `Missing parameters` : `Call ${tool.name.get()}`} -{' '}
                {apiComponent$[id].provider.get()}
              </Button>
              {denoDemoTest$.response[tool.name.get()].get() && (
                <InputEditor
                  data={denoDemoTest$.response[tool.name.get()].get()}
                  language="json"
                  editable={false}
                />
              )}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
});

const apiComponent$ = observable<any>();
syncObservable(apiComponent$, { persist: { name: 'apiComponent$' } });

export const Menu = (props: any) => {
  return <>deno menu todo</>;
};

const DiagramDeno = observer((props) => {
  //const { getToken } = useAuth();
  const token = '';

  async function runDenoTool(url: string, input?: any) {
    //const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: denoDemoTest$.code.get(),
        input: { name: 'Alice' },
      }),
    });

    const data = await res.json();
    console.log('res: ', data);
    denoDemoTest$.response.default.set(data);
  }

  const tools = apiComponent$[props.id].tools;
  //@ts-ignore
  const provider = providers[apiComponent$[props.id].provider.get() || 'localhost'];
  return (
    <Stack>
      <SegmentedControl
        data={['localhost', 'deno']}
        value={apiComponent$[props.id].provider.get()}
        onChange={(e) => apiComponent$[props.id].provider.set(e)}
      />
      <Group>
        <Badge>{env$.get()}</Badge>
        <Badge color="green">{provider}</Badge>
      </Group>
      <InputEditor data={denoDemoTest$.code} editable={true} language="javascript" h={200} />
      <Button
        onClick={async () => {
          await runDenoTool(`${provider}/runTool`);
        }}
      >
        run custom function {apiComponent$[props.id].provider.get()}
      </Button>
      <InputEditor h={200} data={denoDemoTest$.response.default} editable={true} language="json" />
      <Divider />
      <Button
        onClick={async () => {
          //const token = await getToken();
          const url = `${provider}/usage`;
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          console.log('res: ', data);
          denoDemoTest$.response.default.set(data);
        }}
      >
        log usage {apiComponent$[props.id].provider.get()}
      </Button>
      <Button
        onClick={async () => {
          //const token = await getToken();
          const url = `${provider}/tools`;
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          console.log('res: ', data, getApps().tools.get());
          denoDemoTest$.response.default.set(data);
          tools.set(data.tools);
        }}
      >
        log tools on {apiComponent$[props.id].provider.get()}
      </Button>
      <ToolsComponent tools={tools} {...props} />
      <Button
        onClick={async () => {
          //const token = await getToken();
          const url = `${provider}/pushTool`;

          const tool = {
            name: 'customToolExample',
            description: 'My custom user tool',
            parameters: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'Text input' },
              },
              required: ['text'],
            },
            call: `
                  const { text } = input;
                  if (typeof text !== 'string') throw new Error('Invalid input');
                  return { result: text.toUpperCase() };
                `,
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tool }),
          });

          const data = await res.json();
          console.log('pushTool res:', data);
          denoDemoTest$.response.set(data);
        }}
      >
        Push Tool to {apiComponent$[props.id].provider.get()}
      </Button>
    </Stack>
  );
});

export default DiagramDeno;
