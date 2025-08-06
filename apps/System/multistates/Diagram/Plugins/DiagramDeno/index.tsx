import { Observable } from '@legendapp/state';
import DiagramDeno, { Menu } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramDeno = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <>deno default content</>,
  menu: () => <Menu {...props} />,
  diagram: () => <DiagramDeno {...props} />,
});

export default diagramDeno;
