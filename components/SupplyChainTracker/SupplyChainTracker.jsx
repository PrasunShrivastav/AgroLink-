'use client';

import styles from './SupplyChainTracker.module.css';

export default function SupplyChainTracker({ steps, onAdvance, readOnly = false }) {
  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const statusIcons = { complete: '✅', active: '🔄', pending: '⬜' };

  return (
    <div className={styles.tracker}>
      {steps.map((step, i) => {
        const lineBeforeClass =
          i === 0
            ? ''
            : step.status === 'complete' || step.status === 'active'
              ? styles.completeLine
              : '';

        const lineAfterClass =
          i === steps.length - 1
            ? ''
            : step.status === 'complete'
              ? styles.completeLine
              : step.status === 'active'
                ? styles.activeLine
                : '';

        return (
          <div key={i} className={styles.step}>
            <div className={styles.dotRow}>
              {i > 0 && <div className={`${styles.line} ${lineBeforeClass}`} />}
              <div className={`${styles.dot} ${styles[step.status]}`}>
                {statusIcons[step.status]}
              </div>
              {i < steps.length - 1 && <div className={`${styles.line} ${lineAfterClass}`} />}
            </div>
            <span className={styles.label}>{step.label}</span>
            {step.timestamp && <span className={styles.timestamp}>{formatDate(step.timestamp)}</span>}
            {!readOnly && step.status === 'active' && onAdvance && (
              <button className={`btn-primary ${styles.actionBtn}`} onClick={() => onAdvance(i)}>
                Mark {step.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
