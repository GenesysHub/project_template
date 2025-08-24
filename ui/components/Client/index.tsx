'use client'

import { observer } from '@legendapp/state/react';
import { useMantineColorScheme } from '@mantine/core';
import { useEffect } from 'react';
import { Layouts } from '../Draggable/Layouts';
import { setupShortcuts } from './shortcuts';

import { getEnvironment } from '@genesyshub/core/core/enviroment';
import { config$ } from '@genesyshub/core/core/constants';

/*
UPDATE THE LOGIC OF GETLAYOUT
INSTEAD OF PUSH ITEMS IN THE PAGE LAYOUT, USE ALWAYS THE SAME OBJECT LAYOUT,
THAT WILL BE WRITTEN BY PUSHING OR REMOVING ITEMS, BASED ON SECTION LAYOUTS AND SYSTEM LAYOUTS
*/

//const clientContext = observable<any>();
const Client = observer(({ appId }: { appId?: string }) => {

  useEffect(() => {
    getEnvironment();
  }, []);


  useEffect(() => {
    //@ts-ignore
    const shortcutEnabled = config$.settings.mode.shortcut.get();
    if (shortcutEnabled) {
      const cleanup = setupShortcuts();
      return cleanup;
    }
    return () => {};
    //@ts-ignore
  }, [config$.settings.mode.shortcut.get()]);

  const { colorScheme } = useMantineColorScheme();
  useEffect(() => {
    config$.settings.theme.set(colorScheme);
  }, [colorScheme]);

  //The right-click context should be a widget, where each app can have custom, or use the default of the System app.
  // Close menu when clicking outside
  /* useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientContext.show.get() && !(e.target as Element).closest('.context-menu')) {
        clientContext.show.set(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []); */
  return (
    <div
      style={{
        position: 'absolute',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
      }}
      /* onContextMenu={(e) => {
        e.preventDefault();
        clientContext.show.set(true);
        clientContext.x.set(e.clientX);
        clientContext.y.set(e.clientY);
      }} */
    >
      {/* {clientContext.show.get() && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: clientContext.x.get(),
            top: clientContext.y.get(),
            zIndex: 1000000,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
            padding: '5px 0',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <>menu</>
        </div>
      )} */}
      <Layouts />
    </div>
  );
});

export default Client;
