import { api$ } from "@genesyshub/core/core/layout";
import { getStatus } from "@genesyshub/core/core/utils";

import { observer } from "@legendapp/state/react";
import { Card, Textarea } from "@mantine/core";

export const DiagramNote = observer((props) => {
    const api = api$[props.id];
    const status = getStatus(props.id);
    const values = api.values;
    const h = status.size.h.get() - 6;
  
    return (
      <Card h={h - 40} p={0} m={0}>
        <Textarea
          pl={7}
          variant="unstyled"
          size="xs"
          rows={h / 21}
          defaultValue={values.prompt.get()}
          onChange={(e: any) => values.prompt.set(e.currentTarget.value)}
        />
      </Card>
    );
  });