import { observable } from '@legendapp/state';
import app from './App';
import deno from './Diagram/Plugins/DiagramDeno';
import settings from './Settings';
import tools from './Tools';
import diagram from './Diagram';
import diagramWidget from './Diagram/Plugins/DiagramWidget';

import MultistateContainer from '@genesyshub/core/core/components/MultistateContainer';

const multistate$ = observable({
  app: {
    id: 'app',
    name: 'Application',
    description: 'Main application component',
    component: (props: any) => app(props),
  },
  tools: {
    id: 'tools',
    name: 'Tools Manager',
    description: 'Tools management interface',
    component: (props: any) => tools(props),
  },
  diagram: {
    id: 'diagram',
    name: 'Diagram',
    description: 'Diagram visualization component',
    component: (props: any) => diagram(props),
  },
  
  //diagram widget plugins
  diagramWidget: {
    id: 'diagramWidget',
    name: 'DiagramWidget',
    description: 'Diagram widget render',
    component: (props: any) => diagramWidget(props),
  },

  deno: {
    id: 'deno',
    name: 'Deno',
    description: 'Deno serverless functions',
    component: (props: any) => deno(props),
  },
  
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'General system settings',
    component: (props: any) => settings(props),
  },
});

export const multistate_widgets = Object.fromEntries(
  Object.entries(multistate$).map(([id, widget]) => [
    id,
    {
      ...widget,
      component: (props: any) => (
        <MultistateContainer id={id} props={props} multistate$={multistate$} />
      ),
    },
  ]),
);

export default multistate_widgets;
