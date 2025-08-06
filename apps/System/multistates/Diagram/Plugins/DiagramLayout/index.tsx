import { Observable } from '@legendapp/state';
import DiagramLayout from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramLayout = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramLayout {...props} />,
});

export default diagramLayout;
