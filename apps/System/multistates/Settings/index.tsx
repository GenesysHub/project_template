import { Observable } from '@legendapp/state';
import Settings, { Menu } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const settings = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <Settings {...props} />,
  menu: () => <Menu {...props} />,
});

export default settings;
