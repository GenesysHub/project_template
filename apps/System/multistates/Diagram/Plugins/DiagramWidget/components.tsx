import { observer } from '@legendapp/state/react';
import { Group, Select } from '@mantine/core';

import { getParents } from '@genesyshub/core/ui/components/Diagrams';
//import { zone$ } from '@genesyshub/ui/components/Draggable';
import { zone$ } from '@genesyshub/core/core/draggable';

import { api$ } from '@genesyshub/core/core/layout';
import { getApps, Widget } from '@genesyshub/core/core/utils';

const DiagramWidget = observer((props) => {
  const api = api$[props.id];
  const appId = api.widget.appId;
  const widgetId = api.widget.widgetId;
  const type = api.widget.type;

  //this should return the observable...
  const parents_b = getParents(api.inputs, 'builder');
  //#todo nested multi widgets (or use layout)
  //@ts-ignore
  const firstWidgetParent = Object.values(parents_b)[0]?.[0];
  console.log('parents_b', parents_b, firstWidgetParent);
  return (
    <>
      {!widgetId.get() && (
        <Group>
          <Select
            size="xs"
            placeholder="Select type"
            data={zone$.map((zone) => zone.type.get())}
            value={type.get()}
            onChange={(e: any) => type.set(e)}
          />
          <Select
            data={getApps().ids.get()}
            size="xs"
            value={appId.get()}
            onChange={(e: any) => appId.set(e)}
          />
          <Select
            key={appId.get()}
            //data={getApp(appId.get()).app.widgets.get()}
            //@ts-ignore patch to remove
            data={[...new Set(getApp(appId.get()).app.widgets.get())]}
            size="xs"
            value={widgetId.get()}
            onChange={(e: any) => widgetId.set(e)}
          />
        </Group>
      )}

      {/* <Alert>if there there is a linked widget, use that</Alert> */}
      {appId.get() && widgetId.get() && (
        <Widget id={appId.get()} widget={widgetId.get()} config={props} />
      )}

      {/* linked: (maybe just do this directly in the diagram layout!) */}
      {/* <Divider /> */}
      {/* {renderComponentFromJSON(props, observable(firstWidgetParent))} */}
    </>
  );
});

export default DiagramWidget;
