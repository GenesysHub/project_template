import { IApp } from '@genesyshub/core/core/constants';
import { observable } from '@legendapp/state';
import { widgets } from './widgets';
import functions from './tools';

const api$ = observable({});

const menu = {
  key: 'menu',
  type: 'menu',
  widget: { appId: 'System', widgetId: 'default_menu' },
};
const content = {
  key: 'content',
  type: 'content',
  widget: { appId: 'System', widgetId: 'default_content' },
};
const sidebar = {
  key: 'sidebar',
  type: 'sidebar',
  widget: { appId: 'System', widgetId: 'default_sidebar' },
};

const Example: IApp = {
  id: 'TemplateApp',
  name: 'Template example',
  icon: 'IconTestPipe',
  version: '1.0.0',
  api: api$,
  layouts: {
    section: undefined,
    pages: [
      {
        section: undefined,
        label: 'Home',
        icon: 'IconHome',
        layout: [menu, content, sidebar],
      },
    ],
  },

  tools: Object.keys(functions || {}),
  widgets: Object.keys(widgets || {}),

  components: widgets,
  functions: functions,
};

export default Example;
