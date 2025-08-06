import { Observable } from '@legendapp/state';
import { DiagramDocument } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramDocument = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramDocument {...props} />,
});

export default diagramDocument;
