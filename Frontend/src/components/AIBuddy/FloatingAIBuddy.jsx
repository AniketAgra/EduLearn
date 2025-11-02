import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './FloatingAIBuddy.module.css'
import { useAuth } from '../../context/AuthContext'

export default function FloatingAIBuddy({ isPDFPage = false }) {
  const navigate = useNavigate()
  const messages = useMemo(() => [
    'AI Buddy — Need help?',
    'Ask me anything!',
    'Stuck? I can help.',
    'Quick tips inside',
    'Want a summary?'
  ], [])

  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * messages.length))
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const { user } = useAuth()

  // detect tablet/mobile screens (<=1024px) client-side
  useEffect(() => {
    function check() {
      setIsSmallScreen(window.matchMedia('(max-width: 1024px)').matches)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // rotate message every 4 seconds only when NOT on PDF page small-screen
  useEffect(() => {
    if (isPDFPage && isSmallScreen) return undefined
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length)
    }, 4000)
    return () => clearInterval(id)
  }, [messages.length, isPDFPage, isSmallScreen])

  const currentMessage = messages[msgIndex]

  // On small screens we still want the FAB available — only the message bubble
  // is hidden when appropriate (see CSS and showBubble logic). Do not return
  // early here as that would remove the icon entirely on mobile/tablet.

  // Hide AI buddy entirely when user is not logged in
  if (!user) return null

  // Otherwise render normally (bubble shown/rotating unless PDF+small-screen handled earlier)
  const showBubble = !(isPDFPage && isSmallScreen)

  return (
    <div className={isPDFPage ? styles.fabWrapperPDF : styles.fabWrapper}>
      {showBubble && (
        <div className={styles.messageBubble} aria-live="polite">{currentMessage}</div>
      )}
      <button
        className={isPDFPage ? styles.fabPDF : styles.fab}
        aria-label="Open AI Buddy"
        title="AI Buddy"
        onClick={() => navigate('/aibuddy')}
      >
        <BotIcon className={styles.icon} />
      </button>
    </div>
  )
}

function BotIcon({ className }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="8" width="18" height="11" rx="6" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
      <path d="M7 18c1.2 1 3 1.5 5 1.5s3.8-.5 5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
