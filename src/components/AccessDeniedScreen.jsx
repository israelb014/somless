// המשתמש התחבר אבל המייל שלו אינו ברשימת ה-members של המשפחה.
import { LogoutIcon, ShieldIcon } from './Icons.jsx'

export default function AccessDeniedScreen({ user, onSignOut, missingFamily }) {
  return (
    <div className="screen screen--center">
      <div className="gate fade-in">
        <div className="gate__mark gate__mark--warn">
          <ShieldIcon size={40} />
        </div>
        <h1 className="gate__title">אין גישה</h1>
        {missingFamily ? (
          <p className="gate__subtitle">
            מסמך המשפחה לא נמצא. הריצו את סקריפט ה-seed כדי ליצור אותו.
          </p>
        ) : (
          <p className="gate__subtitle">
            הכתובת {user?.email} אינה ברשימת המשתמשים המורשים.
          </p>
        )}
        <button type="button" className="btn btn--ghost btn--block" onClick={onSignOut}>
          <LogoutIcon size={18} />
          התנתקות
        </button>
      </div>
    </div>
  )
}
