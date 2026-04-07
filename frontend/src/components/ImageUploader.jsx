import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useTokens } from '../context/TokenContext';
import GoldCoin from './GoldCoin';

const steps = [
  { num: 1, title: 'Upload image', desc: 'Select a clear, high-res photo of the eye.' },
  { num: 2, title: 'AI analyzes', desc: 'Deep learning model processes the image.' },
  { num: 3, title: 'Result generated', desc: 'View predictions, probabilities & AI explanation.' },
  { num: 4, title: 'Download report', desc: 'Get a professional PDF with embedded QR code.' },
];

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showNoTokenModal, setShowNoTokenModal] = useState(false);
  const navigate = useNavigate();
  const { tokens, updateTokens } = useTokens();

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e) => { handleDrag(e); setDragOver(true); };
  const handleDragLeave = (e) => { handleDrag(e); setDragOver(false); };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const isLoggedIn = !!localStorage.getItem('token');
  const outOfTokens = isLoggedIn && tokens !== null && tokens <= 0;
  const lowTokens = isLoggedIn && tokens !== null && tokens > 0 && tokens <= 5;

  const handleSubmit = async () => {
    if (!file) return;

    // Block if out of tokens
    if (outOfTokens) {
      setShowNoTokenModal(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const authToken = localStorage.getItem('token');
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    try {
      const res = await axios.post(`${API_URL}/predict/`, formData, { headers });
      // Update token count from response
      if (res.data.tokens_left !== undefined) {
        updateTokens(res.data.tokens_left);
      }
      navigate('/result', { state: { result: res.data, preview } });
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.error) {
        // Backend token error → send to pricing
        setShowNoTokenModal(true);
      } else if (err.response?.data?.msg || err.response?.data?.message) {
        // Handle JWT errors or other backend messages
        setError(`Error: ${err.response.data.msg || err.response.data.message}`);
      } else if (err.response?.status === 413) {
        setError('File is too large. Please upload an image smaller than 5MB.');
      } else {
        setError(`Failed to process image: ${err.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── No-Token Modal ─────────────────────────────────────────── */}
      {showNoTokenModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: '#0c1629',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '1.25rem',
            padding: '2.5rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(239,68,68,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><GoldCoin size={56} /></div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginBottom: '0.75rem' }}>
              No Tokens Left
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              You've used all your scan tokens. Add more to continue generating AI diagnostic reports.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowNoTokenModal(false); navigate('/pricing'); }}
                style={{
                  padding: '0.9rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #0022cc, #0077ff, #00e5ff)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <GoldCoin size={18} style={{ marginRight: '6px' }} /> View Token Plans
              </button>
              <button
                onClick={() => setShowNoTokenModal(false)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in-up" style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '0rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.4rem 1rem',
            borderRadius: '50rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            border: '1px solid rgba(0, 170, 255, 0.3)',
            color: '#a3d9ff',
            backgroundColor: 'rgba(0, 170, 255, 0.05)',
            marginBottom: '1.5rem'
          }}>
            <span style={{ color: '#00e5ff', fontSize: '0.6rem' }}>●</span> EYE HEALTH SCREENING
          </span>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1.2, marginBottom: '1rem' }}>
            Upload Eye <span style={{ color: '#00e5ff' }}>Scan Image</span>
          </h1>
          <p style={{ color: '#a3d9ff', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            High-resolution anterior segment images give the best results. Ensure the eye is clearly visible.
          </p>
        </div>

        {/* ── Low Token Warning Banner ── */}
        {lowTokens && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.9rem 1.25rem',
            borderRadius: '0.875rem',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.3)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>Running low on tokens — </span>
              <span style={{ color: '#fde68a', fontSize: '0.88rem' }}>
                You have <strong>{tokens}</strong> scan{tokens === 1 ? '' : 's'} remaining.
              </span>
            </div>
            <Link
              to="/pricing"
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '50rem',
                background: 'rgba(251,191,36,0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(251,191,36,0.35)',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Buy Tokens →
            </Link>
          </div>
        )}

        {/* ── Out of Tokens Banner ── */}
        {outOfTokens && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.9rem 1.25rem',
            borderRadius: '0.875rem',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🚫</span>
            <div style={{ flex: 1 }}>
              <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>No tokens remaining. </span>
              <span style={{ color: '#fca5a5', fontSize: '0.88rem' }}>Add tokens to continue scanning.</span>
            </div>
            <Link
              to="/pricing"
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '50rem',
                background: 'rgba(239,68,68,0.15)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.3)',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Buy Tokens →
            </Link>
          </div>
        )}

        {/* Upload Card */}
        <div style={{
          background: '#0a101d',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#0077ff',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '4px 12px',
            borderBottomLeftRadius: '12px',
            letterSpacing: '0.5px'
          }}>
            ENHANCED
          </div>

          {!isLoggedIn ? (
            <>
              {/* The Drop Zone View inside Card */}
              <label
                htmlFor="fileInputUnauth"
                className={`upload-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-image' : ''}`}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{
                     width: '60px', height: '60px',
                     borderRadius: '50%',
                     border: '1px dashed rgba(0, 170, 255, 0.4)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     marginBottom: '1.5rem'
                   }}>
                     <div style={{
                       width: '32px', height: '32px',
                       background: '#0a101d',
                       border: '1px solid rgba(0, 170, 255, 0.5)',
                       borderRadius: '50%',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       color: '#00e5ff',
                       fontSize: '1.2rem',
                     }}>↑</div>
                   </div>

                  <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Drop your eye scan here
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    or click to browse files from your device
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'transparent', border: '1px solid rgba(0, 120, 255, 0.3)', color: '#80ebff', fontWeight: '500' }}>JPG</span>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'transparent', border: '1px solid rgba(0, 120, 255, 0.3)', color: '#80ebff', fontWeight: '500' }}>PNG</span>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'transparent', border: '1px solid rgba(0, 120, 255, 0.3)', color: '#80ebff', fontWeight: '500' }}>DICOM</span>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'rgba(0, 120, 255, 0.15)', border: '1px solid rgba(0, 120, 255, 0.1)', color: '#a3d9ff', fontWeight: '500' }}>up to<br/>20MB</span>
                  </div>
                </div>
                <input id="fileInputUnauth" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleChange} />
              </label>

              <div style={{ padding: '0 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem 0 1rem' }}>
                   <div style={{
                     width: '40px', height: '40px',
                     borderRadius: '50%',
                     background: 'rgba(0, 170, 255, 0.1)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontSize: '1rem'
                   }}>🔐</div>
                   <div>
                     <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem' }}>Welcome to IRISAI</h3>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sign in to generate personalized diagnostic reports</p>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingBottom: '2rem' }}>
                  <Link to="/login" style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}>
                    Sign In
                  </Link>
                  <Link to="/signup" style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}>
                    Create Account
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '2rem' }}>
              <label
                htmlFor="fileInputAuth"
                className={`upload-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-image' : ''} ${outOfTokens ? 'disabled' : ''}`}
                onDragEnter={!outOfTokens ? handleDragEnter : undefined}
                onDragLeave={!outOfTokens ? handleDragLeave : undefined}
                onDragOver={!outOfTokens ? handleDrag : undefined}
                onDrop={!outOfTokens ? handleDrop : undefined}
                style={outOfTokens ? { pointerEvents: 'none', opacity: 0.5 } : {}}
              >
            {preview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={preview}
                    alt="Eye scan preview"
                    style={{
                      height: '220px',
                      maxWidth: '100%',
                      objectFit: 'cover',
                      borderRadius: '1rem',
                      border: '2px solid var(--border-medium)',
                      boxShadow: 'var(--glow-sm)',
                    }}
                  />
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    borderRadius: '50rem',
                    padding: '3px 10px',
                    fontSize: '0.72rem', fontWeight: 700,
                    color: '#86efac',
                  }}>
                    ✓ Ready
                  </div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  📁 {file?.name} <span style={{ color: 'var(--text-muted)' }}>({(file?.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); setPreview(null); }}
                >
                  🗑 Remove Image
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{
                     width: '60px', height: '60px',
                     borderRadius: '50%',
                     border: '1px dashed rgba(0, 170, 255, 0.4)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     marginBottom: '1.5rem',
                   }}>
                     <div style={{
                       width: '32px', height: '32px',
                       background: '#0a101d',
                       border: '1px solid rgba(0, 170, 255, 0.5)',
                       borderRadius: '50%',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       color: '#00e5ff',
                       fontSize: '1.2rem',
                     }}>↑</div>
                   </div>

                  <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Drop your eye scan here
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    or click to browse files from your device
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'transparent', border: '1px solid rgba(0, 120, 255, 0.3)', color: '#80ebff', fontWeight: '500' }}>JPG</span>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'transparent', border: '1px solid rgba(0, 120, 255, 0.3)', color: '#80ebff', fontWeight: '500' }}>PNG</span>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'transparent', border: '1px solid rgba(0, 120, 255, 0.3)', color: '#80ebff', fontWeight: '500' }}>DICOM</span>
                    <span style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '4px', background: 'rgba(0, 120, 255, 0.15)', border: '1px solid rgba(0, 120, 255, 0.1)', color: '#a3d9ff', fontWeight: '500' }}>up to<br/>20MB</span>
                  </div>
              </div>
            )}
            <input
              id="fileInputAuth"
              type="file"
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleChange}
              disabled={outOfTokens}
            />
          </label>

          {error && (
            <div className="alert-error" style={{ marginTop: '1rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={outOfTokens ? () => setShowNoTokenModal(true) : handleSubmit}
            disabled={(!file || loading) && !outOfTokens}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '1.25rem',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '0.875rem',
              opacity: (!file || loading) && !outOfTokens ? 0.5 : 1,
              cursor: (!file || loading) && !outOfTokens ? 'not-allowed' : 'pointer',
              background: outOfTokens ? 'linear-gradient(135deg, rgba(239,68,68,0.4), rgba(220,38,38,0.4))' : undefined,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} />
                Analyzing with AI...
              </span>
            ) : outOfTokens ? (
              <span>🚫 No Tokens — Add More to Scan</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>🧠 Generate AI Report {isLoggedIn && tokens !== null ? <><GoldCoin size={16} /> {tokens} left</> : ''}</span>
            )}
          </button>
            </div>
          )}
        </div>

        {/* How it works section */}
        <div style={{ marginTop: '3rem' }}>
          <p style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.15em', 
            textTransform: 'uppercase', 
            color: 'var(--text-muted)',
            marginBottom: '1rem'
          }}>
            HOW IT WORKS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {steps.map((step) => (
              <div key={step.num} style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center',
                padding: '1.25rem',
                background: '#0a101d',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '32px', height: '32px', flexShrink: 0,
                  borderRadius: '8px',
                  background: '#0077ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 800, color: '#fff',
                }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.2rem' }}>{step.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Disclaimer Box */}
        <div style={{
           marginTop: '2rem',
           padding: '1.25rem 1.5rem',
           border: '1px solid rgba(234, 179, 8, 0.2)',
           borderRadius: '12px',
           background: 'rgba(234, 179, 8, 0.05)',
           display: 'flex',
           alignItems: 'flex-start',
           gap: '1rem'
        }}>
          <div style={{ color: '#eab308' }}>⚠</div>
          <p style={{ fontSize: '0.85rem', color: '#eab308', lineHeight: 1.5 }}>
            <strong>Medical Disclaimer:</strong> IRISAI is for preliminary screening only. Not a substitute for professional diagnosis. Always consult a licensed ophthalmologist.
          </p>
        </div>
      </div>
    </>
  );
};

export default ImageUploader;
