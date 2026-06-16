import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuChevronLeft,
  LuChevronRight,
  LuLock,
  LuGift,
  LuPhone,
  LuLogOut,
  LuCamera,
  LuUser,
  LuMail,
  LuMapPin,
  LuX,
  LuCopy,
  LuCheck,
  LuWallet,
  LuStore
} from 'react-icons/lu';
import '../consumer-ecommerce/consumerEcommerce.css';
import { getMerchantProfile, updateMerchantProfile } from "../../api/api";

export default function BusinessProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('triBusinessUser') || 'null');
    } catch (_) {
      return null;
    }
  });

  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('triBusinessProfilePic') || '');

  const [activeModal, setActiveModal] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    business_name: '',
    mobile_number: '',
    address: '',
    commission_percent: '',
    service_mode: 'BOTH'
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await getMerchantProfile();
        if (p) {
          setProfile(p);
          localStorage.setItem('triBusinessUser', JSON.stringify(p));
          setEditForm({
            business_name: p.business_name || '',
            mobile_number: p.mobile_number || '',
            address: p.address || '',
            commission_percent: p.commission_percent || '',
            service_mode: p.service_mode || 'BOTH',
          });
        }
      } catch (err) {
        console.error('Failed to load merchant profile details:', err);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setProfilePic(dataUrl);
      localStorage.setItem('triBusinessProfilePic', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const p = await updateMerchantProfile({
        ...editForm,
        commission_percent: editForm.commission_percent ? parseFloat(editForm.commission_percent) : 0,
      });
      setProfile(p);
      localStorage.setItem('triBusinessUser', JSON.stringify(p));
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); setActiveModal(null); }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('Change password not yet implemented for Business.');
  };

  const referralId = profile?.username || profile?.business_name || '';
  const referralLink = `${window.location.origin}/onboarding?sponsor_id=${referralId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('access_token_business');
    localStorage.removeItem('refresh_business');
    localStorage.removeItem('username_business');
    localStorage.removeItem('triBusinessUser');
    setActiveModal(null);
    navigate('/onboarding');
  };

  const displayName = profile?.business_name || 'My Business';
  const displayId = profile?.username || '—';
  const rawMobile = profile?.mobile_number || '';
  const displayMobile = rawMobile ? (rawMobile.startsWith('+91') ? rawMobile : `+91 ${rawMobile}`) : '—';
  const displayAddress = profile?.address || '—';
  const walletBalance = profile?.walletBalance ?? null;
  const isVerified = profile?.is_verified ?? false;

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pf-page">
      <div className="pf-hero-banner" style={{ background: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)' }}>
        <div className="pf-banner-topbar">
          <button className="pf-banner-back" onClick={() => navigate('/demo/budiness-dashboard')} aria-label="Go back">
            <LuChevronLeft size={20} color="#fff" />
          </button>
          <span className="pf-banner-title" style={{ color: '#fff' }}>Business Profile</span>
          <button className="pf-banner-edit" onClick={() => { setErrorMsg(''); setActiveModal('edit'); }} title="Edit profile">
            ✏️
          </button>
        </div>

        <div className="pf-avatar-wrap" onClick={() => { setErrorMsg(''); setActiveModal('edit'); }} title="Edit profile">
          {profilePic ? (
            <img src={profilePic} alt="Avatar" className="pf-avatar-img" />
          ) : (
            <div className="pf-avatar-initials" style={{ color: '#1B4D3E' }}>{initials || <LuUser size={32} />}</div>
          )}
          <div className="pf-camera-badge" style={{ background: '#1B4D3E' }}><LuCamera size={12} color="#fff" /></div>
        </div>

        <h2 className="pf-banner-name" style={{ color: '#fff' }}>{displayName}</h2>
        <div className="pf-prime-badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
          {isVerified ? '✅ Verified Business' : '⏳ Verification Pending'}
        </div>
      </div>

      <div className="pf-stats-strip">
        <div className="pf-stat">
          <strong>{displayId}</strong>
          <span>Business ID</span>
        </div>
        <div className="pf-stat-divider" />
        <div className="pf-stat">
          <strong>{profile?.service_mode || 'BOTH'}</strong>
          <span>Mode</span>
        </div>
        <div className="pf-stat-divider" />
        <div className="pf-stat">
          <strong>{displayMobile.replace('+91 ', '')}</strong>
          <span>Mobile</span>
        </div>
      </div>

      {walletBalance !== null && (
        <div className="pf-wallet-card">
          <div className="pf-wallet-left">
            <div className="pf-wallet-icon" style={{ background: '#e9f1ff', color: '#143f77' }}><LuWallet size={20} /></div>
            <div>
              <span className="pf-wallet-label">Wallet Balance</span>
              <strong className="pf-wallet-amount">₹{Number(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
          <button className="pf-wallet-add-btn" style={{ background: '#228B22' }}>Add Money</button>
        </div>
      )}

      {displayAddress !== '—' && (
        <div className="pf-location-card">
          <div className="pf-location-icon" style={{ background: '#fdf4e7', color: '#e67e22' }}><LuMapPin size={16} /></div>
          <div>
            <span className="pf-location-label">Business Address</span>
            <strong className="pf-location-value">{displayAddress}</strong>
          </div>
        </div>
      )}

      <div className="pf-section">
        <p className="pf-section-title">Shop Management</p>
        <div className="pf-settings-group">
          <button className="pf-settings-row" onClick={() => navigate('/business/shops')}>
            <div className="pf-settings-icon pf-settings-icon--green"><LuStore size={17} /></div>
            <span>Register / Manage Shops</span>
            <LuChevronRight size={15} className="pf-chevron" />
          </button>
        </div>
      </div>

      <div className="pf-section">
        <p className="pf-section-title">Account</p>
        <div className="pf-settings-group">
          <button className="pf-settings-row" onClick={() => { setErrorMsg(''); setActiveModal('edit'); }}>
            <div className="pf-settings-icon pf-settings-icon--purple"><LuUser size={17} /></div>
            <span>Edit Business Details</span>
            <LuChevronRight size={15} className="pf-chevron" />
          </button>
          <div className="pf-settings-divider" />
          <button className="pf-settings-row" onClick={() => { setErrorMsg(''); setActiveModal('password'); }}>
            <div className="pf-settings-icon pf-settings-icon--blue"><LuLock size={17} /></div>
            <span>Change Password</span>
            <LuChevronRight size={15} className="pf-chevron" />
          </button>
        </div>
      </div>

      <div className="pf-section">
        <p className="pf-section-title">More</p>
        <div className="pf-settings-group">
          <button className="pf-settings-row" onClick={() => { setIsSuccess(false); setActiveModal('refer'); }}>
            <div className="pf-settings-icon pf-settings-icon--orange"><LuGift size={17} /></div>
            <span>Refer Businesses</span>
            <LuChevronRight size={15} className="pf-chevron" />
          </button>
          <div className="pf-settings-divider" />
          <button className="pf-settings-row" onClick={() => setActiveModal('contact')}>
            <div className="pf-settings-icon pf-settings-icon--green"><LuPhone size={17} /></div>
            <span>Contact Support</span>
            <LuChevronRight size={15} className="pf-chevron" />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px 40px' }}>
        <button className="pf-logout-full" onClick={() => setActiveModal('logout')}>
          <LuLogOut size={17} />
          Logout
        </button>
      </div>

      {activeModal === 'edit' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Edit Business</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            {isSuccess ? (
              <div className="ce-modal-success">
                <LuCheck size={40} style={{ strokeWidth: 3, color: '#228B22' }} />
                <p>Business profile updated successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="ce-modal-form">
                <div className="pf-modal-avatar-row">
                  <div className="pf-modal-avatar" onClick={() => fileInputRef.current?.click()} title="Change photo">
                    {profilePic ? (
                      <img src={profilePic} alt="Avatar" />
                    ) : (
                      <div className="pf-modal-avatar-placeholder"><LuUser size={28} /></div>
                    )}
                    <div className="pf-modal-camera-badge"><LuCamera size={11} /></div>
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  <div>
                    <p className="pf-modal-avatar-title">Business Logo</p>
                    <button type="button" className="pf-modal-avatar-btn" onClick={() => fileInputRef.current?.click()}>
                      Change Photo
                    </button>
                  </div>
                </div>

                {errorMsg && <div className="ce-form-error">{errorMsg}</div>}

                <div className="ce-form-field">
                  <label>Business Name</label>
                  <input type="text" required value={editForm.business_name} onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })} placeholder="Enter business name" />
                </div>
                <div className="ce-form-field">
                  <label>Mobile Number</label>
                  <input type="tel" required value={editForm.mobile_number} onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value })} placeholder="Enter mobile number" />
                </div>
                <div className="ce-form-field">
                  <label>Address</label>
                  <textarea rows={2} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} placeholder="Street address" />
                </div>
                <div className="ce-form-row">
                  <div className="ce-form-field">
                    <label>Commission (%)</label>
                    <input type="number" step="0.01" value={editForm.commission_percent} onChange={(e) => setEditForm({ ...editForm, commission_percent: e.target.value })} placeholder="Commission" />
                  </div>
                  <div className="ce-form-field">
                    <label>Service Mode</label>
                    <select value={editForm.service_mode} onChange={(e) => setEditForm({ ...editForm, service_mode: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="BOTH">Both</option>
                      <option value="ONLINE">Online</option>
                      <option value="OFFLINE">Offline</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="ce-modal-submit-btn" disabled={loading} style={{ background: '#228B22' }}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeModal === 'password' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Change Password</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            {isSuccess ? (
              <div className="ce-modal-success">
                <LuCheck size={40} style={{ strokeWidth: 3, color: '#228B22' }} />
                <p>Password changed successfully!</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="ce-modal-form">
                {errorMsg && <div className="ce-form-error">{errorMsg}</div>}
                <div className="ce-form-field">
                  <label>New Password</label>
                  <input type="password" required placeholder="Enter new password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                </div>
                <div className="ce-form-field">
                  <label>Confirm Password</label>
                  <input type="password" required placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </div>
                <button type="submit" className="ce-modal-submit-btn" disabled={loading} style={{ background: '#228B22' }}>
                  {loading ? 'Changing...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeModal === 'refer' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Refer Businesses</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            <div className="ce-referral-content">
              <div className="ce-referral-illustration"><LuGift size={48} className="illustration-gift" color="#e67e22" /></div>
              <p className="ce-referral-copy-text">Share your link to refer new businesses to Trikonekt.</p>
              <div className="ce-referral-link-box">
                <input type="text" readOnly value={referralLink} />
                <button type="button" onClick={handleCopyLink} aria-label="Copy link" style={{ background: '#e67e22' }}>
                  {isSuccess ? <span className="copy-check">Copied!</span> : <LuCopy size={16} />}
                </button>
              </div>
              <div className="ce-referral-social-actions">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Join Trikonekt Business! ${referralLink}`)}`} target="_blank" rel="noreferrer" className="ce-social-btn whatsapp-btn">
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'contact' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Contact Us</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            <div className="ce-contact-content">
              <div className="ce-contact-row">
                <LuPhone size={20} className="ce-contact-icon color-green" />
                <div><h4>Call Support</h4><p>+91 99999 99999</p></div>
              </div>
              <div className="ce-contact-row">
                <LuMail size={20} className="ce-contact-icon color-blue" />
                <div><h4>Email Support</h4><p>contact@trikonekt.com</p></div>
              </div>
              <div className="ce-contact-row">
                <LuMapPin size={20} className="ce-contact-icon color-orange" />
                <div><h4>Head Office</h4><p>Trikonekt Marketing, Kerala, India</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'logout' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Confirm Logout</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            <div className="ce-logout-confirm-content">
              <p>Are you sure you want to log out?</p>
              <div className="ce-logout-actions">
                <button type="button" className="ce-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="button" className="ce-btn-primary red-bg" onClick={handleLogoutConfirm}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
