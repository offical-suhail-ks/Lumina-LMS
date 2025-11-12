import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';

const FacultyProfile = () => {
  const user = useSelector(state => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setProfile({
        name: user?.name || 'Faculty Member',
        email: user?.email || 'faculty@lumina.edu',
        phone: '+1234567890',
        department: 'Computer Science',
        office: 'Room 205',
        officeHours: 'Mon-Wed 2:00 PM - 4:00 PM',
        specialization: 'Machine Learning, Data Science',
        yearsOfExperience: '10 years',
      });
      setEditForm({
        phone: '+1234567890',
        department: 'Computer Science',
        office: 'Room 205',
        officeHours: 'Mon-Wed 2:00 PM - 4:00 PM',
        specialization: 'Machine Learning, Data Science',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = {
        ...profile,
        ...editForm,
        profilePicture: profilePicturePreview || profile?.profilePicture,
      };
      setProfile(updatedProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const downloadIDCard = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85, 54],
    });

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 85, 54, 'F');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(5, 5, 75, 44, 3, 3, 'F');

    if (profilePicturePreview) {
      try {
        doc.addImage(profilePicturePreview, 'JPEG', 10, 10, 18, 24);
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }
    } else {
      doc.setFillColor(59, 130, 246);
      doc.circle(20, 20, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(profile?.name?.charAt(0) || 'F', 20, 23, { align: 'center' });
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FACULTY ID CARD', 45, 12);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${profile?.name || 'N/A'}`, 35, 18);
    doc.text(`Department: ${profile?.department || 'N/A'}`, 35, 23);
    doc.text(`Email: ${profile?.email || 'N/A'}`, 35, 28);
    doc.text(`Office: ${profile?.office || 'N/A'}`, 35, 33);

    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text('Lumina Learning Management System', 42.5, 50, { align: 'center' });

    doc.save(`faculty-id-${user?.id || 'card'}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Faculty Profile</h1>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={downloadIDCard}
              className="rounded-xl border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              Download ID Card (PDF)
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border border-slate-200/80 bg-white/80 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-white hover:text-blue-100"
                title="Upload profile picture"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 overflow-hidden">
                {profilePicturePreview ? (
                  <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {profile?.name?.charAt(0) || 'F'}
                  </span>
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs hover:bg-indigo-700"
                    title="Change profile picture"
                  >
                    +
                  </button>
                </>
              )}
            </div>
            <div className="flex-1 text-white">
              <h3 className="text-xl font-semibold mb-1">{profile?.name || 'Faculty Member'}</h3>
              <p className="text-sm text-blue-100 mb-1">
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-blue-200 w-full max-w-xs"
                    placeholder="Phone number"
                  />
                ) : (
                  profile?.phone || 'N/A'
                )}
              </p>
              <p className="text-sm text-blue-100">{profile?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.department || ''}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    placeholder="Department"
                  />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900">{profile?.department || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Department</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.office || ''}
                    onChange={(e) => setEditForm({ ...editForm, office: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    placeholder="Office"
                  />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900">{profile?.office || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Office</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.officeHours || ''}
                    onChange={(e) => setEditForm({ ...editForm, officeHours: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    placeholder="Office Hours"
                  />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900">{profile?.officeHours || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Office Hours</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.specialization || ''}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    placeholder="Specialization"
                  />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900">{profile?.specialization || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Specialization</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
