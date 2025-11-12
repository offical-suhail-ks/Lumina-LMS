import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getModulesByCourse, createModule, updateModule, deleteModule, addModuleMaterial, deleteModuleMaterial } from '../../services/moduleService';
import { getCourseDetails } from '../../services/courseService';

const ManageModules = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(null); // moduleId
  const [moduleForm, setModuleForm] = useState({
    id: null,
    title: '',
    description: '',
    durationHours: '',
    orderIndex: '',
  });
  const [materialForm, setMaterialForm] = useState({
    title: '',
    file: null,
  });

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
      
      // Verify faculty has access to this course (same department)
      if (user?.department && courseData?.department && 
          courseData.department.toLowerCase() !== user.department.toLowerCase()) {
        alert('You do not have access to manage modules for this course. It belongs to a different department.');
        navigate('/faculty/my-courses');
        return;
      }
      
      setCourse(courseData);
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetModuleForm = () => {
    setModuleForm({
      id: null,
      title: '',
      description: '',
      durationHours: '',
      orderIndex: '',
    });
    setShowModuleForm(false);
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleForm.title) {
      alert('Module title is required');
      return;
    }

    try {
      if (moduleForm.id) {
        await updateModule(moduleForm.id, {
          title: moduleForm.title,
          description: moduleForm.description || null,
          durationHours: moduleForm.durationHours ? parseFloat(moduleForm.durationHours) : null,
          orderIndex: moduleForm.orderIndex ? parseInt(moduleForm.orderIndex, 10) : null,
        });
      } else {
        await createModule(courseId, {
          title: moduleForm.title,
          description: moduleForm.description || null,
          durationHours: moduleForm.durationHours ? parseFloat(moduleForm.durationHours) : null,
          orderIndex: moduleForm.orderIndex ? parseInt(moduleForm.orderIndex, 10) : 0,
        });
      }
      await fetchData();
      resetModuleForm();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module. Please try again.');
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.file) {
      alert('Material title and file are required');
      return;
    }

    try {
      await addModuleMaterial(showMaterialForm, {
        title: materialForm.title,
        file: materialForm.file,
        uploadedBy: user?.id || user?.name,
      });
      await fetchData();
      setMaterialForm({ title: '', file: null });
      setShowMaterialForm(null);
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Failed to add material. Please try again.');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its materials?')) return;
    try {
      await deleteModule(moduleId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module.');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteModuleMaterial(materialId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return <div className="p-6 text-center">Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/faculty/my-courses')}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2"
          >
            ← Back to My Courses
          </button>
          <h1 className="text-2xl font-semibold text-slate-900">Course Modules</h1>
          <p className="mt-1 text-sm text-slate-500">{course?.title}</p>
        </div>
        <button
          onClick={() => setShowModuleForm(true)}
          className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Module
        </button>
      </header>

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">
              {moduleForm.id ? 'Edit Module' : 'Create New Module'}
            </h2>
            <form onSubmit={handleModuleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Module Title *</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows="3"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={moduleForm.durationHours}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, durationHours: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Order</label>
                  <input
                    type="number"
                    min="0"
                    value={moduleForm.orderIndex}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, orderIndex: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetModuleForm}
                  className="flex-1 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {moduleForm.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Form Modal */}
      {showMaterialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Add Study Material</h2>
            <form onSubmit={handleMaterialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Material Title *</label>
                <input
                  type="text"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">File *</label>
                <input
                  type="file"
                  onChange={(e) => setMaterialForm(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="mt-1 block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialForm(null);
                    setMaterialForm({ title: '', file: null });
                  }}
                  className="flex-1 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modules List */}
      <section className="space-y-4">
        {modules.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center">
            <p className="text-slate-500">No modules created yet. Add your first module to get started.</p>
          </div>
        ) : (
          modules.map((module) => (
            <div
              key={module.id}
              className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-semibold">
                      {module.orderIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                      {module.durationHours && (
                        <p className="text-sm text-slate-500">Duration: {module.durationHours} hours</p>
                      )}
                    </div>
                  </div>
                  {module.description && (
                    <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setModuleForm({
                        id: module.id,
                        title: module.title,
                        description: module.description || '',
                        durationHours: module.durationHours || '',
                        orderIndex: module.orderIndex || '',
                      });
                      setShowModuleForm(true);
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Materials Section */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">Study Materials</h4>
                  <button
                    onClick={() => setShowMaterialForm(module.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Material
                  </button>
                </div>
                {module.materials && module.materials.length > 0 ? (
                  <ul className="space-y-2">
                    {module.materials.map((material) => (
                      <li
                        key={material.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{material.title}</p>
                          {material.fileName && (
                            <p className="text-xs text-slate-500 mt-1">
                              {material.fileName} • {formatFileSize(material.fileSize)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No materials uploaded yet.</p>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default ManageModules;

