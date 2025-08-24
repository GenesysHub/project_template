'use client';

import {
  ActionIconVariant,
  Button,
  Group,
  MantineColor,
  MantineSize,
  Tooltip,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';

export const ActiveButton = ({
  icon,
  iconActive,
  color,
  colorActive,
  onClick,
  size,
  buttonSize,
  tooltip,
  variant,
  variantActive,
  disabled,
  label,
  confirmLabel,
  fullWidth,
}: //className,
{
  icon?: React.ReactNode;
  iconActive?: React.ReactNode;
  onClick?: () => Promise<void>;
  color?: MantineColor;
  colorActive?: MantineColor;
  size?: MantineSize;
  buttonSize?: MantineSize | (string & {}) | number;
  tooltip?: string;
  variant?: ActionIconVariant;
  variantActive?: ActionIconVariant;
  disabled?: boolean;
  label?: string;
  confirmLabel?: string;
  fullWidth?: boolean;
}) => {
  const [active, setActive] = useState(false);

  const [loading, setLoading] = useState(false);
  async function handleOnClick() {
    setLoading(true);
    if (onClick) {
      await onClick();
      setActive(false);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setActive(false);
    }
    setLoading(false);
  }

  const { ref, width } = useElementSize();
  const activeButtonWidth = width / 3 - 4;
  const mainButtonWidth = active ? (width / 3) * 2 - 4 : '100%';

  return (
    <>
      <Group justify="space-between" ref={ref} gap={4}>
        {active && (
          <Tooltip color={'gray'} label={`Nope, go back`}>
            <Button
              disabled={loading}
              w={activeButtonWidth}
              size={size}
              color="gray"
              variant="light"
              onClick={(e: any) => {
                e.stopPropagation();
                setActive(false);
              }}
            >
              <IconX size={buttonSize || '1.1rem'} />
            </Button>
          </Tooltip>
        )}
        <Button
          w={mainButtonWidth}
          fullWidth={active ? false : fullWidth}
          size={size}
          disabled={disabled}
          loading={loading}
          color={active ? colorActive || 'red' : color || 'blue'}
          variant={active ? variantActive || 'light' : variant || 'light'}
          onClick={async (e: any) => {
            e.stopPropagation();
            active ? await handleOnClick() : setActive(true);
          }}
        >
          {active ? (
            <Tooltip
              color={active ? colorActive || 'red' : color || 'blue'}
              label={tooltip || 'Proceed'}
            >
              <div>{iconActive ? iconActive : confirmLabel}</div>
            </Tooltip>
          ) : icon ? (
            icon
          ) : (
            label
          )}
        </Button>
      </Group>
    </>
  );
};
