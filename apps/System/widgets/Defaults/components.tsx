'use client';

import { observer } from '@legendapp/state/react';
import {
  ScrollArea,
  Group,
  Stack,
  ScrollAreaAutosize,
  ActionIcon,
  Anchor,
  Box,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconLayoutSidebar, IconPlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';

import { AppIcon } from '@genesyshub/core/ui/components/AppIcon';
import { createDiagramItem } from '@genesyshub/core/ui/components/Diagrams/utils';
import HorizontalScrollBar from '@genesyshub/core/ui/components/HorizontalScrollbar';
import { handleScrollPage } from '@genesyshub/core/ui/components/Menu';
import Icon from '@genesyshub/core/ui/components/Menu/DynamicIcon';
import Sidebar from '@genesyshub/core/ui/components/Sidebar';

import { config$ } from '@genesyshub/core/core/constants';
import { api$ } from '@genesyshub/core/core/layout';
import { router$, useRouter } from '@genesyshub/core/core/Router/router';
import { Widget, getApp, new$, getStatus } from '@genesyshub/core/core/utils';

import { _params } from '@genesyshub/core/core/constants';

export const DefaultWidget = observer((props) => {
  const id = router$.path.get()?.replace('/', '');
  const section = router$.params.section.get();

  return (
    <>
      <Widget id={id} widget={section} config={props} />
    </>
  );
});

const DefaultMenu = observer(({ appId }: { appId: string }) => {
  const { app, /* section, */ pages } = getApp(appId);
  const section = router$.params.section;

  if (!app.get()) {
    return (
      <Tooltip label={`Impossible find ${appId} api.`}>
        <ActionIcon variant="transparent" color="orange">
          <IconAlertCircle size="1.1rem" stroke={1} />
        </ActionIcon>
      </Tooltip>
    );
  }

  if (!pages.get()) {
    return (
      <Tooltip label={`No menu found for this app. #TODO dropdown create layout`}>
        <ActionIcon variant="transparent" color="orange">
          <IconAlertCircle size="1.1rem" stroke={1} />
        </ActionIcon>
      </Tooltip>
    );
  }

  const textMenu = config$.settings.mode.menutext.get();
  const selectedSection = router$.params.section.get();

  //const router = useRouter();

  return (
    <Box onWheel={(e: any) => handleScrollPage(e, appId)}>
      <Group gap={0}>
        <ActionIcon
          onClick={() => {
            const default_w = _params.max_side_width.get();
            _params.max_side_width.set(default_w === 280 ? 54 : 280);
          }}
        >
          <IconLayoutSidebar size={'1rem'} stroke={1} />
        </ActionIcon>

        {pages.length > 1 &&
          pages.map((page$: any) => {
            const i = page$.get();
            const icon = i?.icon ? i.icon : 'IconMenu';
            return i.label ? (
              <div key={i.label}>
                {textMenu ? (
                  <Anchor
                    w={100}
                    mx={10}
                    ta={'center'}
                    size="sm"
                    variant="text"
                    //c={"dark"}
                    fw={selectedSection === i.section ? 900 : undefined}
                    onClick={() => {
                      i.section ? useRouter(appId, { section: i.section }) : useRouter(appId);
                    }}
                  >
                    {i.label}
                  </Anchor>
                ) : (
                  <Tooltip label={i.label}>
                    <ActionIcon
                      variant="transparent"
                      color="gray"
                      onClick={() => {
                        i.section ? useRouter(appId, { section: i.section }) : useRouter(appId);
                      }}
                      onDoubleClick={() => {
                        new$({
                          appId: appId,
                          widgetId: i.section, //using section.get() will sync the widgetId when section change
                          type: 'window',
                        });
                      }}
                    >
                      <Icon size={'1.2rem'} icon={icon} active={i.section === section.get()} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </div>
            ) : null;
          })}

        {!config$.settings.show.system.get() && (
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
                  /* {
                    key: nanoid(4),
                    type: 'grid',
                    widget: { appId: 'System', widgetId: 'diagramWidget' },
                  }, */
                ],
              };

              app.layouts.pages.push(newPage);

              router$.params.section.set(section);

              const id1 = nanoid(6);
              const id2 = nanoid(6);
              createDiagramItem({
                id: id1,
                type: 'diagram',
                config: { variant: 'layout' },
                //inputs: [id2]
              });
              api$[id1].inputs.push(id2);

              createDiagramItem({
                id: id2,
                type: 'diagram',
                config: { variant: 'widget' },
              });
            }}
          >
            <IconPlus size={'1rem'} stroke={1} />
          </ActionIcon>
        )}
      </Group>
    </Box>
  );
});

/* const systemComponents = [
  {
    id: 'systemSidebar',
    type: 'system_sidebar',
    widget: { appId: 'System', widgetId: 'systemSidebar' },
  },
  {
    id: 'systemBar',
    type: 'bar',
    widget: { appId: 'System', widgetId: 'systemBar' },
  },
  {
    id: 'footerBar',
    type: 'bar_side',
    widget: { appId: 'System', widgetId: 'footerBar' },
  },
]; */

export const DesktopHeader = observer((props) => {
  const defaultId = router$.path.get()?.replace('/', '');
  const { app: obsApp } = getApp(defaultId);
  const app = obsApp.get();
  const status = getStatus(props.id);
  const w = status.size.w.get();
  const h = status.size.h.get();

  if (!app) return;

  return (
    <HorizontalScrollBar>
      <Group gap={4} justify="space-between" w={w - _params.padding.y.get() * 2} h={h}>
        <Group gap={4} pl={4}>
          <AppIcon
            styles={{
              avatar: { radius: 0, size: '1.6rem' },
              icon: { stroke: 1 },
            }}
            onClick={() => router$.push(defaultId)}
          />
          {/*  <ActionIcon
            onClick={() => {
              //alert('open diagram sidebar');

              systemComponents.forEach(({ id, type, widget }) => {
                const existingLayout = getLayout(id)?.get();
                if (existingLayout) {
                  const currentStatus = !!getLayout(id).hidden.get();
                  getLayout(id).hidden.set(!currentStatus);
                } else {
                  createDiagramItem({ id, type, widget });
                }
              });
            }}
          >
            <IconLayoutSidebar size={'1rem'} stroke={1} />
          </ActionIcon> */}
          <DefaultMenu appId={app.id} />
        </Group>
        <Group gap={4} /* pr={4} */>
          <Widget id={defaultId} widget={'menu'} config={props} />
        </Group>
      </Group>
    </HorizontalScrollBar>
  );
});

export const DefaultSidebar = observer((props: any) => {
  const id = router$.path.get()?.replace('/', '');
  const { app } = getApp(id);
  const status = getStatus(props.id);
  const appId = app.plugin.get() || id;

  return (
    <ScrollArea scrollbars="y" type="never" h={status.size.h.get()}>
      <Stack justify="space-between">
        <Sidebar id={id} />
        <Stack justify="end">
          <Widget id={id} widget={'sidebar'} config={props} />
          {appId !== id && <Widget id={appId} widget={'sidebar'} config={props} />}
        </Stack>
      </Stack>
    </ScrollArea>
  );
});

export const DefaultContent = observer((props) => {
  const id = router$.path.get()?.replace('/', '');
  const section = router$.params.section.get();
  const widget = section === 'undefined' ? undefined : section;
  const status = getStatus(props.id);

  return (
    <ScrollAreaAutosize type="never" h={status.size.h.get()} w={status.size.w.get()}>
      <Widget id={id} widget={widget} config={props} />
    </ScrollAreaAutosize>
  );
});
