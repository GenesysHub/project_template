import multistate_widgets from '../multistates';
import Menu from './Menu';
import { FooterBar } from './FooterBar';
import { SystemBar, SystemSidebar } from './SystemBar';
import { ToolSidebar } from '../multistates/Tools/components';
import {
  DesktopHeader,
  DefaultContent,
  DefaultSidebar,
  DefaultWidget,
} from './Defaults/components';
import GlobalSettings from './GlobalSettings';
import GlobalStyles from './GlobalStyles';
import { ObjectPage } from '../multistates/Diagram/Plugins/DiagramObject/components';
import { IWidgets } from '@genesyshub/core/core/constants';

const widgets: IWidgets = {
  menu: {
    id: 'menu',
    name: 'Menu',
    description: 'Main navigation menu',
    component: (props: any) => <Menu {...props} />,
  },
  systemBar: {
    id: 'systemBar',
    name: 'System Bar',
    description: 'System status and controls',
    component: (props: any) => <SystemBar {...props} />,
  },
  footerBar: {
    id: 'footerBar',
    name: 'Footer Bar',
    description: 'Application footer controls',
    component: (props: any) => <FooterBar {...props} />,
  },
  systemSidebar: {
    id: 'systemSidebar',
    name: 'System Sidebar',
    description: 'System management sidebar',
    component: (props) => <SystemSidebar {...props} />,
  },
  toolsManager: {
    id: 'toolsManager',
    name: 'Tools Sidebar',
    description: 'Tools management sidebar',
    component: (props) => <ToolSidebar {...props} />,
  },
  globalSettings: {
    id: 'globalSettings',
    name: 'Global Settings',
    description: 'Global configuration settings',
    component: (props) => <GlobalSettings {...props} />,
  },
  globalStyles: {
    id: 'globalSettings',
    name: 'Global Styles',
    description: 'Global configuration styles',
    component: (props) => <GlobalStyles {...props} />,
  },
  default_menu: {
    id: 'default_menu',
    name: 'Header Menu',
    description: 'Desktop header menu',
    component: (props: any) => <DesktopHeader {...props} />,
  },
  default_content: {
    id: 'default_content',
    name: 'Default Content',
    description: 'Default content area',
    component: (props: any) => <DefaultContent {...props} />,
  },
  default_sidebar: {
    id: 'default_sidebar',
    name: 'Default Sidebar',
    description: 'Default sidebar',
    component: (props: any) => <DefaultSidebar {...props} />,
  },
  default_widget: {
    id: 'default_widget',
    name: 'Default Widget',
    description: 'Default widget container',
    component: (props: any) => <DefaultWidget {...props} />,
  },
  object_page: {
    id: 'object_page',
    name: 'Object Page',
    description: 'Default page for object management',
    component: (props: any) => <ObjectPage {...props} />,
  },

  ...multistate_widgets,
};
export default widgets;
