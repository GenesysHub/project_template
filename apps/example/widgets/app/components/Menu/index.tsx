import { Observable } from '@legendapp/state';
import { MultistateReturn } from '@genesyshub/core/UI/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';
import Menu from './Menu';

const menu = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <Menu {...props} />,
});

export default menu;
