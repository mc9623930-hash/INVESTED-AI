import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';

export default function GooglePopup() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        setStatus('success');
        // Extract the OAuth credential so the parent window can sign in
        // directly without relying on cross-window localStorage sync
        const credential = GoogleAuthProvider.credentialFromResult(result);
        try {
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'GOOGLE_SIGNIN_SUCCESS',
                credential: {
                  idToken: credential?.idToken ?? null,
                  accessToken: credential?.accessToken ?? null,
                },
              },
              window.location.origin,
            );
          }
        } catch { /* ignore cross-origin errors */ }
        setTimeout(() => { try { window.close(); } catch { /* ignore */ } }, 800);
      })
      .catch((err: { code?: string; message?: string }) => {
        const code = err?.code || '';
        try {
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_SIGNIN_ERROR', code, message: err?.message },
              window.location.origin,
            );
          }
        } catch { /* ignore */ }

        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          window.close();
          return;
        }
        if (code === 'auth/unauthorized-domain') {
          setErrorMsg(
            'This domain is not authorized in Firebase. Go to Firebase Console → Authentication → Settings → Authorized Domains and add this domain.',
          );
        } else {
          setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
        }
        setStatus('error');
      });
  }, []);

  const goToApp = () => {
    window.location.href = '/academy';
  };

  const style: Record<string, React.CSSProperties> = {
    wrap: {
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '14px',
      background: '#f8fafc',
      color: '#1e293b',
      padding: '28px',
      textAlign: 'center',
    },
    icon: { fontSize: '2.5rem', lineHeight: 1 },
    title: { fontWeight: 700, fontSize: '1.1rem', margin: 0 },
    sub: { fontSize: '0.875rem', color: '#64748b', margin: 0, maxWidth: '320px', lineHeight: 1.5 },
    btn: {
      marginTop: '4px',
      padding: '10px 24px',
      background: '#1e3a5f',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.95rem',
    },
    btnGreen: {
      marginTop: '4px',
      padding: '10px 24px',
      background: '#16a34a',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.95rem',
    },
  };

  return (
    <div style={style.wrap}>
      {status === 'loading' && (
        <>
          <div style={style.icon}>🔐</div>
          <p style={style.title}>Signing in with Google…</p>
          <p style={style.sub}>
            Allow the Google sign-in window that just opened. If nothing appeared, check your
            browser's popup blocker.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={style.icon}>✅</div>
          <p style={style.title}>You're signed in!</p>
          <p style={style.sub}>
            Your original tab has been updated. You can close this tab and go back, or continue
            here.
          </p>
          <button style={style.btnGreen} onClick={goToApp}>
            Continue to Academy →
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={style.icon}>❌</div>
          <p style={style.title}>Sign-in failed</p>
          <p style={style.sub}>{errorMsg}</p>
          <button style={style.btn} onClick={() => window.location.reload()}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}
