import { Observable } from '@legendapp/state';
import System, { Menu } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const app = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <System {...props} />,
  menu: () => <Menu {...props} />,
});

export default app;
