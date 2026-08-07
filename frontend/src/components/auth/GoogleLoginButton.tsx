import { useTranslation } from "react-i18next";

const GOOGLE_AUTH_URL = "http://localhost:5000/auth/google";

export default function GoogleLoginButton() {
  const { t } = useTranslation();
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
        {t("auth.signInWithGoogle")}
      </button>
    </div>
  );
}
