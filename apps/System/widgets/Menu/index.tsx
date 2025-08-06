import { observer } from '@legendapp/state/react';
import multistate_widgets from '../../multistates';

import MultistateContainer from '@genesyshub/core/core/components/MultistateContainer';

const Menu = observer((props) => {
  return <MultistateContainer id={'menu'} props={props} multistate$={multistate_widgets} />;
});

export default Menu;
