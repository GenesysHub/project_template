import { Observable } from '@legendapp/state';
import { DiagramObject } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramObject = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramObject {...props} />,
});

export default diagramObject;
