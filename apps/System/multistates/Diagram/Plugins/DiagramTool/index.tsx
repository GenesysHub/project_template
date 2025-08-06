import { Observable } from '@legendapp/state';
import { DiagramTool } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramTool = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramTool {...props} />,
});

export default diagramTool;
