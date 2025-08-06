import { Observable } from '@legendapp/state';
import { DiagramPreset } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramPreset = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramPreset {...props} />,
});

export default diagramPreset;
