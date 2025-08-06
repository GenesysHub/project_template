import { Observable } from '@legendapp/state';
import DiagramWidget from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramWidget = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramWidget {...props} />,
});

export default diagramWidget;
