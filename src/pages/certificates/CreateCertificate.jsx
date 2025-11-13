import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { certificateService } from '../../services/certificateService';
import { listCourses } from '../../services/courseService';
import { listStudents } from '../../services/studentService';
import api from '../../services/api';

const CreateCertificate = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    certificateType: 'course_completion',
    title: '',
    description: '',
    templateId: 'default',
  });
  const [templates, setTemplates] = useState([
    { id: 'default', name: 'Default Template', preview: '/certificates/default.png' },
    { id: 'elegant', name: 'Elegant Template', preview: '/certificates/elegant.png' },
    { id: 'modern', name: 'Modern Template', preview: '/certificates/modern.png' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, studentsData] = await Promise.all([
        listCourses(),
        listStudents(),
      ]);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await certificateService.createCertificate({
        ...formData,
        issuedBy: user.name,
      });
      alert('Certificate created successfully!');
      navigate('/certificates');
    } catch (error) {
      console.error('Error creating certificate:', error);
      alert('Failed to create certificate');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'faculty') {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">You don't have permission to create certificates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Create Certificate</h1>
        <p className="text-gray-600">Issue certificates using custom templates</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
          <select
            required
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          >
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course (Optional)</label>
          <select
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          >
            <option value="">No specific course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Type *</label>
          <select
            required
            value={formData.certificateType}
            onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          >
            <option value="course_completion">Course Completion</option>
            <option value="achievement">Achievement</option>
            <option value="participation">Participation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Template *</label>
          <div className="grid grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => setFormData({ ...formData, templateId: template.id })}
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  formData.templateId === template.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Preview</span>
                </div>
                <p className="text-sm font-medium text-black text-center">{template.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Certificate of Completion"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Certificate description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Certificate'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/certificates')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCertificate;

