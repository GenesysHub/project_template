import { Observable } from '@legendapp/state';
import { MultistateReturn } from '@genesyshub/core/UI/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';
import App from './App';
import Menu from '../Menu/Menu';

const app = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <App {...props} />,
  //menu: () => <Menu {...props} />,
});

export default app;
