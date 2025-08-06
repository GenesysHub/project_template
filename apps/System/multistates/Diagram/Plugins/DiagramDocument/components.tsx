import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { Suspense } from 'react';

import TextEditor from '@genesyshub/core/ui/components/TextEditor';
import { api$ } from '@genesyshub/core/core/layout';

export const DiagramDocument = observer((props) => {
  const content$ = api$[props.id].documents;
  return (
    <div key={content$.get()}>
      <Suspense fallback={null}>
        <TextEditor id={props.id} content$={content$} editable={observable(true)} />
      </Suspense>
    </div>
  );
});
