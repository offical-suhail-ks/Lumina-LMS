import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModulesByCourse } from '../../services/moduleService';
import { getCourseDetails } from '../../services/courseService';

const CourseModules = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseData, modulesData] = await Promise.all([
        getCourseDetails(courseId),
        getModulesByCourse(courseId),
      ]);
      setCourse(courseData);
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = (material) => {
    if (material.filePath) {
      // Use the API URL to download the file
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const downloadUrl = material.filePath.startsWith('http') 
        ? material.filePath 
        : `${apiUrl}${material.filePath}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = material.fileName || material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`No file available for ${material.title}`);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <button
          onClick={() => navigate('/courses')}
          className="text-sm text-indigo-600 hover:text-indigo-700 mb-2"
        >
          ← Back to Courses
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">Course Modules</h1>
        <p className="mt-1 text-sm text-slate-500">{course?.title}</p>
      </header>

      <section className="space-y-4">
        {modules.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center">
            <p className="text-slate-500">No modules available for this course yet.</p>
          </div>
        ) : (
          modules.map((module) => (
            <div
              key={module.id}
              className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-semibold text-lg">
                  {module.orderIndex + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                  {module.durationHours && (
                    <p className="text-sm text-slate-500 mt-1">Duration: {module.durationHours} hours</p>
                  )}
                  {module.description && (
                    <p className="text-sm text-slate-600 mt-2">{module.description}</p>
                  )}
                </div>
              </div>

              {/* Materials Section */}
              {module.materials && module.materials.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Study Materials</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {module.materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{material.title}</p>
                          {material.fileName && (
                            <p className="text-xs text-slate-500 mt-1">
                              {material.fileName} • {formatFileSize(material.fileSize)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDownload(material)}
                          className="ml-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 flex-shrink-0"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CourseModules;

