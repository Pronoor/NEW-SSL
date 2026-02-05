import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import {
  HiUsers,
  HiShieldCheck,
  HiDocumentText,
  HiXCircle,
  HiPlus,
  HiPencilSquare,
  HiTrash,
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './AdminUsers.css'

const emptyUser = { name: '', email: '', password: '', password_confirmation: '', is_admin: false }

function AdminUsers() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const { addToast } = useToast()
  const [modal, setModal] = useState(null) // null | 'add' | { type: 'edit', user } | { type: 'delete', user }
  const [form, setForm] = useState(emptyUser)
  const [formError, setFormError] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users')
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/admin/users', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setModal(null)
      setForm(emptyUser)
      setFormError('')
    },
    onError: (err) => {
      const msg = err.response?.data?.message
      const errors = err.response?.data?.errors
      setFormError(errors ? Object.values(errors).flat().join(', ') : msg || 'Failed to create user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/admin/users/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setModal(null)
      setForm(emptyUser)
      setFormError('')
    },
    onError: (err) => {
      const msg = err.response?.data?.message
      const errors = err.response?.data?.errors
      setFormError(errors ? Object.values(errors).flat().join(', ') : msg || 'Failed to update user')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setModal(null)
      addToast('User deleted successfully.', 'success')
    },
    onError: (err) => {
      const msg = err.response?.data?.message
      const errors = err.response?.data?.errors
      setFormError(errors ? Object.values(errors).flat().join(', ') : msg || 'Failed to delete user')
    },
  })

  const openAdd = () => {
    setForm(emptyUser)
    setFormError('')
    setModal('add')
  }

  const openEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      password_confirmation: '',
      is_admin: u.is_admin,
    })
    setFormError('')
    setModal({ type: 'edit', user: u })
  }

  const openDelete = (u) => {
    setFormError('')
    setModal({ type: 'delete', user: u })
  }

  const closeModal = () => {
    setModal(null)
    setForm(emptyUser)
    setFormError('')
  }

  const handleSubmitAdd = (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError('Name, email and password are required.')
      return
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.password_confirmation) {
      setFormError('Passwords do not match.')
      return
    }
    createMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      password_confirmation: form.password_confirmation,
      is_admin: form.is_admin,
    })
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.')
      return
    }
    if (form.password && form.password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (form.password && form.password !== form.password_confirmation) {
      setFormError('Passwords do not match.')
      return
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      is_admin: form.is_admin,
    }
    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }
    updateMutation.mutate({ id: modal.user.id, payload })
  }

  const handleDelete = () => {
    deleteMutation.mutate(modal.user.id)
  }

  if (isLoading) {
    return (
      <div className="admin-users">
        <div className="admin-loading">
          <ImSpinner2 className="spinner" size={32} />
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-users">
        <div className="admin-error">
          <HiXCircle size={48} />
          <h2>Error loading users</h2>
          <p>{error.response?.data?.message || 'Please try again.'}</p>
        </div>
      </div>
    )
  }

  const users = data.users || []
  const isAdd = modal === 'add'
  const isEdit = modal?.type === 'edit'
  const isDelete = modal?.type === 'delete'

  return (
    <div className="admin-users">
      <div className="admin-page-header admin-page-header-with-action">
        <div>
          <h1>Users</h1>
          <p>All registered users and their SSL certificate count</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
          <HiPlus size={20} />
          Add user
        </button>
      </div>

      <div className="admin-card">
        {users.length === 0 ? (
          <div className="admin-empty">
            <HiUsers size={48} />
            <p>No users yet</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              <HiPlus size={18} />
              Add first user
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Certificates</th>
                  <th>Joined</th>
                  <th className="admin-cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="admin-cell-name">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${u.is_admin ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                        {u.is_admin ? (
                          <>
                            <HiShieldCheck size={14} />
                            Admin
                          </>
                        ) : (
                          'User'
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="admin-cert-count">
                        <HiDocumentText size={16} />
                        {u.certificates_count}
                      </span>
                    </td>
                    <td className="admin-cell-date">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="admin-cell-actions">
                      <button
                        type="button"
                        className="admin-btn-icon"
                        onClick={() => openEdit(u)}
                        title="Edit user"
                      >
                        <HiPencilSquare size={18} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-icon-danger"
                        onClick={() => openDelete(u)}
                        disabled={currentUser?.id === u.id}
                        title={currentUser?.id === u.id ? 'Cannot delete yourself' : 'Delete user'}
                      >
                        <HiTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add user modal */}
      {isAdd && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add user</h2>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">
                <HiXCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="admin-modal-body">
              {formError && (
                <div className="admin-form-error">
                  <HiXCircle size={18} />
                  {formError}
                </div>
              )}
              <div className="admin-form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                  placeholder="Repeat password"
                  minLength={8}
                  required
                />
              </div>
              <div className="admin-form-group admin-form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_admin}
                    onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
                  />
                  <span>Admin user</span>
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <ImSpinner2 className="spinner" size={18} />
                      Creating...
                    </>
                  ) : (
                    'Create user'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {isEdit && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit user</h2>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">
                <HiXCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="admin-modal-body">
              {formError && (
                <div className="admin-form-error">
                  <HiXCircle size={18} />
                  {formError}
                </div>
              )}
              <div className="admin-form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>New password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  minLength={8}
                />
              </div>
              <div className="admin-form-group">
                <label>Confirm new password</label>
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                  placeholder="Repeat if changing"
                  minLength={8}
                />
              </div>
              <div className="admin-form-group admin-form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_admin}
                    onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
                  />
                  <span>Admin user</span>
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <ImSpinner2 className="spinner" size={18} />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {isDelete && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Delete user</h2>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">
                <HiXCircle size={24} />
              </button>
            </div>
            <div className="admin-modal-body">
              {formError && (
                <div className="admin-form-error">
                  <HiXCircle size={18} />
                  {formError}
                </div>
              )}
              <p>
                Are you sure you want to delete <strong>{modal.user.name}</strong> ({modal.user.email})? This cannot be undone.
              </p>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <ImSpinner2 className="spinner" size={18} />
                      Deleting...
                    </>
                  ) : (
                    'Delete user'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
