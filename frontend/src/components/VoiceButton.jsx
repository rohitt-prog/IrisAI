/**
 * VoiceButton.jsx
 * ────────────────
 * A self-contained microphone button that:
 *   1. Records audio via MediaRecorder API
 *   2. Sends it to POST /api/voice
 *   3. Calls onTranscript(text) so the chat UI can show what was said
 *   4. Calls onResponse({ text, audio }) so the chat UI can display + play the reply
 *
 * Props:
 *   onTranscript(transcript: string)  – called with the STT result
 *   onResponse({ text, audio, language }) – called with the AI response
 *   onError(message: string)          – called on any failure
 *   disabled?: boolean                – externally disable the button
 */

import { useState, useRef, useCallback } from 'react';
import { API_URL } from '../config';

const MIME_PREFERENCE = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
];

function getSupportedMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  return MIME_PREFERENCE.find(m => MediaRecorder.isTypeSupported(m)) || null;
}

// Recording states
const STATE = { IDLE: 'idle', RECORDING: 'recording', PROCESSING: 'processing' };

export default function VoiceButton({ onTranscript, onResponse, onError, disabled }) {
  const [state, setState] = useState(STATE.IDLE);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const stopAndCleanStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMime();
      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopAndCleanStream();
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        await sendAudio(blob, mimeType || 'audio/webm');
      };

      recorder.start(200); // collect chunks every 200ms
      setState(STATE.RECORDING);
    } catch (err) {
      stopAndCleanStream();
      setState(STATE.IDLE);
      const msg =
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access and try again.'
          : `Microphone error: ${err.message}`;
      onError?.(msg);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setState(STATE.PROCESSING);
      mediaRecorderRef.current.stop();
    }
  }, []);

  const sendAudio = async (blob, mimeType) => {
    try {
      const formData = new FormData();
      // Some browsers set filename to 'blob'; give it a clear extension
      const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
      formData.append('audio', blob, `recording.${ext}`);

      const res = await fetch(`${API_URL}/voice`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      // Notify Chat of what was heard
      if (data.transcript) onTranscript?.(data.transcript);

      // Notify Chat of the AI response
      onResponse?.({ text: data.text, audio: data.audio, language: data.language });

    } catch (err) {
      onError?.(err.message || 'Voice request failed. Please try again.');
    } finally {
      setState(STATE.IDLE);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (state === STATE.IDLE) startRecording();
    else if (state === STATE.RECORDING) stopRecording();
    // STATE.PROCESSING — ignore clicks while waiting
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const colors = {
    [STATE.IDLE]:       { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#60a5fa', title: 'Hold to speak' },
    [STATE.RECORDING]:  { bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.55)',  color: '#f87171', title: 'Recording… tap to stop' },
    [STATE.PROCESSING]: { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.35)',  color: '#fde047', title: 'Processing…' },
  }[state];

  const isDisabled = disabled || state === STATE.PROCESSING;

  return (
    <button
      id="voice-record-btn"
      onClick={handleClick}
      title={colors.title}
      aria-label={colors.title}
      disabled={isDisabled}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: `1.5px solid ${colors.border}`,
        background: colors.bg,
        color: colors.color,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        transition: 'all 0.2s',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pulse ring while recording */}
      {state === STATE.RECORDING && (
        <span style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '2px solid rgba(239,68,68,0.5)',
          animation: 'voicePulse 1s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {state === STATE.IDLE      && <MicIcon />}
      {state === STATE.RECORDING && <StopIcon />}
      {state === STATE.PROCESSING && <SpinnerIcon />}

      <style>{`
        @keyframes voicePulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.7); opacity: 0;   }
        }
        @keyframes voiceSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8"  y1="23" x2="16" y2="23"/>
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       style={{ animation: 'voiceSpin 0.8s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
