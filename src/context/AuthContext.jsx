import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  // null = unknown (fetching), false = not taken, true = taken
  const [pretestDone, setPretestDone] = useState(null)

  const checkPretest = useCallback(async () => {
    try {
      const { data } = await api.get('/alphabet-quiz/status')
      setPretestDone(data.has_pretest)
    } catch {
      setPretestDone(false)
    }
  }, [])

  // Fetch pretest status whenever user changes (login/logout)
  useEffect(() => {
    if (user) {
      checkPretest()
    } else {
      setPretestDone(null)
    }
  }, [user, checkPretest])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', data.access_token)
    const userObj = { username }
    localStorage.setItem('user', JSON.stringify(userObj))
    setUser(userObj)
  }, [])

  const register = useCallback(async (username, email, password) => {
    await api.post('/auth/register', { username, email, password })
    await login(username, password)
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setPretestDone(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, pretestDone, checkPretest, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
