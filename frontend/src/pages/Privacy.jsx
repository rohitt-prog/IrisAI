import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Privacy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#030812', color: '#ffffff', minHeight: '100vh', fontFamily: '"DM Sans", sans-serif' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@600;700;800&display=swap');
          
          .legal-container h1, .legal-container h2, .legal-container h3 {
            font-family: 'Syne', sans-serif;
            color: #ffffff;
            margin-top: 3rem;
            margin-bottom: 1.25rem;
          }
          .legal-container h2 { 
            font-size: 1.75rem; 
            border-bottom: 1px solid rgba(255,255,255,0.08); 
            padding-bottom: 0.75rem; 
          }
          .legal-container h3 { font-size: 1.3rem; margin-top: 2rem; color: #e2e8f0; }
          .legal-container p, .legal-container ul {
            font-family: 'DM Sans', sans-serif;
            color: #94a3b8;
            line-height: 1.8;
            font-size: 1.05rem;
            margin-bottom: 1.5rem;
          }
          .legal-container li { 
            margin-bottom: 0.75rem; 
            position: relative;
            padding-left: 1.5rem;
          }
          .legal-container li::before {
            content: "•";
            color: #0062ff;
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          .legal-container a { color: #0062ff; text-decoration: none; font-weight: 500; transition: color 0.2s; }
          .legal-container a:hover { color: #3384ff; text-decoration: underline; }
          .accent { color: #0062ff; }
        `}
      </style>

      {/* Main Content */}
      <main className="legal-container" style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'transparent', border: 'none', color: '#94a3b8', 
            padding: '0', cursor: 'pointer', 
            fontFamily: '"DM Sans", sans-serif', fontSize: '1rem',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'color 0.2s',
            marginBottom: '3rem'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
        >
          <span>←</span> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ color: '#0062ff', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
            Data Protection
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginTop: 0, letterSpacing: '-0.03em' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '1rem', fontSize: '1rem' }}>
            Last Updated: April 2026
          </p>
        </div>

        <p>
          At <strong>IRISAI</strong>, we take your privacy and the security of your health data very seriously. This Privacy Policy outlines our practices regarding the collection, use, and protection of your information when you use our AI-powered eye health screening services.
        </p>

        <h2>1. Data Collection</h2>
        <p>We collect the following types of information to provide and improve our services:</p>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li><strong>Personal Information:</strong> Includes your name, email address, and account credentials when you register.</li>
          <li><strong>Eye Scan Images:</strong> High-resolution anterior segment images (JPG, PNG, DICOM) that you upload for AI screening.</li>
          <li><strong>Technical Data:</strong> Device information, IP address, browser type, and usage statistics collected automatically.</li>
        </ul>

        <h2>2. How Data is Used</h2>
        <p>Your data is utilized strictly for the following purposes:</p>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li>To operate our deep learning models and process your uploaded images.</li>
          <li>To generate personalized diagnostic reports and medical insights.</li>
          <li>To improve and train our AI models (only utilizing fully anonymized and de-identified image data).</li>
          <li>To maintain system security and prevent fraud.</li>
        </ul>

        <h2>3. India DPDP Act 2023 Compliance</h2>
        <p>
          IRISAI strictly adheres to the <span className="accent">Digital Personal Data Protection (DPDP) Act, 2023</span>. We process your data lawfully, fairly, and transparently. We employ purpose limitation and data minimization principles, ensuring we only collect what is strictly necessary. Your explicit consent is always obtained before processing sensitive health data.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy. Specifically, <strong>health data and diagnostic reports are securely retained for a period of 5 years</strong>, after which they are permanently and securely erased from our active databases, in accordance with applicable medical data guidelines unless otherwise requested.
        </p>

        <h2>5. AES-256 Encryption Security</h2>
        <p>
          Your data security is our highest priority. All data, including personal identifiable information and sensitive medical eye scans, is protected using bank-grade <span className="accent">AES-256 encryption</span> both in-transit (over SSL/TLS) and at rest on our secure cloud infrastructure.
        </p>

        <h2>6. Your User Rights</h2>
        <p>Under applicable data protection laws, you possess the following rights regarding your data:</p>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
          <li><strong>Right to Correction:</strong> You can request that we correct any inaccurate or incomplete information.</li>
          <li><strong>Right to Erasure:</strong> You can request the permanent deletion of your account and associated health data ("Right to be Forgotten").</li>
        </ul>

        <h2>7. Cookie Policy</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage or disable cookies through your browser settings, though some core features of the IRISAI platform may not function properly without them.
        </p>

      </main>
    </div>
  );
};

export default Privacy;
