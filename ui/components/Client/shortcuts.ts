// shortcuts.ts
import { config$ } from "@genesyshub/core/core/constants";

// ==================== TYPES ====================
type MouseButton = `mouse${1 | 2 | 3 | 4 | 5}`;
type StandardKey = string;

type Modifiers = {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  win?: boolean;
};

type KeyCombo = {
  modifiers?: Modifiers;
  keys: Array<StandardKey | MouseButton>;
};

type ShortcutDefinition = {
  combo: KeyCombo;
  setting?: keyof typeof config$.settings.show | any;
  actionName?: string;
};

type ActionHandlers = {
  toggleSetting: (setting: keyof typeof config$.settings.show) => void;
  openContextMenu: () => void;
  logAction: (message: string) => void;
};

// ==================== SHORTCUT DEFINITIONS ====================
const shortcutDefinitions: Record<string, ShortcutDefinition> = {
  system: {
    combo: {
      modifiers: { ctrl: true },
      keys: ['z'],
    },
    setting: 'system',
  },
  diagram: {
    combo: {
      modifiers: { ctrl: true },
      keys: ['x'],
    },
    setting: 'diagram',
  },
  window: {
    combo: {
      modifiers: { ctrl: true },
      keys: ['c'],
    },
    setting: 'window',
  },
  layout: {
    combo: {
      modifiers: { ctrl: true },
      keys: ['v'],
    },
    setting: 'layout',
  },
  background: {
    combo: {
      modifiers: { ctrl: true },
      keys: ['b'],
    },
    setting: 'background',
  },
  /// to test/set all below
  mouseAction: {
    combo: {
      modifiers: { ctrl: true },
      keys: ['mouse1'],
    },
    actionName: 'openContextMenu',
  },
  debug: {
    combo: {
      modifiers: { ctrl: true },
      keys: ['f1'],
    },
    actionName: 'logAction',
  },
};

// ==================== ACTION HANDLERS ====================
const actionHandlers: ActionHandlers = {
  toggleSetting: (setting) => {
    const display: any = config$.settings.show[setting];
    display.set(!display.get());
    console.log(`${display.get() ? 'Hide' : 'Display'} ${setting}`);
  },
  openContextMenu: () => {
    console.log('Context menu opened');
  },
  logAction: () => {
    console.debug('Debug action triggered');
  },
};

// ==================== SHORTCUT SETUP ====================
function checkModifiers(modifiers: Modifiers | undefined, e: KeyboardEvent | MouseEvent): boolean {
  if (!modifiers) return true;
  return (
    (modifiers.ctrl === undefined || modifiers.ctrl === e.ctrlKey) &&
    (modifiers.shift === undefined || modifiers.shift === e.shiftKey) &&
    (modifiers.alt === undefined || modifiers.alt === e.altKey) &&
    (modifiers.meta === undefined || modifiers.meta === e.metaKey) &&
    (modifiers.win === undefined || modifiers.win === e.metaKey)
  );
}

export const setupShortcuts = () => {
  const handleKeyDown = (e: KeyboardEvent | MouseEvent) => {
    const key =
      'key' in e
        ? e.key.toLowerCase()
        : 'button' in e
        ? (`mouse${e.button + 1}` as MouseButton)
        : undefined;

    if (!key) return;

    for (const [name, def] of Object.entries(shortcutDefinitions)) {
      if (checkModifiers(def.combo.modifiers, e) && def.combo.keys.includes(key)) {
       // e.preventDefault();

        // Execute the appropriate action
        if (def.setting) {
          actionHandlers.toggleSetting(def.setting);
        } else if (def.actionName) {
          const handler: any = actionHandlers[def.actionName as keyof ActionHandlers];
          if (typeof handler === 'function') {
            // Special case for actions with parameters
            if (def.actionName === 'logAction') {
              (handler as (message: string) => void)(`Shortcut "${name}" triggered`);
            } else {
              handler();
            }
          }
        }
        break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('mousedown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('mousedown', handleKeyDown);
  };
};

// ==================== USAGE ====================
// useEffect(() => {
//   const cleanup = setupShortcuts();
//   return cleanup;
// }, []);
