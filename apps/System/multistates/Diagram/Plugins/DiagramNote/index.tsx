import { Observable } from '@legendapp/state';
import { DiagramNote } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramNote = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramNote {...props} />,
});

export default diagramNote;
