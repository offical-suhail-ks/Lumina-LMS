import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { certificateService } from '../../services/certificateService';

const CertificateList = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student') {
      loadCertificates();
    } else if (user?.role === 'admin' || user?.role === 'faculty') {
      // For admin/faculty, show all certificates or implement a different endpoint
      setLoading(false);
    }
  }, [user]);

  const loadCertificates = async () => {
    try {
      const data = await certificateService.getCertificatesByStudent(user.id);
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading certificates...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            {user?.role === 'student' ? 'My Certificates' : 'Certificates'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'student' ? 'View your earned certificates' : 'Manage certificates'}
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button
            onClick={() => navigate('/certificates/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Certificate
          </button>
        )}
      </div>

      {user?.role === 'student' && certificates.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No certificates earned yet</p>
        </div>
      ) : user?.role === 'student' ? (
        <div className="grid gap-4">
          {certificates.map(cert => (
            <div
              key={cert.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-black mb-2">{cert.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{cert.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Certificate Number</p>
                  <p className="text-sm text-black">{cert.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Issued Date</p>
                  <p className="text-sm text-black">{new Date(cert.issuedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Use the "Create Certificate" button to issue certificates to students</p>
        </div>
      )}
    </div>
  );
};

export default CertificateList;

