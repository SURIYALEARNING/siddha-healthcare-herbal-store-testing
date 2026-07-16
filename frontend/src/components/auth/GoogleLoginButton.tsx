const GOOGLE_AUTH_URL = "http://localhost:5000/auth/google";

export default function GoogleLoginButton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
      <button
        onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
