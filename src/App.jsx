import { useState } from 'react'
import { useAuth } from './hooks/useAuth.jsx'
import { useFamily } from './hooks/useFamily.js'
import { useProducts } from './hooks/useProducts.js'
import { useUserPrefs } from './hooks/useUserPrefs.js'
import { createProduct, removeProduct, saveProduct } from './lib/products.js'

import LoginScreen from './components/LoginScreen.jsx'
import AccessDeniedScreen from './components/AccessDeniedScreen.jsx'
import DisclaimerScreen from './components/DisclaimerScreen.jsx'
import SearchScreen from './components/SearchScreen.jsx'
import ListScreen from './components/ListScreen.jsx'
import ProductForm from './components/ProductForm.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import BottomNav from './components/BottomNav.jsx'
import { CloudOffIcon, LogoutIcon } from './components/Icons.jsx'

function Splash({ text = 'טוען…' }) {
  return (
    <div className="screen screen--center">
      <div className="splash">
        <span className="spinner" aria-hidden="true" />
        <p>{text}</p>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading: authLoading, error: authError, signIn, signOut } = useAuth()
  const { state: familyState } = useFamily(user)
  const allowed = familyState === 'allowed'

  const { disclaimerAccepted, loading: prefsLoading, acceptDisclaimer } = useUserPrefs(user, allowed)
  const { products, loading: productsLoading, fromCache, counts } = useProducts(allowed)

  const [view, setView] = useState('search')       // search | list
  const [editing, setEditing] = useState(null)     // מוצר בעריכה / טיוטה חדשה
  const [pendingDelete, setPendingDelete] = useState(null)

  if (authLoading) return <Splash />
  if (!user) return <LoginScreen onSignIn={signIn} error={authError} />
  if (familyState === 'checking') return <Splash text="בודק הרשאות…" />
  if (familyState === 'denied' || familyState === 'missing') {
    return (
      <AccessDeniedScreen
        user={user}
        onSignOut={signOut}
        missingFamily={familyState === 'missing'}
      />
    )
  }
  if (prefsLoading) return <Splash />
  if (!disclaimerAccepted) return <DisclaimerScreen onAccept={acceptDisclaimer} />

  function openAdd(prefillName) {
    setEditing({ name: prefillName || '', status: 'contains' })
  }

  async function handleSave(values) {
    if (editing?.id) {
      await saveProduct(editing, values, user)
    } else {
      await createProduct(values, user)
    }
    setEditing(null)
  }

  async function handleDelete() {
    const target = pendingDelete
    setPendingDelete(null)
    if (target) await removeProduct(target.id)
  }

  if (editing) {
    return (
      <div className="app">
        <ProductForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="topbar">
        {fromCache ? (
          <span className="chip chip--offline">
            <CloudOffIcon size={16} />
            מצב לא־מקוון
          </span>
        ) : (
          <span className="chip">{(user.email || '').split('@')[0]}</span>
        )}
        <button type="button" className="icon-btn" onClick={signOut} aria-label="התנתקות">
          <LogoutIcon />
        </button>
      </div>

      {view === 'search' ? (
        <SearchScreen
          products={products}
          loading={productsLoading}
          onAdd={openAdd}
          onEdit={setEditing}
          onDelete={setPendingDelete}
        />
      ) : (
        <ListScreen
          products={products}
          counts={counts}
          onEdit={setEditing}
          onDelete={setPendingDelete}
        />
      )}

      <BottomNav view={view} onNavigate={setView} onAdd={openAdd} />

      {pendingDelete ? (
        <ConfirmDialog
          title="למחוק את המוצר?"
          message={`"${pendingDelete.name}" יימחק מהמאגר המשפחתי. אי אפשר לבטל.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  )
}
