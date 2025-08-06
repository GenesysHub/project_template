import { Observable } from '@legendapp/state';
import { DiagramCompact, DiagramItem } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagram = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramItem {...props} />,
  content: () => <DiagramItem {...props} />,
  /* menu: () => <>empty menu</>, */
  diagram: () => <DiagramItem {...props} />,
  diagram_compact: () => <DiagramCompact {...props} />,
});

export default diagram;
