'use client';

import { observer } from '@legendapp/state/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, MantineProvider } from '@mantine/core';
import { ReactNode } from 'react';

//core
import { config$ } from '@genesyshub/core/core/constants';

const queryClient = new QueryClient();

export const Providers = observer(({ children }: { children: ReactNode }) => {
  const dark = config$.settings.theme.get() === 'dark';

  const theme = createTheme({
    focusRing: 'auto',
    defaultRadius: '8px',
    components: {
      Anchor: {
        defaultProps: {
          c: dark ? 'white' : 'gray.7',
        },
      },
      ActionIcon: {
        defaultProps: {
          variant: 'transparent',
          color: dark ? 'white' : 'dark',
        },
      },
      PopoverDropdown: {
        defaultProps: {
          p: 4,
          m: 0,
        },
      },
      Card: {
        defaultProps: {
          p: 4,
          m: 0,
          style: { overflow: 'unset', position: 'unset' },
        },
      },
      Drawer: {
        defaultProps: {
          styles: {
            content: {
              background: dark ? undefined : '#dee2e6',
            },
          },
        },
      },
      Badge: {
        defaultProps: {
          radius: 4,
          size: 'xs',
          variant: 'light',
          color: 'gray',
        },
      },
      Stack: {
        defaultProps: {
          gap: 6,
        },
      },
      Group: {
        styles: {
          root: {
            backgroundColor: 'transparent',
          },
        },
        defaultProps: {
          gap: 'md',
          justify: 'row',
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
});
