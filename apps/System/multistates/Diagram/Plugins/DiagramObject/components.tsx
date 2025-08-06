import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import {
  TextInput,
  Text,
  ActionIcon,
  Group,
  SegmentedControl,
  Badge,
  Box,
  Textarea,
  Card,
  Popover,
  PopoverTarget,
  PopoverDropdown,
  Indicator,
  Select,
  Button,
} from '@mantine/core';
import {
  IconCurrency,
  IconForms,
  IconLinkPlus,
  IconPlus,
  IconTournament,
  IconTrash,
} from '@tabler/icons-react';

import HorizontalScrollBar from '@genesyshub/core/ui/components/HorizontalScrollbar';
import { DataNavigator } from '@genesyshub/core/ui/components/InputEditor/Templates/Items/SourceManager';
import { ItemsListNavigation } from '@genesyshub/core/ui/components/ItemsList';
import { InputEditor } from '@genesyshub/core/ui/components/InputEditor';

import { api$ } from '@genesyshub/core/core/layout';
import { updateData } from '@genesyshub/core/core/Tools';
import { getStatus, getApps, formatPropsId } from '@genesyshub/core/core/utils';

import { getDataFromPathRecursive } from '@genesyshub/core/core/getData';

const newKey$ = observable<any>();

export const DiagramObject = observer((props) => {
  const api = api$[props.id];
  const database = api.database;
  const status = getStatus(props.id);
  const newkey = newKey$[props.id];

  //const parents_w = Object.keys(getParents(api.inputs, 'builder') || {});
  /* console.log(
    'y8guashdijas',
    parents_w.map((w) => api$[w].params.get()),
    parents_w.map((w) => api$[w].values[0].get()),
  ); */

  return (
    <>
      <ItemsListNavigation
        items={database}
        p={6}
        props={props}
        navigation={true}
        disableDefaultItem={true}
        header={
          <TextInput
            leftSection={
              <ActionIcon
                disabled={!newkey.get()}
                variant="transparent"
                color="gray"
                onClick={() => {
                  database[newkey.get()].set('hello');
                  api.databaseSource.source[newkey.get()].set('text');
                }}
              >
                <IconPlus size={'1rem'} stroke={1} />
              </ActionIcon>
            }
            size={'xs'}
            value={newkey.get()}
            onChange={(e: any) => newkey.set(e.currentTarget.value)}
          />
        }
        leftSection={(object, key) => {
          const source = api.databaseSource.source[key];
          const sync = api.databaseSource.sync[key];
          const mode = api.databaseSource.mode[key];

          return (
            <Group gap={4}>
              <div onClick={(e) => e.stopPropagation()}>
                <Popover>
                  <PopoverTarget>
                    <Badge
                      px={0}
                      w={80}
                      color={
                        !api.databaseSource.links[key]?.length
                          ? undefined
                          : api.databaseSource.links[key].every((_: any, i: number) =>
                              sync[i].get(),
                            )
                          ? 'green'
                          : api.databaseSource.links[key].every(
                              (_: any, i: number) => !sync[i].get(),
                            )
                          ? 'orange'
                          : 'yellow'
                      }
                    >
                      {key}
                    </Badge>
                  </PopoverTarget>
                  <PopoverDropdown w={400}>
                    {api.databaseSource.links[key]?.map((link: any, index: number) => (
                      <Group key={index} style={{ marginBottom: '1rem' }} justify="space-between">
                        <Group gap={0}>
                          <ActionIcon
                            disabled={!link.path.get() || link.path.length === 0}
                            onClick={() => updateData(props, key)}
                          >
                            <Indicator color={sync[index].get() ? 'green' : 'orange'} processing />
                          </ActionIcon>
                          <HorizontalScrollBar width={200}>
                            <DataNavigator
                              disabled={sync[index].get()}
                              data={link.source.get() === 'api' ? api$ : getApps().apis}
                              inputs={link.source.get() === 'api' ? api.inputs.get() : undefined}
                              output={link.path}
                            />
                          </HorizontalScrollBar>
                        </Group>

                        <Group gap={0}>
                          <SegmentedControl
                            disabled={sync[index].get()}
                            onClick={(e) => e.stopPropagation()}
                            value={link.source.get()}
                            onChange={(source) => {
                              link.source.set(source);
                              link.path.delete();
                            }}
                            size="xs"
                            data={[
                              { value: 'api', label: 'Api' },
                              { value: 'app', label: 'App' },
                            ]}
                          />
                          <ActionIcon
                            disabled={sync[index].get()}
                            onClick={() => {
                              api.databaseSource.links[key].splice(index, 1);
                            }}
                          >
                            <IconTrash size={'1rem'} stroke={1} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    ))}
                    <Button
                      fullWidth
                      leftSection={<IconLinkPlus size={'1rem'} stroke={1} />}
                      size="xs"
                      onClick={() => {
                        api.databaseSource.links[key].push({
                          source: 'api',
                          path: [],
                        });
                      }}
                    >
                      Link value
                    </Button>
                  </PopoverDropdown>
                </Popover>
              </div>

              <Group gap={0} onClick={(e) => e.stopPropagation()}>
                <Popover>
                  <PopoverTarget>
                    <ActionIcon>
                      {source.get() === 'api' && <IconTournament size={'1rem'} stroke={1} />}
                      {source.get() === 'app' && <IconCurrency size={'1rem'} stroke={1} />}
                      {source.get() === 'text' && <IconForms size={'1rem'} stroke={1} />}
                    </ActionIcon>
                  </PopoverTarget>
                  <PopoverDropdown>
                    <Group>
                      <SegmentedControl
                        onClick={(e) => e.stopPropagation()}
                        value={source.get()}
                        onChange={(e) => {
                          database[key].set(undefined);
                          source.set(e);
                        }}
                        size="xs"
                        data={['text', 'app', 'api']}
                      />
                      {source.get() === 'text' && (
                        <Select
                          variant="unstyled"
                          searchable
                          w={100}
                          value={mode.get()}
                          onChange={(e) => mode.set(e)}
                          data={['string', 'number', 'color', 'password', 'todo']}
                          size="xs"
                        />
                      )}
                    </Group>
                  </PopoverDropdown>
                </Popover>

                {source.get() === 'text' && (
                  <TextInput
                    type={mode.get() || 'string'}
                    placeholder="Write here"
                    key={source.get()}
                    w={status.size.w.get() - 180}
                    variant="unstyled"
                    size="xs"
                    value={database[key].get()}
                    onChange={(e: any) => database[key].set(e.currentTarget.value)}
                  />
                )}

                {source.get() === 'app' && (
                  <HorizontalScrollBar width={status.size.w.get() - 180}>
                    <DataNavigator data={getApps().apis} output={database[key]} />
                  </HorizontalScrollBar>
                )}

                {source.get() === 'api' && (
                  <HorizontalScrollBar width={status.size.w.get() - 180}>
                    <DataNavigator data={api$} inputs={api.inputs.get()} output={database[key]} />
                  </HorizontalScrollBar>
                )}
              </Group>
            </Group>
          );
        }}
        rightSection={(object, key) => {
          const source = api.databaseSource.source[key];
          const sync = api.databaseSource.sync[key];
          return (
            <Group gap={4}>
              {/* <SegmentedControl
                onClick={(e) => e.stopPropagation()}
                value={source.get()}
                onChange={(e) => {
                  database[key].set(undefined);
                  source.set(e);
                }}
                size="xs"
                data={['text', 'app', 'api']}
              /> */}
              <ActionIcon
                variant="transparent"
                color="gray"
                onClick={(e) => {
                  database[key].delete();
                  e.stopPropagation();
                }}
              >
                <IconTrash size={'1rem'} stroke={1} />
              </ActionIcon>
            </Group>
          );
        }}
        page_widget={{ id: 'System', widget: 'object_page', type: 'window' }}
      />
    </>
  );
});

///todo error on ids.
export const ObjectPage = observer((props) => {
  const key = formatPropsId(props.id);
  const api = api$[props.id];
  const status = getStatus(props.id);
  const database = api.database;
  const source = api.source;
  const sourceData = getSourceData(source, database[key]);

  return (
    <Box p={6}>
      <Group justify="space-between">
        <Text size="sm">{key}</Text>
        <SegmentedControl
          value={source.get()}
          onChange={(e) => {
            database[key].set(undefined);
            source.set(e);
          }}
          size="xs"
          data={['text', 'app', 'api']}
        />
        <ActionIcon
          variant="transparent"
          color="gray"
          onClick={() => {
            database[key].delete();
          }}
        >
          <IconTrash size={'1rem'} stroke={1} />
        </ActionIcon>
      </Group>

      {source.get() === 'text' && (
        <Textarea
          rows={16}
          placeholder="Write here"
          size="xs"
          value={database[key].get()}
          onChange={(e: any) => database[key].set(e.currentTarget.value)}
        />
      )}

      {source.get() === 'app' && (
        <HorizontalScrollBar>
          <DataNavigator data={observable(getApps().apis)} output={database[key]} />
        </HorizontalScrollBar>
      )}
      {source.get() === 'api' && (
        <HorizontalScrollBar width={status.size.w.get() - 230}>
          <DataNavigator data={api$} inputs={api.inputs.get()} output={database[key]} />
        </HorizontalScrollBar>
      )}

      {source.get() !== 'text' && (
        <Card withBorder>
          <InputEditor h={200} data={sourceData} editable={true} language="json" />
        </Card>
      )}
    </Box>
  );
});

function getSourceData(source: any, db: any) {
  let sourceData = undefined;
  if (source.get() === 'api') {
    sourceData = getDataFromPathRecursive(db.get()); //api
  } else if (source.get() === 'app') {
    sourceData = getDataFromPathRecursive(db.get()); //app
    console.log('uhasodihasd', db.get(), observable(getApps().apis).get(), sourceData.get());
  } else if (source.get() === 'text') {
    sourceData = db;
  }

  return sourceData;
}
