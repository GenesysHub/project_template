import '@genesyshub/core/styles';

import { ReactNode } from 'react';
import { Providers } from './components/providers';
import SplashCursor from '@genesyshub/core/UI/ReactBits/splashcursor';
/* import { Notifications } from '@mantine/notifications';
 */
const metadata = {
  title: 'Your App',
};

/* const NotificationsComponent = () => {
  return (
    <Notifications
      position="bottom-left"
      variant="outline"
      onClick={(event) => {
        //@ts-ignore
        if (event.target.nodeName === 'svg') {
          return;
        }
      }}
      maw={280}
    />
  );
}; */

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          {/* <NotificationsComponent /> */}
        </Providers>
        <SplashCursor />
      </body>
    </html>
  );
}
