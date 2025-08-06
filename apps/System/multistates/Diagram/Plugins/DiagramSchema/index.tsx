import { Observable } from '@legendapp/state';
import { DiagramSchema } from './components';

import { MultistateReturn } from '@genesyshub/core/core/components/MultistateContainer';
import { IApi } from '@genesyshub/core/core/layout';

const diagramSchema = (props?: Observable<IApi>): MultistateReturn => ({
  default: () => <DiagramSchema {...props} />,
});

export default diagramSchema;
