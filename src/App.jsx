import { useState } from 'react'
import { useProducts } from './hooks/useProducts.js'
import { useDisclaimer } from './hooks/useDisclaimer.js'

import DisclaimerScreen from './components/DisclaimerScreen.jsx'
import SearchScreen from './components/SearchScreen.jsx'
import ListScreen from './components/ListScreen.jsx'
import MyAdditionsScreen from './components/MyAdditionsScreen.jsx'
import ProductForm from './components/ProductForm.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import BottomNav from './components/BottomNav.jsx'

function Splash() {
  return (
    <div className="screen screen--center">
      <div className="splash">
        <span className="spinner" aria-hidden="true" />
        <p>טוען…</p>
      </div>
    </div>
  )
}

export default function App() {
  const { products, local, counts, loading, dbMeta, addLocal, updateLocal, deleteLocal } =
    useProducts()
  const { accepted, accept } = useDisclaimer()

  const [view, setView] = useState('search') // search | list | mine
  const [editing, setEditing] = useState(null) // מוצר בעריכה / טיוטה חדשה
  const [pendingDelete, setPendingDelete] = useState(null)

  if (accepted === null || loading) return <Splash />
  if (!accepted) return <DisclaimerScreen onAccept={accept} />

  function openAdd(prefillName) {
    setEditing({ name: prefillName || '', status: 'contains' })
  }

  async function handleSave(values) {
    if (editing?.id) await updateLocal(editing, values)
    else await addLocal(values)
    setEditing(null)
  }

  async function handleDelete() {
    const target = pendingDelete
    setPendingDelete(null)
    if (target) await deleteLocal(target.id)
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
      {view === 'search' ? (
        <SearchScreen
          products={products}
          onAdd={openAdd}
          onEdit={setEditing}
          onDelete={setPendingDelete}
        />
      ) : null}

      {view === 'list' ? (
        <ListScreen
          products={products}
          counts={counts}
          onEdit={setEditing}
          onDelete={setPendingDelete}
        />
      ) : null}

      {view === 'mine' ? (
        <MyAdditionsScreen
          local={local}
          dbMeta={dbMeta}
          onEdit={setEditing}
          onDelete={setPendingDelete}
        />
      ) : null}

      <BottomNav view={view} onNavigate={setView} onAdd={openAdd} localCount={local.length} />

      {pendingDelete ? (
        <ConfirmDialog
          title="למחוק את ההוספה?"
          message={`"${pendingDelete.name}" יימחק מהמכשיר הזה. אי אפשר לבטל.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  )
}
