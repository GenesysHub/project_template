import { observable } from '@legendapp/state';
import MultistateContainer from '@genesyshub/core/UI/MultistateContainer';
import app from './app/components/App';
import { IWidgets } from '@genesyshub/core/core/constants';
import menu from './app/components/Menu';
import sidebar from './app/components/Sidebar';

const multistate$ = observable({
  app: {
    name: 'Template homepage',
    description: 'Template home page',
    component: (props: any) => app(props),
  },
  menu: {
    name: 'Template menu',
    description: 'Template menu bar',
    component: (props: any) => menu(props),
  },
  sidebar: {
    name: 'Template sidebar',
    description: 'Template menu bar',
    component: (props: any) => sidebar(props),
  },
});

export const widgets: IWidgets = {
  ...Object.fromEntries(
    Object.entries(multistate$).map(([id, widget]) => [
      id,
      {
        ...widget,
        component: (props: any) => (
          <MultistateContainer id={id} props={props} multistate$={multistate$} />
        ),
      },
    ]),
  ),
};
