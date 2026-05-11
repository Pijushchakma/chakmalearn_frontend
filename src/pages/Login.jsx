import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChakmaText from '../components/ChakmaText'

export default function Login() {
  const [mode,     setMode]     = useState('login')
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/50 mb-5">
            <ChakmaText size="base" className="text-white">𑄌𑄟𑄴𑄟</ChakmaText>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">ChakmaLearn</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Learn the Chakma script · Ajhā Pāṭh</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-black/5 dark:shadow-black/40 p-8">
          {/* Tab switch */}
          <div className="flex mb-6 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
            {[['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username" value={username} onChange={setUsername} autoComplete="username" />
            {mode === 'register' && (
              <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            )}
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl px-3.5 py-3">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200/60 dark:shadow-indigo-900/40 cursor-pointer mt-2"
            >
              {loading ? '…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
          Thesis research project · BUET CSE
        </p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, autoComplete }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 tracking-widest uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700 transition-all"
      />
    </div>
  )
}
