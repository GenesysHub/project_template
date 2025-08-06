import { Observable } from '@legendapp/state';
import { ToolSidebar, ToolsPage } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const tools = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <ToolsPage {...props} />,
  left: () => <ToolSidebar {...props} />,
});

export default tools;
