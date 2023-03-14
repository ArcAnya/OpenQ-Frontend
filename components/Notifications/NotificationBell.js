import React, { useRef, useState } from 'react';

import { KnockFeedProvider, NotificationIconButton, NotificationFeedPopover } from '@knocklabs/react-notification-feed';

import '@knocklabs/react-notification-feed/dist/index.css';

const notificationClicked = (item) => {
  const { bountyId, bountyAddress } = item.data;
  window.location.href = `https://openq.dev/contract/${bountyId}/${bountyAddress}`;
};

const NotificationBell = ({ userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  return (
    <KnockFeedProvider
      apiKey={process.env.NEXT_PUBLIC_NOTIFICATIONS_PUBLIC_KEY}
      feedId={process.env.NEXT_PUBLIC_NOTIFICATIONS_CHANNEL_ID}
      userId={userId}
    >
      <>
        <NotificationIconButton ref={notifButtonRef} onClick={() => setIsVisible(!isVisible)} />
        <NotificationFeedPopover
          buttonRef={notifButtonRef}
          isVisible={isVisible}
          onNotificationClick={(item) => notificationClicked(item)}
          onClose={() => setIsVisible(false)}
        />
      </>
    </KnockFeedProvider>
  );
};

export default NotificationBell;
