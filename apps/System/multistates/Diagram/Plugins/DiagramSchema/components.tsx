import { observer } from '@legendapp/state/react';
import {
  ColorInput,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';

import { SelectIcon } from '@genesyshub/core/ui/components/Menu/DynamicIcon';

import { api$ } from '@genesyshub/core/core/layout';
import { getStatus } from '@genesyshub/core/core/utils';

export const DiagramSchema = observer((props) => {
  const api = api$[props.id];
  const status = getStatus(props.id);
  const values = api.values;
  const h = (status.size.h.get() || 300) - 6;

  return (
    <Stack h={h - 40} p="md" m={0}>
      <TextInput
        label="Type"
        value={values.type.get() || ''}
        onChange={(e) => values.type.set(e.currentTarget.value)}
        size="xs"
      />
      <SimpleGrid cols={2}>
        {/* <ColorInput
          label="Color"
          value={values.color.get() || ''}
          onChange={(value) => values.color.set(value)}
          format="hex"
          size="xs"
        /> */}

        <ColorInput
          size="xs"
          format="hex"
          label="Color"
          value={values.color.get() || ''}
          onChange={(value) => values.color.set(value)}
          swatches={[
            '#2e2e2e',
            '#868e96',
            '#fa5252',
            '#e64980',
            '#be4bdb',
            '#7950f2',
            '#4c6ef5',
            '#228be6',
            '#15aabf',
            '#12b886',
            '#40c057',
            '#82c91e',
            '#fab005',
            '#fd7e14',
          ]}
        />

        <SelectIcon iconApi={values.icon} variant="default" label="icon" />
      </SimpleGrid>

      <Textarea
        label="Note"
        value={values.note.get() || ''}
        onChange={(e) => values.note.set(e.currentTarget.value)}
        autosize
        minRows={2}
        maxRows={4}
        size="xs"
      />
    </Stack>
  );
});
