'use client';

import { useState } from 'react';
import styles from './Rating.module.css';

export function StarDisplay({ rating, size = '1.2rem' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={styles.starsWrap}>
      {stars.map((s) => (
        <span
          key={s}
          className={`${styles.star} ${styles.readOnly} ${s <= Math.round(rating) ? styles.filled : ''}`}
          style={{ fontSize: size }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function Rating({ onSubmit }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stars === 0) return;
    onSubmit({ stars, review });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🙏</p>
        <p style={{ fontWeight: 600, color: 'var(--leaf)' }}>Thank you for your honest review!</p>
      </div>
    );
  }

  return (
    <form className={styles.ratingForm} onSubmit={handleSubmit}>
      <div className={styles.starsWrap}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            type="button"
            key={s}
            className={`${styles.star} ${s <= (hover || stars) ? styles.filled : ''}`}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(s)}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className={styles.reviewInput}
        placeholder="Share your experience — was the deal fair? Was the produce as described?"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={stars === 0}>
        Submit Review
      </button>
    </form>
  );
}
