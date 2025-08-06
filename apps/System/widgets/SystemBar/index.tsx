'use client';

//import { SignedIn, SignedOut, SignInButton, useClerk } from '@clerk/nextjs';
import { observer, useComputed } from '@legendapp/state/react';
import {
  Group,
  Popover,
  PopoverTarget,
  ActionIcon,
  PopoverDropdown,
  Stack,
  TextInput,
  Card,
  Button,
  Badge,
  Alert,
  Text,
  Space,
} from '@mantine/core';
import {
  IconSettings,
  IconAutomaticGearbox,
  IconTemplate,
  IconStack,
  IconTools,
  IconBrain,
  IconApi,
  IconPlus,
  IconLink,
  IconTrash,
  IconLayout,
  IconEye,
  IconExternalLink,
  IconTournament,
  IconAppWindow,
  IconLogin,
  IconEyeOff,
  IconFileImport,
  IconRefresh,
  IconPlayerPlay,
  IconLayoutSidebarRight,
  IconLogout,
  IconUser,
} from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { observable } from '@legendapp/state';
import { Avatar, Divider, NavLink } from '@mantine/core';
import { handleSelectPreset } from '../../multistates/Tools/components';

import { chatInput$, ChatInput } from '@genesyshub/core/ui/components/Chat/ChatInput';
import { AppIcon } from '@genesyshub/core/ui/components/AppIcon';
import RenderValue from '@genesyshub/core/ui/components/RenderValue';
import { createDiagramFromWidget } from '@genesyshub/core/ui/components/Diagrams/utils';
//import { getZone } from '@genesyshub/ui/components/Draggable';
import { ItemsListNavigation } from '@genesyshub/core/ui/components/ItemsList';
import { SelectIcon } from '@genesyshub/core/ui/components/Menu/DynamicIcon';
import ScrollableSelect from '@genesyshub/core/ui/components/ScrollableSelect';

import { getApp, getApps, getStatus } from '@genesyshub/core/core/utils';
import { auth$, config$, draggable$ } from '@genesyshub/core/core/constants';
import { getLayout } from '@genesyshub/core/core/layout';
import { router$, useRouter } from '@genesyshub/core/core/Router/router';
import { handleImportPreset, presets$, importPresetData } from '@genesyshub/core/core/Tools';

import { getZone } from '@genesyshub/core/core/draggable';

const UserButton = observer((props) => {
  const w = getStatus(props.id).size.w.get();

  const user = auth$.user.get();
  //const { signOut } = useClerk();

  return (
    <>
      <Popover offset={{ mainAxis: 10 }}>
        <PopoverTarget>
          <ActionIcon>
            <IconUser size={'1rem'} stroke={1} />
          </ActionIcon>
        </PopoverTarget>
        <PopoverDropdown w={w}>
          <Group p={10}>
            <Avatar size={'2rem'} src={user?.imageUrl} />
            <Stack gap={0}>
              <Text size="sm">{user?.firstName}</Text>
              <Text size="xs">{user?.fullName}</Text>
            </Stack>
          </Group>
          <Divider />

          <Divider />
          <NavLink
            //onClick={() => signOut()}
            label="Sign out"
            leftSection={<IconLogout size={16} stroke={1.5} />}
          />
        </PopoverDropdown>
      </Popover>
    </>
  );
});

const app$ = observable<any>();

const handleScroll = (e: any, id: string, onChange: any) => {
  const ids = getApps().ids.get();

  const flatIds = ids
    .reduce((acc: any, currId: any) => {
      const group = acc.find((group: any) => group.group === currId);

      if (group) {
        group.items.push(currId);
      } else {
        acc.push({ group: currId, items: [currId] });
      }

      return acc;
    }, [])
    .flatMap((group: any) => group.items);

  const currentIndex = flatIds.indexOf(id);
  let nextIndex = e.deltaY > 0 ? currentIndex + 1 : currentIndex - 1;

  // Stop at the first and last items
  if (nextIndex >= flatIds.length) {
    nextIndex = flatIds.length - 1; // Stay at the last item
  } else if (nextIndex < 0) {
    nextIndex = 0; // Stay at the first item
  }

  const nextAppId = flatIds[nextIndex];

  onChange(nextAppId);

  return nextAppId;
};
const DefaultDesktopAppSelector = observer(({ w }: { w?: number }) => {
  const id = router$.path.get()?.replace('/', '');
  const ids = getApps().ids.get();

  function onChange(e: any) {
    if (e) {
      useRouter(e);
    } else {
      useRouter();
    }
  }

  return (
    <>
      <ScrollableSelect
        placeholder="Select app"
        leftSection={
          id ? (
            <>
              <AppIcon app={getApp(id).app.get()} />
            </>
          ) : (
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={() => {
                const id = nanoid();
                const newApp = {
                  id,
                  name: 'My new App',
                  icon: 'IconHome',
                  version: '1.0.0',
                  widgets: [],
                  customWidgets: {},
                  tools: [],
                  customTools: {},
                  api: observable(),
                  layouts: {
                    section: undefined,
                    pages: [
                      {
                        section: undefined,
                        label: 'Home',
                        icon: 'IconHome',
                        layout: [
                          {
                            key: 'menu',
                            type: 'menu',
                            widget: { appId: 'System', widgetId: 'default_menu' },
                          },
                          {
                            key: 'newitem',
                            type: 'content',
                            widget: { appId: 'builder', widgetId: 'new' },
                          },
                        ],
                      },
                    ],
                  },
                };

                getApps().apps.push(newApp);
                useRouter(id);
              }}
            >
              <IconPlus size={'1rem'} stroke={1} />
            </ActionIcon>
          )
        }
        clearable
        variant="filled"
        size="xs"
        w={w || '100%'}
        value={id}
        data={ids}
        onChange={onChange}
        handleScroll={handleScroll}
      />
    </>
  );
});

export const SystemBar = observer((props) => {
  const id = router$.path.get()?.replace('/', '');
  const checkApp = getApp(id).app.id.get();
  //const { openSignIn } = useClerk();
  const logged = auth$.user.get();

  return (
    <Group p={4} m={0} gap={0} justify="space-between" className={'drag'}>
      <DefaultDesktopAppSelector w={130} />

      {logged ? (
        <UserButton {...props} />
      ) : (
        <ActionIcon
          onClick={() => {
            /* openSignIn() */
          }}
        >
          <IconLogin size={'1rem'} stroke={1} />
        </ActionIcon>
      )}

      {checkApp ? (
        <>
          <PopoverAppSettings {...props} />
          <PopoverAppPages {...props} />
          <PopoverAppLayouts {...props} />
          <PopoverAppWidgets {...props} />
          <PopoverAppTools {...props} />
          <PopoverAppAgent {...props} />
          <PopoverAppApi {...props} />
        </>
      ) : (
        <>App not exist, create new!</>
      )}
    </Group>
  );
});

export const SystemSidebar = observer((props) => {
  const id = router$.path.get()?.replace('/', '');
  const params = router$.params;
  const status = getStatus(props.id);

  const currentAppPresets = getApp(id).app.presets;

  return (
    <Stack h={status.size.h.get()} p={4} m={0} gap={0} justify="space-between">
      <ActionIcon>
        <IconLayoutSidebarRight size={'1rem'} stroke={1} />
      </ActionIcon>
      <Stack>
        <Group>
          <Text>
            {id}/{params.section.get()}
          </Text>
        </Group>
        <Divider />
        <ItemsListNavigation
          disableDefaultItem
          items={currentAppPresets}
          //h={300}
          //w={status.size.w.get() - 8}
          props={props}
          header={
            <>
              <ActionIcon
                onClick={() => {
                  handleImportPreset();
                }}
              >
                <IconFileImport size={'1rem'} stroke={1} />
              </ActionIcon>
              <Text>Presets of {id}</Text>
            </>
          }
          leftSection={(preset, key) => {
            return (
              <>
                <ActionIcon
                  onClick={() => {
                    alert('run preset #todo');
                  }}
                >
                  <IconPlayerPlay size={'1rem'} stroke={1} />
                </ActionIcon>
                <ActionIcon onClick={() => handleSelectPreset(key)}>
                  <IconTournament size={'1rem'} stroke={1} />
                </ActionIcon>
                {key}
              </>
            );
          }}
          rightSection={(preset, key) => {
            const existingPreset = Object.keys(presets$).includes(key);

            return (
              <>
                <ActionIcon
                  onClick={() => {
                    importPresetData(preset.get(), key);
                  }}
                >
                  {existingPreset ? (
                    <IconRefresh size={'1rem'} stroke={1} />
                  ) : (
                    <IconFileImport size={'1rem'} stroke={1} />
                  )}
                </ActionIcon>
              </>
            );
          }}
        />
        <Divider />
        <Text>#TODO map widgets/tools/presets used in this layout</Text>
      </Stack>

      <Alert>
        <Text>1. create preset for google stuff (auth, sync...)</Text>
        <Text>2. then put preset in the Google app</Text>
        <Text>3. then update presets$ source from apps</Text>
        <Space h={20} />
        <Text>
          4. then setup this sidebar with current app/section stuff (like used presets, widgets,
          tools)
        </Text>
      </Alert>
    </Stack>
  );
});

//Popovers

const PopoverAppSettings = observer((props) => {
  const w = getStatus(props.id).size.w.get();
  return (
    <Popover offset={{ mainAxis: 10, crossAxis: 7 }}>
      <PopoverTarget>
        <ActionIcon>
          <IconSettings size={'1rem'} stroke={1} />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown w={w}>
        <Settings />
      </PopoverDropdown>
    </Popover>
  );
});

const PopoverAppPages = observer((props) => {
  const w = getStatus(props.id).size.w.get();
  return (
    <Popover offset={{ mainAxis: 10 /* crossAxis: -36 */ }}>
      <PopoverTarget>
        <ActionIcon>
          <IconAutomaticGearbox size={'1rem'} stroke={1} />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown w={w}>
        <Pages />
      </PopoverDropdown>
    </Popover>
  );
});

const PopoverAppLayouts = observer((props) => {
  const w = getStatus(props.id).size.w.get();
  return (
    <Popover offset={{ mainAxis: 10 /* crossAxis: -65 */ }}>
      <PopoverTarget>
        <ActionIcon>
          <IconTemplate size={'1rem'} stroke={1} />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown w={w}>
        <Layouts />
      </PopoverDropdown>
    </Popover>
  );
});

const PopoverAppWidgets = observer((props) => {
  const w = getStatus(props.id).size.w.get();
  return (
    <Popover offset={{ mainAxis: 10 /* crossAxis: -79 */ }}>
      <PopoverTarget>
        <ActionIcon>
          <IconStack size={'1rem'} stroke={1} />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown w={w}>
        <Widgets />
      </PopoverDropdown>
    </Popover>
  );
});

const PopoverAppTools = observer((props) => {
  const w = getStatus(props.id).size.w.get();
  return (
    <Popover offset={{ mainAxis: 10 /* crossAxis: -108 */ }}>
      <PopoverTarget>
        <ActionIcon>
          <IconTools size={'1rem'} stroke={1} />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown w={w}>
        <Tools />
      </PopoverDropdown>
    </Popover>
  );
});

const PopoverAppAgent = observer((props) => {
  const w = getStatus(props.id).size.w.get();
  return (
    <Popover offset={{ mainAxis: 10 /* crossAxis: -137 */ }}>
      <PopoverTarget>
        <ActionIcon>
          <IconBrain size={'1rem'} stroke={1} />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown w={w}>
        <Agent {...props} />
      </PopoverDropdown>
    </Popover>
  );
});

const PopoverAppApi = observer((props) => {
  const w = getStatus(props.id).size.w.get();
  return (
    <Popover offset={{ mainAxis: 10 /* crossAxis: -166 */ }}>
      <PopoverTarget>
        <ActionIcon>
          <IconApi size={'1rem'} stroke={1} />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown w={w}>
        <Api />
      </PopoverDropdown>
    </Popover>
  );
});

//Components for popovers

const Settings = observer(() => {
  const app = getApp(router$.path.get()?.replace('/', '')).app;
  return (
    <Stack>
      <TextInput
        size="xs"
        label="App name"
        placeholder="App name"
        value={app.name.get()}
        onChange={(e: any) => app.name.set(e.target.value)}
      />
      <TextInput
        size="xs"
        label="App icon"
        placeholder="App icon"
        value={app.icon.get()}
        onChange={(e: any) => app.icon.set(e.target.value)}
      />
      <SelectIcon iconApi={app.icon} />
      <TextInput
        size="xs"
        label="App version"
        placeholder="App version"
        value={app.version.get()}
        onChange={(e: any) => app.version.set(e.target.value)}
      />
    </Stack>
  );
});
const Pages = observer(() => {
  const app = getApp(router$.path.get()?.replace('/', '')).app;
  const currentSection = router$.params.section.get();

  const dark = config$.settings.theme.get() === 'dark';
  return (
    <Stack>
      <Group justify="space-between">
        <Text size="xs">Pages</Text>
        <ActionIcon
          onClick={() => {
            const section = nanoid();
            const newPage = {
              section,
              label: 'New section',
              icon: 'IconMenu',
              layout: [
                {
                  key: 'menu',
                  type: 'menu',
                  widget: { appId: 'System', widgetId: 'default_menu' },
                },
                {
                  key: 'newitem',
                  type: 'content',
                  widget: { appId: 'builder', widgetId: 'new' },
                },
              ],
            };
            app.layouts.pages.push(newPage);
          }}
        >
          <IconPlus stroke={1} size={'1rem'} />
        </ActionIcon>
      </Group>
      {app.layouts.pages.map((layout: any, index: number) => (
        <Card
          key={index}
          withBorder
          bg={
            currentSection === layout.section.get() || (!currentSection && !layout.section.get())
              ? dark
                ? 'dark.5'
                : 'gray.2'
              : undefined
          }
        >
          {currentSection === layout.section.get()}
          <Group justify="space-between">
            <Group gap={4}>
              <Text size="xs" c="dimmed">
                {layout.section.get() || 'default'}
              </Text>
            </Group>

            <Group gap={0}>
              <ActionIcon
                onClick={() => {
                  const section = layout.section.get() ? `?section=${layout.section.get()}` : ``;
                  router$.push(`${app.id.get()}${section}`);
                }}
              >
                <IconLink stroke={1} size={'1rem'} />
              </ActionIcon>
              <ActionIcon onClick={() => layout.delete()}>
                <IconTrash stroke={1} size={'1rem'} />
              </ActionIcon>
            </Group>
          </Group>
          <Group gap={4} justify="space-between">
            <SelectIcon iconApi={layout.icon} />
            <TextInput
              variant="filled"
              w={170}
              size="xs"
              defaultValue={layout.label.get()}
              onChange={(e) => layout.label.set(e.currentTarget.value)}
            />
          </Group>
        </Card>
      ))}
    </Stack>
  );
});

const Layouts = observer(({ appId, section }: { appId?: string; section?: string }) => {
  const widget = {
    appId: appId || router$.path.get()?.replace('/', ''),
    section: section || router$.params.section.get(),
  };

  const app = getApp(widget.appId).app;
  //const widget_id = nanoid(6);
  const layout = app.layouts.pages.find(
    (page: any) => page.section.get() === widget.section,
  )?.layout;
  return (
    <>
      {widget.appId} {widget.section}
      create new layout
      <Button
        size={'xs'}
        onClick={() => {
          const newLayout = {
            key: nanoid(4),
            type: 'content',
            widgets: [{ appId: 'builder', widgetId: 'new' }],
          };
          console.log('uiahsdjuhnasd', newLayout, app.get(), layout.get());
          //push new layout to current app/section
          layout.push(newLayout);
        }}
      >
        New Layout
      </Button>
      <Stack>
        {app.layouts.pages
          .find((page: any) => page.section.get() === widget.section)
          ?.layout.map((layout: any) => {
            const key = layout.key;

            return (
              <Card withBorder key={key.get()}>
                <Group justify="space-between">
                  <Group>
                    <Badge
                      ml={8}
                      variant="filled"
                      size="xs"
                      color={getZone(layout.type.get())?.color.get()}
                    >
                      {layout.type.get()}
                    </Badge>
                    {/* <Text size="xs" c="dimmed">
                        {layout.key.get()}
                      </Text> */}
                  </Group>

                  <Group gap={0}>
                    <ActionIcon
                      onClick={() =>
                        draggable$[key.get()].draggable.set(!draggable$[key.get()].draggable.get())
                      }
                    >
                      <IconLayout
                        size={'1rem'}
                        stroke={draggable$[key.get()].draggable.get() ? 2 : 1}
                      />
                    </ActionIcon>
                    <ActionIcon
                      disabled={key.get() === 'systemBar'}
                      onClick={() => {
                        console.log('9iasjdoasd', getLayout(key.get())?.get());
                        getLayout(key.get()).hidden.set(!getLayout(key.get()).hidden.get());
                      }}
                    >
                      {getLayout(key.get())?.hidden.get() ? (
                        <IconEyeOff size={'1rem'} stroke={1} />
                      ) : (
                        <IconEye size={'1rem'} stroke={1} />
                      )}
                    </ActionIcon>
                    <ActionIcon
                      onClick={() =>
                        window.open(
                          `http://localhost:3000/${layout.widget.appId.get()}?widget=${layout.widget.widgetId.get()}`,
                          '_blank',
                        )
                      }
                    >
                      <IconExternalLink size={'1rem'} stroke={1} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => {
                        layout.delete();
                      }}
                    >
                      <IconTrash stroke={1} size={'1rem'} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            );
          })}
      </Stack>
    </>
  );
});
const Widgets = observer(() => {
  const app = getApp(router$.path.get()?.replace('/', '')).app;
  const widget_id = nanoid(6);
  const layout = app.layouts.pages.find(
    (page: any) => page.section.get() === router$.params.section.get(),
  )?.layout;
  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Text size="xs">Widgets</Text>

          <TextInput
            leftSection={
              <ActionIcon
                onClick={() => {
                  const widget = [
                    {
                      type: 'Card',
                      props: {},
                      children: [],
                      params: {
                        h: '200px',
                      },
                    },
                  ];

                  //This push widget in the current app.customWidgets
                  app.widgets.push(app$.new.widget.name.get() || widget_id);
                  app.customWidgets[app$.new.widget.name.get() || widget_id].set(widget);
                }}
              >
                <IconPlus stroke={1} size={'1rem'} />
              </ActionIcon>
            }
            variant="unstyled"
            w={100}
            size="xs"
            defaultValue={app$.new.widget.name.get() || widget_id}
            onChange={(e) => app$.new.widget.name.set(e.currentTarget.value)}
          />
        </Group>
        {/* Widget component for footerBar Popover */}
        {app.widgets.map((id: any) => {
          const widget = app.imports[id.get()];

          return (
            <Card withBorder key={id.get()}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {id.get()}
                </Text>

                <Group gap={0}>
                  <ActionIcon
                    onClick={() =>
                      window.open(
                        `http://localhost:3000/${
                          router$.path.get()?.replace('/', '') || config$.default.app.get()
                        }?widget=${id.get()}`,
                        '_blank',
                      )
                    }
                  >
                    <IconExternalLink size={'1rem'} stroke={1} />
                  </ActionIcon>
                  <ActionIcon
                    onClick={() => {
                      createDiagramFromWidget('testasdasd', widget[0]);
                    }}
                  >
                    <IconTournament stroke={1} size={'1rem'} />
                  </ActionIcon>
                  <ActionIcon
                    onClick={() => {
                      getLayout().push({
                        key: id.get(),
                        type: 'window',
                        widget: {
                          appId: app.id.get(),
                          widgetId: id.get(),
                        },
                      });
                    }}
                  >
                    <IconAppWindow stroke={1} size={'1rem'} />
                  </ActionIcon>
                  <ActionIcon
                    onClick={() => {
                      widget.delete();
                    }}
                  >
                    <IconTrash stroke={1} size={'1rem'} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </>
  );
});

const Tools = observer(() => {
  return (
    <>
      <Group justify="space-between">
        <Text size="xs">Tools</Text>
        <ActionIcon onClick={() => {}} disabled>
          <IconPlus stroke={1} size={'1rem'} />
        </ActionIcon>
      </Group>
      <Alert title={'#TODO'}>
        <Text size="xs">Find a way to make tools simple to import/export</Text>

        <Text size="xs">- use eval? (unsafe, but can use string code)</Text>
        <Text size="xs">
          - create server files for this app? (need deploy new server/push into existing server the
          new template)
        </Text>
        <Text size="xs">- push files/servers in local env.</Text>
      </Alert>
    </>
  );
});

const Agent = observer((props) => {
  /* const chat = chats$.find((chat$: any) => chat$.id.get() === props.id);
  const lastMessage = chat?.messages[chat?.messages.length - 1]?.choices[0].message.content?.get(); */
  //console.log('uihajsdkas 00', props.id, chatInput$[props.id].get());
  const text = chatInput$[props.id].response.get();
  //console.log('chatInput$[chatId]', text)
  const context = useComputed(() => getApp().app.api.get());
  return (
    <>
      <ChatInput {...props} chatId={props.id} withBorder={false} context={context} />
      {/* <Text>{lastMessage}</Text> */}
      <Text>{text}</Text>
    </>
  );
});

const Api = observer(() => {
  console.log('iuahsndoasd', getApp(router$.path.get()?.replace('/', '')).app.api.get());
  return (
    <>
      Api data of this app/section {router$.path.get()?.replace('/', '')}
      #todo not work
      <RenderValue
        k={router$.path.get()?.replace('/', '')}
        v={getApp(router$.path.get()?.replace('/', '')).app.api}
      />
    </>
  );
});
