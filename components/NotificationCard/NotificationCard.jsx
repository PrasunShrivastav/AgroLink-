'use client';

import { useState } from 'react';
import styles from './NotificationCard.module.css';

export default function NotificationCard({ icon, message, time }) {
  const [read, setRead] = useState(false);

  return (
    <div
      className={`${styles.notifCard} ${read ? styles.read : ''}`}
      onClick={() => setRead(true)}
    >
      <span className={styles.icon}>{icon}</span>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        <p className={styles.time}>{time}</p>
      </div>
    </div>
  );
}
