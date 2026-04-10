import Link from 'next/link';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1>Forgot Password</h1>
                <p className={styles.subtitle}>
                    Enter your registered phone number to recover your account. We will contact you with reset instructions.
                </p>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" maxLength={10} placeholder="Enter your phone number" />
                </div>

                <button type="button" className={`btn-primary ${styles.submitBtn}`}>
                    Send Recovery Instructions
                </button>

                <p className={styles.switchLink} style={{ marginTop: '1rem' }}>
                    Remembered your password? <Link href="/login">Go back to login</Link>
                </p>
            </div>
        </div>
    );
}
