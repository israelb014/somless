// מסך התחברות (Google Sign-In). הגישה מוגבלת ל-whitelist ב-Security Rules.
import { GoogleIcon, ShieldIcon } from './Icons.jsx'

export default function LoginScreen({ onSignIn, error }) {
  return (
    <div className="screen screen--center">
      <div className="gate fade-in">
        <div className="gate__mark">
          <ShieldIcon size={40} />
        </div>
        <h1 className="gate__title">סומלס</h1>
        <p className="gate__subtitle">בדיקה מהירה: יש בזה שומשום?</p>
        <button type="button" className="btn btn--google" onClick={onSignIn}>
          <GoogleIcon size={20} />
          התחברות עם Google
        </button>
        {error ? <p className="form__error">{error}</p> : null}
        <p className="gate__note">הגישה מוגבלת לחשבונות המשפחה בלבד.</p>
      </div>
    </div>
  )
}
