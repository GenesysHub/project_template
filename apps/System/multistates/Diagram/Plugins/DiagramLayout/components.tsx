import { observer } from '@legendapp/state/react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Select,
  Stack,
} from '@mantine/core';
import { nanoid } from 'nanoid';
import { IconExternalLink, IconEye, IconEyeOff, IconLayout, IconTrash } from '@tabler/icons-react';
import React, { useEffect } from 'react';
import _ from 'lodash';

import ItemsList from '@genesyshub/core/ui/components/ItemsList';

import { config$, draggable$ } from '@genesyshub/core/core/constants';
import { api$, getLayout } from '@genesyshub/core/core/layout';
import { router$ } from '@genesyshub/core/core/Router/router';
import { getApp, getApps } from '@genesyshub/core/core/utils';

const DiagramLayout = observer((props) => {
  const api = api$[props?.id];

  const widgetWraps = api.inputs
    .map((input: any) => api$[input.get()])
    .filter((api: any) => api.config.variant.get() === 'widget')
    .map((api: any) => api);

  /* const customWidgetWraps = api.inputs
    .map((input: any) => api$[input.get()])
    .filter((api: any) => api.config.variant.get() === 'builder')
    .map((api: any) => api); */

  const newLayoutAppId = api.layout.app;
  const newLayoutSection = api.layout.section;

  const [routerAppId, routerSection] = React.useMemo(
    () => [
      router$.path.get()?.replace('/', '') || config$.default.app.get(),
      router$.params.section.get(),
    ],
    [],
  );

  useEffect(() => {
    if (!newLayoutAppId.get()) newLayoutAppId.set(routerAppId);
    if (!newLayoutSection.get()) newLayoutSection.set(routerSection);
  }, []);

  const existLayout = React.useMemo(
    () =>
      getApp(newLayoutAppId.get()).layouts.pages.find(
        (page: any) => (page.section.get() || 'default') === newLayoutSection.get(),
      ),
    [newLayoutAppId.get(), newLayoutSection.get()],
  );

  const handleSearchChange = React.useCallback(
    _.debounce((value) => {
      newLayoutSection.set(value);
    }, 300),
    [],
  );

  const sectionsData = React.useMemo(
    () =>
      getApp(newLayoutAppId.get()).layouts.pages.map(
        (page: any) => page.section.get() || 'default',
      ),
    [newLayoutAppId.get()],
  );

  const handleCreateNewSection = React.useCallback(() => {
    const layoutFormat = widgetWraps.map((w: any) => ({
      key: nanoid(6),
      type: w.widget.type.get(),
      widget: {
        appId: w.widget.appId.get(),
        widgetId: w.widget.widgetId.get(),
      },
    }));

    const newLayout = {
      icon: 'IconMenu',
      section: newLayoutSection.get(),
      label: newLayoutSection.get(),
      layout: layoutFormat,
    };

    getApp(newLayoutAppId.get()).layouts.pages.push(newLayout);
  }, [widgetWraps, newLayoutSection.get(), newLayoutAppId.get()]);

  const handlePushToLayout = React.useCallback((layout: any) => {
    const newLayoutItem = {
      key: nanoid(),
      type: layout.widget.type.get(),
      widget: {
        widgetId: layout.widget.widgetId.get(),
        appId: layout.widget.appId.get(),
      },
    };
    getLayout().push(newLayoutItem);
  }, []);

  const handleUpdateLayout = React.useCallback(() => {
    const layoutFormat = widgetWraps.map((w: any) => ({
      key: nanoid(6),
      type: w.widget.type.get(),
      widget: { appId: w.widget.app.get(), widgetId: w.widget.widget.get() },
    }));

    const newLayout = {
      icon: 'IconMenu',
      section: newLayoutSection.get(),
      label: newLayoutSection.get(),
      layout: layoutFormat,
    };

    const app = getApp(newLayoutAppId.get());
    const page = app.layouts.pages.find(
      (page: any) => page.section.get() === newLayoutSection.get(),
    );

    if (page) {
      const currentLayout = page.get();
      const mergedLayout = {
        ...currentLayout,
        ...newLayout,
      };
    }
  }, [widgetWraps, newLayoutSection.get(), newLayoutAppId.get()]);

  return (
    <div key={routerSection || 'default'}>
      {routerSection}
      <Stack>
        <Select
          size="xs"
          clearable
          placeholder="Select app"
          data={getApps().ids.get()}
          value={newLayoutAppId.get()}
          onChange={(e: any) => {
            newLayoutAppId.set(e);
            newLayoutSection.set(undefined);
          }}
        />
        <Select
          disabled={!newLayoutAppId.get()}
          size="xs"
          searchable
          onSearchChange={handleSearchChange}
          nothingFoundMessage={
            <Button
              disabled={!newLayoutAppId.get() || !newLayoutSection.get() || !!existLayout}
              onClick={handleCreateNewSection}
            >
              create new section
            </Button>
          }
          data={sectionsData}
          placeholder="Select section"
          value={newLayoutSection.get()}
          onChange={(e: any) => newLayoutSection.set(e)}
        />
        <ItemsList
          props={props}
          h={200}
          items={existLayout?.layout}
          rightSection={(layout) => {
            const id = layout.key;
            const key = layout.key;
            const widget = layout.widget;

            return (
              <Group gap={4}>
                {key.get() === props.id && (
                  <Badge size={'xs'} color="grape">
                    current
                  </Badge>
                )}
                <Badge size={'xs'} color="green">
                  {id.get()}
                </Badge>
                <Badge size={'xs'} color="yellow">
                  {widget.appId.get()}
                </Badge>
                <Badge size={'xs'} color="yellow">
                  {widget.widgetId.get()}
                </Badge>
                <Badge size={'xs'}>{layout.type.get()}</Badge>

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
                  disabled={key.get() === props.id}
                  onClick={() => {
                    getLayout(key.get())?.hidden.set(!getLayout(key.get()).hidden.get());
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
                      `http://localhost:3000/${widget.appId.get()}?widget=${widget.widgetId.get()}`,
                      '_blank',
                    )
                  }
                >
                  <IconExternalLink size={'1rem'} stroke={1} />
                </ActionIcon>
                <ActionIcon onClick={() => layout.delete()}>
                  <IconTrash stroke={1} size={'1rem'} />
                </ActionIcon>
              </Group>
            );
          }}
        />
        <ItemsList
          props={props}
          h={200}
          items={widgetWraps}
          rightSection={(layout) => (
            <Group gap={4}>
              <Badge size={'xs'} color="green">
                {layout.id.get()}
              </Badge>
              <Badge size={'xs'} color="yellow">
                {layout.widget.appId.get()}
              </Badge>
              <Badge size={'xs'} color="yellow">
                {layout.widget.widgetId.get()}
              </Badge>
              <Badge size={'xs'}>{layout.widget.type.get()}</Badge>
              <Button size="xs" onClick={() => handlePushToLayout(layout)}>
                Push to section layout
              </Button>
            </Group>
          )}
        />
        {/* {customWidgetWraps.map((widget: any) => {
          return (
            <div key={widget.key.get()}>
              <Text>
                option A: push custom widget as widget, then use it as a widget (not updated)
              </Text>
              <Text>option B: link custom widget and render directly that (synced)</Text>
              <Button onClick={() => syncCustomWidget(props, 'Google', widget.values[0])}>todo link</Button>
              <Card w={200} bg={'red'}>
                {renderComponentFromJSON(props, widget.values[0])}
              </Card>
            </div>
          );
        })} */}
        <Alert>If match layout, create extra diagrams items of relative widgets</Alert>
        <Button
          disabled={!newLayoutAppId.get() || !newLayoutSection.get() || !!existLayout}
          onClick={handleUpdateLayout}
        >
          update current layout
        </Button>
        <Alert>#TODO: update existing layout or create new section/layout</Alert>
        <Divider />
        selectapp/selectsection then push layout and route to that page
      </Stack>
    </div>
  );
});

export default DiagramLayout;
