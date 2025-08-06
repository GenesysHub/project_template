import widgets from './widgets';
import { observable } from '@legendapp/state';
import { nanoid } from 'nanoid';
import { toolSidebar$ } from './multistates/Tools/components';
import tools from './multistates/Tools';

import { createDiagramItem } from '@genesyshub/core/ui/components/Diagrams/utils';

import { IApp } from '@genesyshub/core/core/constants';
import { api$ } from '@genesyshub/core/core/layout';
import { new$ } from '@genesyshub/core/core/utils';

const System$ = observable({
  diagrams: {
    default: 'demo',
    list: {
      demo: [
        {
          key: 'KLyNyz',
          type: 'diagram',
          widget: {
            appId: 'System',
            widgetId: 'diagram',
          },
          values: {
            prompt: 'Hello!',
          },
          config: {
            variant: 'note',
          },
          inputs: ['aWZahA'],
          status: {
            position: {
              x: 100,
              y: 100,
            },
          },
        },
        {
          key: 'aWZahA',
          type: 'diagram',
          widget: {
            appId: 'System',
            widgetId: 'diagram',
          },
        },
        {
          key: 'sViXoS',
          type: 'diagram_compact',
          widget: {
            appId: 'System',
            widgetId: 'diagram',
          },
        },
      ],
      demo2: [
        {
          key: '000',
          type: 'diagram',
          widget: {
            appId: 'System',
            widgetId: 'diagram',
          },
        },
      ],
    },
  },
  toolSidebar$,
});

const functions = {
  //search
  ...tools,

  //system
  updateDocument: {
    name: 'updateDocument',
    description: 'Update diagram document item with new text content using the provided item ID.',
    call: (input: { id: string; text: string }) => {
      const { id, text } = input;
      api$[id].documents.set(text);
      return text;
    },
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the document item to update',
        },
        text: {
          type: 'string',
          description: 'The new text content to set for the document item',
        },
      },
      required: ['id', 'text'],
      example: {
        id: 'document-item-123',
        text: 'Updated content goes here',
      },
    },
  },
  createApp: {
    name: 'createApp',
    description: 'Return the portfolio value',
    call: async (input: { value: string }) => {
      const { value } = input;
      console.log('createApp demo: ', value);
      return value;
    },
    parameters: {
      type: 'object',
      properties: {
        value: {
          id: 'value',
          type: 'string',
          description: 'test value to log',
        },
      },
      example: {
        value: 'hello',
      },
      required: [],
    },
  },
  newLayout: {
    name: 'newLayout',
    description: 'Create new layout item',
    call: async (input: {
      id: string;
      type: string;
      appId: string;
      widgetId: string;
      name: string;
    }) => {
      const { id, type, appId, widgetId, name } = input;
      new$({
        custom_key: id || nanoid(6),
        type: type || 'window',
        appId: appId || 'builder',
        widgetId: widgetId || 'new',
        name: name || `Test new item`,
      });
    },
    parameters: {
      type: 'object',
      properties: {
        id: {
          //id: 'id',
          type: 'string',
          description: 'Type of the layout',
        },
        type: {
          //id: 'type',
          type: 'string',
          description: 'Type of the layout',
        },
        appId: {
          //id: 'appId',
          type: 'string',
          description: 'App id',
        },
        widgetId: {
          //id: 'widgetId',
          type: 'string',
          description: 'Widget id',
        },
        name: {
          //id: 'name',
          type: 'string',
          description: 'Name of the item',
        },
      },
      example: {
        type: 'window',
      },
      required: [],
    },
  },
  createDiagramItem: {
    name: 'createDiagramItem',
    description: 'Create diagram item',
    call: async (input: {
      id: string;
      type?: string;
      name?: string;
      variant?: string;
      toolName?: string;
    }) => {
      //const { createDiagramItem } = await import('./multistates/Diagram/components');
      const { id, variant, toolName } = input;

      createDiagramItem({
        id,
        config: { variant },
      });

      console.log('ua0yisdokjasd', id, variant, toolName);

      if (toolName) {
        api$[id].tools.push({
          tool: toolName,
          props: {},
          show: {
            '0': true,
          },
        });
      }
    },
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier for the diagram item',
        },
        type: {
          type: 'string',
          description: 'Type of the diagram item',
        },
        name: {
          type: 'string',
          description: 'Name of the item',
        },
        variant: {
          type: 'string',
          enum: ['tool', 'component', 'api', 'object', 'widget'],
          description: 'Variant type of the item (tool, component, api, object, or widget)',
        },
        toolName: {
          type: 'string',
          description: 'Name of the tool to associate with the item',
        },
      },
      required: ['id'],
      example: {
        id: 'item1',
        type: 'window',
        variant: 'tool',
        toolName: 'editor',
      },
    },
  },
};


const menu = {
  key: 'system_menu',
  type: 'menu',
  widget: { appId: 'System', widgetId: 'menu' },
};
const content = {
  key: 'system_content',
  type: 'content',
  widget: { appId: 'System', widgetId: 'app' },
};

const System: IApp = {
  id: 'System',
  name: 'System App',
  icon: 'IconCurrency',
  version: '1.0.0',
  api: System$,
  layouts: {
    section: undefined,
    pages: [
      {
        section: undefined,
        label: 'Home',
        icon: 'IconHome',
        layout: [menu, content]
      },
      {
        section: 'settings',
        label: 'Settings',
        icon: 'IconSettings',
        layout: [menu, content]
      },
      {
        section: 'deno',
        label: 'Deno',
        icon: 'IconHome',
        layout: [menu, content]
      },
    ],
  },

  widgets: Object.keys(widgets),
  components: widgets,

  tools: Object.keys(functions),
  functions,
};

export default System;
