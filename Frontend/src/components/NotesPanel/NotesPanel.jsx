import React, { useEffect, useRef, useState } from 'react'
import styles from './NotesPanel.module.css'
import { notesApi } from '../../utils/api.js'

export default function NotesPanel({ pdfId, page }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState(null) // 'text' or 'audio'
  const [text, setText] = useState('')
  const [items, setItems] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [showAllPages, setShowAllPages] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { (async () => setItems(await notesApi.list(pdfId)))() }, [pdfId])

  // Filter notes by current page or show all
  const filteredItems = showAllPages ? items : items.filter(item => item.page === page)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const saveText = async () => {
    if (!text.trim()) return
    const saved = await notesApi.create({ type: 'text', content: text, page: page || 1, pdfId })
    setItems((x) => [saved, ...x])
    setText('')
    setShowAddModal(false)
    setAddType(null)
  }

  const deleteNote = async (noteId) => {
    await notesApi.delete(noteId)
    setItems((x) => x.filter(item => item._id !== noteId))
  }

  const startEdit = (note) => {
    setEditingId(note._id)
    setEditText(note.content)
  }

  const saveEdit = async (noteId) => {
    await notesApi.update(noteId, { content: editText })
    setItems((x) => x.map(item => item._id === noteId ? { ...item, content: editText } : item))
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const startRec = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // prepare chunks
      chunksRef.current = []

      // prefer codecs when available
      let options = undefined
      try {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) options = { mimeType: 'audio/webm;codecs=opus' }
          else if (MediaRecorder.isTypeSupported('audio/webm')) options = { mimeType: 'audio/webm' }
          else if (MediaRecorder.isTypeSupported('audio/ogg')) options = { mimeType: 'audio/ogg' }
        }
      } catch (err) {
        // ignore and let constructor choose default
      }

      const rec = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream)

      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onerror = (err) => { console.error('MediaRecorder error', err) }

      rec.onstop = async () => {
        try {
          const blobType = (rec.mimeType && rec.mimeType.includes('webm')) ? 'audio/webm' : 'audio/ogg'
          const blob = new Blob(chunksRef.current, { type: blobType })
          const base64 = await blobToBase64(blob)
          chunksRef.current = []
          const saved = await notesApi.create({ type: 'audio', content: base64, page: page || 1, pdfId })
          setItems((x) => [saved, ...x])
          // Reset recording time only after save is complete
          setRecordingTime(0)
        } catch (err) {
          console.error('Error saving recorded audio', err)
        } finally {
          // stop tracks if streamRef still present
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }
          setShowAddModal(false)
          setAddType(null)
        }
      }

      mediaRecorderRef.current = rec
      rec.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (err) {
      console.error('Could not start recording', err)
      alert('Unable to access microphone. Please check permissions and try again.')
    }
  }

  const stopRec = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      // Stop timer immediately to prevent UI lag
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      // Update UI state immediately
      setIsRecording(false)
      
      // Stop the actual recording
      mediaRecorderRef.current.stop()
    }
  }

  const cancelAdd = () => {
    setShowAddModal(false)
    setAddType(null)
    setText('')
    if (isRecording && mediaRecorderRef.current?.state === 'recording') {
      try {
        mediaRecorderRef.current.stop()
      } catch (err) {
        console.warn('Failed to stop recorder during cancel', err)
      }
      setIsRecording(false)
      setRecordingTime(0)
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach(t => t.stop()) } catch(e){}
        streamRef.current = null
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className={styles.panel}>
      {/* Page Filter Toggle */}
      <div className={styles.filterBar}>
        <button 
          className={`${styles.filterBtn} ${!showAllPages ? styles.active : ''}`}
          onClick={() => setShowAllPages(false)}
          title="Show notes for current page only"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Page {page}
        </button>
        <button 
          className={`${styles.filterBtn} ${showAllPages ? styles.active : ''}`}
          onClick={() => setShowAllPages(true)}
          title="Show all notes"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          All Pages
        </button>
        <div className={styles.noteCount}>
          {showAllPages ? items.length : filteredItems.length} note{(showAllPages ? items.length : filteredItems.length) !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Notes List */}
      <div className={styles.list}> 
        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <p>No notes {!showAllPages ? `on page ${page}` : 'yet'}</p>
            <span>Click the + button to add {!showAllPages ? 'a note to this page' : 'your first note'}</span>
          </div>
        ) : (
          filteredItems.map((n,i) => (
            <div key={n._id || i} className={styles.noteItem}>
              <div className={styles.noteHeader}>
                <div className={styles.meta}>
                  <span className={styles.noteType}>
                    {n.type === 'text' ? '📝' : '🎤'}
                  </span>
                  Page {n.page || 1} · {new Date(n.createdAt||Date.now()).toLocaleString()}
                </div>
                <div className={styles.noteActions}>
                  {n.type === 'text' && (
                    <button 
                      className={styles.iconBtn} 
                      onClick={() => startEdit(n)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                  <button 
                    className={styles.iconBtn} 
                    onClick={() => deleteNote(n._id)}
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>
              {editingId === n._id ? (
                <div className={styles.editArea}>
                  <textarea 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)}
                    className={styles.editTextarea}
                  />
                  <div className={styles.editButtons}>
                    <button className="btn" onClick={() => saveEdit(n._id)}>Save</button>
                    <button className="btn secondary" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                n.type==='text' ? (
                  <div className={styles.noteContent}>{n.content}</div>
                ) : (
                  <div className={styles.audioNote}>
                    <audio controls src={n.content} className={styles.audioPlayer} />
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <button 
        className={styles.fabBtn} 
        onClick={() => setShowAddModal(true)}
        title="Add Note"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={cancelAdd}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add Note</h3>
              <button className={styles.closeBtn} onClick={cancelAdd}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {!addType ? (
              <div className={styles.typeSelector}>
                <div className={styles.pageInfo}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Adding note to <strong>Page {page}</strong>
                </div>
                <div className={styles.typeButtons}>
                  <button 
                    className={styles.typeBtn}
                    onClick={() => setAddType('text')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span>Text Note</span>
                  </button>
                  <button 
                    className={styles.typeBtn}
                    onClick={() => setAddType('audio')}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                    <span>Audio Note</span>
                  </button>
                </div>
              </div>
            ) : addType === 'text' ? (
              <div className={styles.textTab}>
                <textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder="Add your notes here.."
                  maxLength={1500}
                  autoFocus
                />
                <div className={styles.charCount}>{text.length}/1500</div>
                <button className="btn" onClick={saveText}>Save Note</button>
              </div>
            ) : (
              <div className={styles.audioTab}>
                {!isRecording ? (
                  <button className={styles.addVoiceBtn} onClick={startRec}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                    Start Recording
                  </button>
                ) : (
                  <div className={styles.recordingControls}>
                    <button className={styles.stopBtn} onClick={stopRec}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="4" y="4" width="12" height="12" rx="2"/>
                      </svg>
                    </button>
                    <div className={styles.recordingInfo}>
                      <span className={styles.recordingDot}>🔴</span>
                      <span className={styles.recordingText}>{formatTime(recordingTime)}</span>
                    </div>
                    <span className={styles.recordingTime}>10:00</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  })
}
