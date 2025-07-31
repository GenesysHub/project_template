import { Observable } from '@legendapp/state';
import { MultistateReturn } from '@genesyshub/core/UI/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';
import Sidebar from './Sidebar';

const sidebar = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <Sidebar {...props} />,
});

export default sidebar;
