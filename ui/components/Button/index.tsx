'use client';

import { background$ } from '@genesyshub/core/core/background';
import { config$ } from '@genesyshub/core/core/constants';
import { api$ } from '@genesyshub/core/core/layout';
import { useTool } from '@genesyshub/core/core/Tools/run';

import { observer } from '@legendapp/state/react';
import { Alert, ButtonProps, Button as MantineButton, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

/* const Button = observer((props: ButtonProps | any) => {
  const { onClick, ...rest } = props;
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const tool =
      typeof onClick === 'string' &&
      !!api$[onClick].get();
    console.log('clicked event', onClick, event);
    if (onClick) {
      try {
        setSuccess(false);
        setLoading(true);
        background$.error.set(false);
        background$.loading.set(true);
        setError(null); // Reset error state before execution.
        if (tool) {
          await useTool(onClick, event, props);
          //await runTools(onClick);
        } else {
          await onClick(event);
        }
        setSuccess(true); // Mark as successful if no error occurs.
      } catch (err: any) {
        setError(err?.message || 'An error occurred'); // Handle error with a message.
        background$.error.set(true);
        console.log('error:', error);
        setSuccess(false); // Mark as not successful.
      } finally {
        background$.loading.set(false);
        setLoading(false); // Always reset loading state.
      }
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false); // Reset success to false, which will switch color back to blue
      }, 400);

      return () => clearTimeout(timer); // Clean up the timer if the component unmounts or success changes
    }
  }, [success]);

  const dark = config$.settings.theme.get() === 'dark';
  const color = error
    ? 'red'
    : success
    ? 'green'
    : props.color
    ? props.color
    : dark
    ? '#fff'
    : 'dark';
  const c = props.color ? undefined : !dark ? '#fff' : 'dark';
  return (
    <>
      <MantineButton
        {...rest}
        style={{
          transition: 'background-color 0.2s ease',
        }}
        color={color}
        c={c}
        error={error}
        loading={props?.loading || loading}
        onClick={handleClick}
      />
      {error && (
        <Alert p={4} color="red" mt={4}>
          <Text c={'red'} size={'xs'}>
            {error}
          </Text>
        </Alert>
      )}
    </>
  );
}); */
const Button = observer((props: ButtonProps | any) => {
  const { onClick, ...rest } = props;
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const tool = typeof onClick === 'string' && !!api$[onClick]?.get();

    if (onClick) {
      try {
        setSuccess(false);
        setLoading(true);
        background$.error.set(false);
        background$.loading.set(true);
        setError(null);

        if (tool) {
          await useTool(onClick, event, props);
        } else {
          const result = onClick(event);

          // Check if this is a streaming function that returns an object with status
          if (result && typeof result.then === 'function') {
            // It's a promise - await it normally
            await result;
          } else if (result && result.status === 'streaming_started') {
            // This is a streaming function that started successfully
            // Complete loading immediately without waiting
            setSuccess(true);
            background$.loading.set(false);
            setLoading(false);
            return; // Exit early
          }
        }

        setSuccess(true);
      } catch (err: any) {
        // Ignore timeout errors from streaming operations
        if (!err?.message?.includes('timed out') && !err?.message?.includes('timeout')) {
          setError(err?.message || 'An error occurred');
          background$.error.set(true);
          console.log('error:', err);
        }
        setSuccess(false);
      } finally {
        background$.loading.set(false);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const dark = config$.settings.theme.get() === 'dark';
  const color = error
    ? 'red'
    : success
    ? 'green'
    : props.color
    ? props.color
    : dark
    ? '#fff'
    : 'dark';
  const c = props.color ? undefined : !dark ? '#fff' : 'dark';

  return (
    <>
      <MantineButton
        {...rest}
        style={{
          transition: 'background-color 0.2s ease',
        }}
        color={color}
        c={c}
        error={error}
        loading={props?.loading || loading}
        onClick={handleClick}
      />
      {error && (
        <Alert p={4} color="red" mt={4}>
          <Text c={'red'} size={'xs'}>
            {error}
          </Text>
        </Alert>
      )}
    </>
  );
});
export default Button;
