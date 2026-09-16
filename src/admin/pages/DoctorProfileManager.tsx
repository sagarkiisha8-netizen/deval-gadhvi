import React, { useState, useEffect } from 'react';
import { 
  User, Award, Stethoscope, Clock, DollarSign, Phone, 
  Mail, MapPin, Globe, Save, Sparkles, CheckCircle2, 
  Upload, AlertCircle, Plus, X, ExternalLink, Share2,
  FileCheck, Shield, RotateCcw
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useCmsData } from '../../context/CmsContext';
import { logAdminActivity } from '../utils/auditLogger';
import { DoctorProfile } from '../../types';
import { uploadMediaFile, uploadBase64Image, isBase64Image } from '../../utils/mediaStorage';

const DEFAULT_PROFILE: DoctorProfile = {
  id: 'dr-prahlad-gadhavi',
  name: 'Dr. Prahlad Gadhavi',
  qualification: 'MBBS, MD',
  designation: 'Primary Care Physician',
  speciality: 'Internal Medicine Specialist',
  subSpeciality: 'Comprehensive Primary Care & Preventative Health',
  experienceYears: 20,
  clinicName: 'Newark Medical Associates',
  biography: `Dr. Prahlad Gadhavi is a board-certified Internal Medicine Specialist at Newark Medical Associates. He earned his bachelor's degree in Medicine and Surgery at B.J. Medical College in Ahmedabad, graduating with honors in 2003. He completed his residency in Internal Medicine at Mount Sinai and Beth Israel Medical Centers in New York City.\n\nWith more than 20 years of diverse experience in Internal Medicine, Dr. Gadhavi has built a strong reputation for providing compassionate and comprehensive care. His patients trust him for his thorough approach and commitment to helping them understand their treatment options.`,
  introduction: 'Dr. Prahlad Gadhavi is a board-certified Internal Medicine Specialist providing compassionate, comprehensive care with over 20 years of diverse clinical experience.',
  photoUrl: 'https://framerusercontent.com/images/aU1QUlSKO9mpYg2rCyxW7d2q0.png?width=898&height=1194',
  expertise: [
    'Annual & preventative physical exams',
    'Acute/same-day urgent care visits',
    'Chronic disease management (hypertension, diabetes, etc.)',
    'Blood testing & lab work',
    'EKG & basic cardiac risk screening',
    'Pre-operative exams',
    'Specialist referral coordination'
  ],
  awards: [
    'Board Certified in Internal Medicine',
    'Graduated with Honors (2003) – B.J. Medical College, Ahmedabad',
    'Residency Honors – Mount Sinai & Beth Israel Medical Centers'
  ],
  memberships: [
    'American College of Physicians (ACP)',
    'American Medical Association (AMA)',
    'Medical Society of New Jersey'
  ],
  certifications: [
    'Board Certified in Internal Medicine',
    'New Jersey State Medical Board License',
    'Advanced Cardiac Life Support (ACLS)'
  ],
  medicalRegistration: {
    npi: '1942345678',
    licenseNumber: '25MA07894200',
    state: 'New Jersey'
  },
  consultationTimings: 'Monday – Friday: 8:00 AM – 5:00 PM | Saturday: 9:00 AM – 1:00 PM',
  consultationFee: '$150 - $250 (Covered by most major PPO/HMO/Medicare insurances)',
  phone: '(973) 412-9404',
  whatsapp: '+1 (973) 412-9404',
  email: 'medicalnewark@gmail.com',
  clinicAddress: '337, Bloomfield Avenue, Newark, NJ-07107',
  googleMapsUrl: 'https://maps.google.com/?q=337+Bloomfield+Avenue,+Newark,+NJ+07107',
  socialLinks: {
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com'
  }
};

export default function DoctorProfileManager() {
  const { user } = useAdminAuth();
  const { refreshData } = useCmsData();
  const [profile, setProfile] = useState<DoctorProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Array inputs temporary states
  const [newExpertise, setNewExpertise] = useState('');
  const [newAward, setNewAward] = useState('');
  const [newMembership, setNewMembership] = useState('');
  const [newCert, setNewCert] = useState('');

  useEffect(() => {
    async function loadDoctorProfile() {
      // Check for standalone preserved doctor photo
      let preservedPhoto: string | null = null;
      try {
        preservedPhoto = localStorage.getItem('newark_doctor_photo');
        if (preservedPhoto && (preservedPhoto.includes('newark_internal_medicine') || preservedPhoto.includes('photo-1576091160399'))) {
          preservedPhoto = null;
          localStorage.removeItem('newark_doctor_photo');
        }
      } catch (e) {}

      // 1. Instant load from local storage cache if available
      try {
        const local = localStorage.getItem('newark_doctor_profile');
        if (local) {
          const parsed = JSON.parse(local);
          let activePhoto = preservedPhoto || parsed.photoUrl || DEFAULT_PROFILE.photoUrl;
          if (activePhoto.includes('newark_internal_medicine') || activePhoto.includes('photo-1576091160399')) {
            activePhoto = DEFAULT_PROFILE.photoUrl;
          }

          if (parsed.experienceYears === 35 || parsed.clinicAddress?.includes('Chestnut') || !parsed.name?.includes('Gadhavi')) {
            setProfile({ ...DEFAULT_PROFILE, phone: '(973) 412-9404', whatsapp: '+1 (973) 412-9404', photoUrl: activePhoto });
            localStorage.setItem('newark_doctor_profile', JSON.stringify({ ...DEFAULT_PROFILE, phone: '(973) 412-9404', whatsapp: '+1 (973) 412-9404', photoUrl: activePhoto }));
          } else {
            setProfile({ ...DEFAULT_PROFILE, ...parsed, phone: '(973) 412-9404', whatsapp: '+1 (973) 412-9404', photoUrl: activePhoto });
          }
        } else {
          setProfile({ ...DEFAULT_PROFILE, photoUrl: preservedPhoto || DEFAULT_PROFILE.photoUrl });
        }
      } catch (e) {
        setProfile({ ...DEFAULT_PROFILE, photoUrl: preservedPhoto || DEFAULT_PROFILE.photoUrl });
      }

      // 2. Fetch latest from Firestore
      try {
        const db = getDb();
        const snap = await getDoc(doc(db, 'doctor_profile', 'main'));
        if (snap.exists()) {
          const remoteData = snap.data() as DoctorProfile;
          const activePhoto = preservedPhoto || remoteData.photoUrl || DEFAULT_PROFILE.photoUrl;

          if (remoteData.experienceYears === 35 || remoteData.clinicAddress?.includes('Chestnut') || !remoteData.name?.includes('Gadhavi')) {
            const upgraded = { ...DEFAULT_PROFILE, photoUrl: activePhoto };
            setProfile(upgraded);
            localStorage.setItem('newark_doctor_profile', JSON.stringify(upgraded));
            await setDoc(doc(db, 'doctor_profile', 'main'), upgraded, { merge: true });
          } else {
            const merged = { ...DEFAULT_PROFILE, ...remoteData, photoUrl: activePhoto };
            setProfile(merged);
            try {
              localStorage.setItem('newark_doctor_profile', JSON.stringify(merged));
            } catch (e) {}
          }
        } else {
          // Initialize main document if empty
          const initProfile = { ...DEFAULT_PROFILE, photoUrl: preservedPhoto || DEFAULT_PROFILE.photoUrl };
          await setDoc(doc(db, 'doctor_profile', 'main'), initProfile, { merge: true });
        }
      } catch (err) {
        console.warn('Doctor profile fallback load:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorProfile();
  }, []);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setToastMessage(null);

    let photoUrl = profile.photoUrl;
    if (isBase64Image(photoUrl)) {
      try {
        photoUrl = await uploadBase64Image(photoUrl, 'providers/prahlad-gadhavi');
        setProfile((prev) => ({ ...prev, photoUrl }));
      } catch (uploadErr) {
        console.warn('Could not migrate base64 photo before saving:', uploadErr);
      }
    }

    // Save to local storage cache immediately
    try {
      localStorage.setItem('newark_doctor_profile', JSON.stringify({ ...profile, photoUrl }));
      if (photoUrl) {
        localStorage.setItem('newark_doctor_photo', photoUrl);
      }
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    try {
      const db = getDb();
      const updated = {
        ...profile,
        photoUrl,
        updatedAt: serverTimestamp()
      };

      // 1. Save to main doctor profile document
      await setDoc(doc(db, 'doctor_profile', 'main'), updated, { merge: true });

      // 2. Also sync to primary provider documents so provider pages and about page reflect updates
      const providerSyncData = {
        id: 'dr-prahlad-gadhvi',
        slug: 'dr-prahlad-gadhvi',
        name: profile.name,
        credentials: profile.qualification,
        title: profile.designation,
        specialty: profile.speciality,
        bio: profile.introduction,
        fullBio: profile.biography,
        imageUrl: photoUrl,
        photoUrl: photoUrl,
        image: photoUrl,
        experienceYears: profile.experienceYears,
        certifications: profile.certifications,
        specialties: profile.expertise,
        phone: profile.phone,
        email: profile.email,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'providers', 'dr-prahlad-gadhvi'), providerSyncData, { merge: true });
      await setDoc(doc(db, 'providers', 'dr-prahlad-gadhavi'), {
        ...providerSyncData,
        id: 'dr-prahlad-gadhavi',
        slug: 'dr-prahlad-gadhavi'
      }, { merge: true });

      try {
        await logAdminActivity(
          user?.email || 'admin@newarkmed.com',
          user?.displayName || 'Admin',
          `Updated Doctor Profile: ${profile.name}`,
          'doctor',
          `Saved qualifications, bio, contact and clinic timings.`
        );
      } catch (logErr) {
        console.warn('Audit logging skipped:', logErr);
      }

      await refreshData();
      setToastMessage('Doctor profile successfully updated and synchronized across website!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving doctor profile:', err);
      setToastMessage('Error saving profile: ' + (err.message || 'Please check connection'));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { url: permanentUrl } = await uploadMediaFile(file, 'providers/prahlad-gadhavi');
      setProfile((prev) => ({ ...prev, photoUrl: permanentUrl }));
      try {
        localStorage.setItem('newark_doctor_photo', permanentUrl);
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}
      setToastMessage('Photo uploaded successfully to persistent storage!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setToastMessage(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const addExpertiseItem = () => {
    if (newExpertise.trim()) {
      setProfile(p => ({ ...p, expertise: [...p.expertise, newExpertise.trim()] }));
      setNewExpertise('');
    }
  };

  const removeExpertiseItem = (index: number) => {
    setProfile(p => ({ ...p, expertise: p.expertise.filter((_, i) => i !== index) }));
  };

  const addAwardItem = () => {
    if (newAward.trim()) {
      setProfile(p => ({ ...p, awards: [...p.awards, newAward.trim()] }));
      setNewAward('');
    }
  };

  const removeAwardItem = (index: number) => {
    setProfile(p => ({ ...p, awards: p.awards.filter((_, i) => i !== index) }));
  };

  const addMembershipItem = () => {
    if (newMembership.trim()) {
      setProfile(p => ({ ...p, memberships: [...p.memberships, newMembership.trim()] }));
      setNewMembership('');
    }
  };

  const removeMembershipItem = (index: number) => {
    setProfile(p => ({ ...p, memberships: p.memberships.filter((_, i) => i !== index) }));
  };

  const addCertItem = () => {
    if (newCert.trim()) {
      setProfile(p => ({ ...p, certifications: [...p.certifications, newCert.trim()] }));
      setNewCert('');
    }
  };

  const removeCertItem = (index: number) => {
    setProfile(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold shadow-md ${
          toastMessage.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className={toastMessage.includes('Error') ? 'text-red-600' : 'text-emerald-600'} />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold mb-2">
            <User size={13} />
            <span>Physician & Provider Master Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Profile Management</h1>
          <p className="text-xs text-slate-500">
            Edit qualifications, biography, consultation timings, fees, and contact info. Live updates propagate across the clinic website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setProfile(DEFAULT_PROFILE);
              try {
                localStorage.setItem('newark_doctor_profile', JSON.stringify(DEFAULT_PROFILE));
              } catch (e) {}
              setToastMessage('Filled official info for Dr. Prahlad Gadhavi (MBBS, MD) from clinic records! Click Save & Publish to save.');
              setTimeout(() => setToastMessage(null), 4000);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-200 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Fill Official Doctor Info</span>
          </button>
          <a
            href="/providers/dr-prahlad-gadhvi"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ExternalLink size={14} />
            <span>Preview Public Bio</span>
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save & Publish Profile'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information & Photo */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope size={18} className="text-primary-600" />
            <span>Primary Physician Credentials & Visuals</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Column */}
            <div className="md:col-span-1 space-y-3 text-center">
              {/* Image Placement Banner */}
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-2xl text-left space-y-1">
                <div className="flex items-center gap-1.5 text-primary-800 text-[11px] font-bold uppercase tracking-wider">
                  <ExternalLink size={12} />
                  <span>Where This Photo Displays</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • <strong>Homepage</strong> Care Philosophy & Doctor Overview<br />
                  • <strong>About Page</strong> Physician Bio & Honors<br />
                  • <strong>Provider Directory</strong> (/providers)<br />
                  • <strong>Doctor Detail Page</strong> (/providers/dr-prahlad-gadhvi)
                </p>
                <div className="pt-1">
                  <a
                    href="/providers/dr-prahlad-gadhvi"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 hover:text-primary-900 underline"
                  >
                    <span>View on Live Website</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div className="w-44 h-52 mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 relative group">
                <img
                  src={profile.photoUrl || 'https://framerusercontent.com/images/aU1QUlSKO9mpYg2rCyxW7d2q0.png?width=898&height=1194'}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors border border-slate-300">
                  <Upload size={14} />
                  <span>Change Doctor Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={profile.photoUrl}
                  onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Details Column */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Dr. Prahlad Gadhvi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Qualification</label>
                <input
                  type="text"
                  value={profile.qualification}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. MD, FACP"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Designation</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Medical Director & Chief Physician"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input
                  type="text"
                  value={profile.clinicName}
                  onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Newark Medical Associates"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Speciality</label>
                <input
                  type="text"
                  value={profile.speciality}
                  onChange={(e) => setProfile({ ...profile, speciality: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Internal Medicine"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-Speciality / Focus</label>
                <input
                  type="text"
                  value={profile.subSpeciality}
                  onChange={(e) => setProfile({ ...profile, subSpeciality: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Preventative Cardiology & Diagnostics"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={profile.experienceYears}
                  onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee Schedule</label>
                <input
                  type="text"
                  value={profile.consultationFee}
                  onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Insurances accepted / $150-250 self-pay"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Hours & Timings</label>
                <input
                  type="text"
                  value={profile.consultationTimings}
                  onChange={(e) => setProfile({ ...profile, consultationTimings: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Biography & Professional Narrative */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck size={18} className="text-primary-600" />
            <span>Biography & Professional Introduction</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Professional Introduction (Homepage & Hero)</label>
            <textarea
              rows={2}
              value={profile.introduction}
              onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              placeholder="Short 2-3 sentence elevator bio for cards and previews..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Doctor Biography (Provider Detail & About Page)</label>
            <textarea
              rows={5}
              value={profile.biography}
              onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              placeholder="Full medical career narrative, philosophy of care, and background..."
            />
          </div>
        </div>

        {/* Expertise, Awards, Memberships & Certifications */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award size={18} className="text-primary-600" />
            <span>Areas of Clinical Expertise, Certifications & Honors</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expertise */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Areas of Expertise</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="e.g. Preventive Cardiology"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExpertiseItem(); } }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={addExpertiseItem}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.expertise.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
                    <span>{item}</span>
                    <button type="button" onClick={() => removeExpertiseItem(idx)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Board Certifications</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  placeholder="e.g. American Board of Internal Medicine"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCertItem(); } }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={addCertItem}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.certifications.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                    <span>{item}</span>
                    <button type="button" onClick={() => removeCertItem(idx)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Honors & Awards</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  placeholder="e.g. NJ Top Physician"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAwardItem(); } }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={addAwardItem}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.awards.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                    <span>{item}</span>
                    <button type="button" onClick={() => removeAwardItem(idx)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Memberships */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Professional Memberships</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMembership}
                  onChange={(e) => setNewMembership(e.target.value)}
                  placeholder="e.g. American College of Physicians"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMembershipItem(); } }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={addMembershipItem}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.memberships.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                    <span>{item}</span>
                    <button type="button" onClick={() => removeMembershipItem(idx)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Medical Registration & Regulatory Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield size={18} className="text-primary-600" />
            <span>State Medical Board & Official Registration Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">National Provider Identifier (NPI)</label>
              <input
                type="text"
                value={profile.medicalRegistration?.npi || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  medicalRegistration: { ...profile.medicalRegistration, npi: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="10-digit NPI"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State License Number</label>
              <input
                type="text"
                value={profile.medicalRegistration?.licenseNumber || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  medicalRegistration: { ...profile.medicalRegistration, licenseNumber: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="e.g. 25MA07894200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Licensing State Jurisdiction</label>
              <input
                type="text"
                value={profile.medicalRegistration?.state || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  medicalRegistration: { ...profile.medicalRegistration, state: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="e.g. New Jersey"
              />
            </div>
          </div>
        </div>

        {/* Clinic Direct Contact & Map Location */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Phone size={18} className="text-primary-600" />
            <span>Direct Doctor Contact, WhatsApp & Location</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Clinic Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="(973) 412-9404"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                value={profile.whatsapp}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="+1 (973) 412-9404"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Physician Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="medicalnewark@gmail.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Clinic Address</label>
              <input
                type="text"
                value={profile.clinicAddress}
                onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="235 Chestnut St, Newark, NJ 07105"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Google Maps Direct URL</label>
              <input
                type="text"
                value={profile.googleMapsUrl}
                onChange={(e) => setProfile({ ...profile, googleMapsUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="https://maps.google.com/?q=..."
              />
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 size={18} className="text-primary-600" />
            <span>Doctor Social Media & Web Profiles</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={profile.socialLinks?.linkedin || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Page</label>
              <input
                type="text"
                value={profile.socialLinks?.facebook || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, facebook: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram Account</label>
              <input
                type="text"
                value={profile.socialLinks?.instagram || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, instagram: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">X / Twitter</label>
              <input
                type="text"
                value={profile.socialLinks?.twitter || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Channel</label>
              <input
                type="text"
                value={profile.socialLinks?.youtube || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, youtube: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
                placeholder="https://youtube.com/@..."
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 p-4 bg-white rounded-2xl border border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Doctor Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
