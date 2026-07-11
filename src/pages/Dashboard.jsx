import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [tracks, setTracks] = useState([])
  const [selectedTrack, setSelectedTrack] = useState('')
  const [duration, setDuration] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const fetchTracks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tracks', {
        headers: { authorization: token }
      })
      setTracks(res.data)
    } catch (err) {
      setError('Failed to load tracks')
    }
  }

  useEffect(() => {
    fetchTracks()
  }, [])

  const handleLogSession = async () => {
    if (!selectedTrack || !duration) {
      setError('Please select a track and enter duration')
      return
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tracks/session',
        {
          track_name: selectedTrack,
          duration: parseInt(duration) * 60
        },
        { headers: { authorization: token } }
      )
      setMessage(`✅ Session logged! You earned ${res.data.exp_earned} EXP!`)
      setError('')
      setDuration('')
      fetchTracks()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log session')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const getLevelName = (level) => {
    const levels = {
      1: 'Beginner',
      2: 'Apprentice',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Master'
    }
    return levels[level] || 'Beginner'
  }

  const getNextLevelExp = (level) => {
    const thresholds = { 1: 500, 2: 1000, 3: 2000, 4: 4000, 5: 4000 }
    return thresholds[level] || 500
  }

  const getTrackEmoji = (trackName) => {
    const emojis = { developer: '💻', gamer: '🎮', anime: '🎌' }
    return emojis[trackName] || '📚'
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>📚 Study EXP Tracker</h1>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Logout
        </button>
      </div>

      {/* Track Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {tracks.map(track => (
          <div
            key={track.id}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '20px',
              border: '2px solid #ddd',
              borderRadius: '10px',
              textAlign: 'center',
              backgroundColor: selectedTrack === track.track_name ? '#e8f5e9' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => setSelectedTrack(track.track_name)}
          >
            <h2>{getTrackEmoji(track.track_name)} {track.track_name.charAt(0).toUpperCase() + track.track_name.slice(1)}</h2>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>Level {track.level}</p>
            <p style={{ color: '#666' }}>{getLevelName(track.level)}</p>
            <p style={{ color: '#333' }}>{track.total_exp} / {getNextLevelExp(track.level)} EXP</p>

            {/* EXP Progress Bar */}
            <div style={{ backgroundColor: '#ddd', borderRadius: '10px', height: '10px', marginTop: '10px' }}>
              <div style={{
                backgroundColor: '#4CAF50',
                height: '10px',
                borderRadius: '10px',
                width: `${Math.min((track.total_exp / getNextLevelExp(track.level)) * 100, 100)}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Log Session Form */}
      <div style={{ padding: '20px', border: '2px solid #ddd', borderRadius: '10px' }}>
        <h2>📝 Log Study Session</h2>

        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            style={{ padding: '10px', fontSize: '16px' }}
          >
            <option value="">Select a track...</option>
            <option value="developer">💻 Developer</option>
            <option value="gamer">🎮 Gamer</option>
            <option value="anime">🎌 Anime</option>
          </select>

          <input
            type="number"
            placeholder="Duration in minutes (e.g. 30)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{ padding: '10px', fontSize: '16px' }}
          />

          <button
            onClick={handleLogSession}
            style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Log Session 🚀
          </button>
        </div>
      </div>

    </div>
  )
}

export default Dashboard