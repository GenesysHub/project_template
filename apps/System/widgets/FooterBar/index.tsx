import { observer } from "@legendapp/state/react";
import { Stack } from "@mantine/core";
import HelpButtons from "./HelpButtons";
import { getStatus } from "@genesyshub/core/core/utils";

export const FooterBar = observer((props) => {
    return (
      <Stack
        gap={4}
        justify="center"
        align="center"
        className={'drag'}
        h={getStatus(props.id).size.h.get() - 2}
      >
        <HelpButtons {...props} />
      </Stack>
    );
  });