import { useState } from 'react'
import './AdminLogin.css'

function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    const correctPassword = '37083708'

    if (password === correctPassword) {
      setError('')
      onLoginSuccess()
    } else {
      setError('비밀번호가 틀렸습니다')
      setPassword('')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>관리자 로그인</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit">로그인</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}

export default AdminLogin
