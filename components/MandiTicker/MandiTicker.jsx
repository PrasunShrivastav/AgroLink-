'use client';

import styles from './MandiTicker.module.css';
import { useMandiPrices } from '@/hooks/useMandiPrices';
import { BASE_PRICES } from '@/lib/mandiData';
import { useAuth } from '@/lib/auth-context';

export default function MandiTicker() {
  const { prices, changes, flashing } = useMandiPrices();
  const { user } = useAuth();
  
  if (!user) return null;

  const cropKeys = Object.keys(BASE_PRICES);
  
  // Create a continuous array duplicated for scrolling seamlessly
  const scrollItems = [...cropKeys, ...cropKeys];

  return (
    <div className={styles.tickerContainer}>
      <div className={styles.label}>
        <span className={styles.dot}></span>
        APMC Live
      </div>
      <div className={styles.track}>
        {scrollItems.map((crop, idx) => {
          const currentPrice = prices[crop] || BASE_PRICES[crop].base;
          const change = changes[crop] || { diff: 0, pct: '0.00', direction: 'up' };
          const isUp = change.direction === 'up';
          const isFlashing = flashing[crop];

          return (
            <div key={`${crop}-${idx}`} className={styles.item}>
              <span className={styles.crop}>{crop}</span>
              <span className={`${styles.price} ${isFlashing ? styles.flashItem : ''}`}>
                ₹{currentPrice.toLocaleString('en-IN')}/q
              </span>
              <span className={isUp ? styles.up : styles.down}>
                {isUp ? '▲' : '▼'} {change.pct}%
              </span>
              {idx < scrollItems.length - 1 && <span className={styles.separator}>·</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
