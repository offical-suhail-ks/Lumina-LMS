import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { videoService } from '../../services/videoService';
import { listCourses } from '../../services/courseService';
import { getModulesByCourse } from '../../services/moduleService';
import api from '../../services/api';

const UploadVideo = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    moduleId: '',
    title: '',
    description: '',
    videoUrl: '',
    videoType: 'upload',
    duration: '',
    orderIndex: 0,
    isPreview: false,
  });
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      loadModules();
    } else {
      setModules([]);
    }
  }, [formData.courseId]);

  const loadCourses = async () => {
    try {
      const data = await listCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadModules = async () => {
    try {
      const data = await getModulesByCourse(formData.courseId);
      setModules(data);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('courseId', formData.courseId);
      if (formData.moduleId) submitData.append('moduleId', formData.moduleId);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('videoType', formData.videoType);
      submitData.append('orderIndex', formData.orderIndex);
      submitData.append('isPreview', formData.isPreview);
      if (formData.videoUrl && formData.videoType !== 'upload') {
        submitData.append('videoUrl', formData.videoUrl);
      }
      if (formData.duration) submitData.append('duration', formData.duration);
      if (videoFile && formData.videoType === 'upload') {
        submitData.append('video', videoFile);
      }

      await api.post('/videos', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Video uploaded successfully!');
      navigate('/videos');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'faculty') {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">You don't have permission to upload videos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Upload Video</h1>
        <p className="text-gray-600">Add videos to courses and modules</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course *
          </label>
          <select
            required
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value, moduleId: '' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        {formData.courseId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module (Optional)
            </label>
            <select
              value={formData.moduleId}
              onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            >
              <option value="">No module (course-level video)</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>{module.title}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Type *
          </label>
          <select
            required
            value={formData.videoType}
            onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          >
            <option value="upload">Upload Video File</option>
            <option value="youtube">YouTube URL</option>
            <option value="vimeo">Vimeo URL</option>
            <option value="embed">Embed Code</option>
          </select>
        </div>

        {formData.videoType === 'upload' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File * (Max 500MB)
            </label>
            <input
              type="file"
              accept="video/*"
              required
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              required
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder={formData.videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'Video URL'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Index
            </label>
            <input
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPreview"
            checked={formData.isPreview}
            onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPreview" className="ml-2 block text-sm text-gray-700">
            Mark as preview video
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/videos')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideo;

