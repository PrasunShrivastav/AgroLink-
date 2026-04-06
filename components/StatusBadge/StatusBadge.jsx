import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }) {
  const key = status?.replace(/\s+/g, '_').toLowerCase() || 'pending';
  return (
    <span className={`${styles.badge} ${styles[key] || styles.pending}`}>
      {status?.replace(/_/g, ' ') || 'Pending'}
    </span>
  );
}
