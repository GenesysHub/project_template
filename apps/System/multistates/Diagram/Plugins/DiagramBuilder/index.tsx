import { Observable } from '@legendapp/state';
import { DiagramBuilder } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramBuilder = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramBuilder {...props} />,
});

export default diagramBuilder;
