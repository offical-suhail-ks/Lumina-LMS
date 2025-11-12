import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listCourses } from '../../services/courseService';

const ResourcesLibrary = () => {
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await listCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock resources - in a real app, these would come from the API
  const getCourseResources = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];
    
    return [
      {
        id: '1',
        title: 'Course Syllabus',
        type: 'pdf',
        description: 'Complete course outline and learning objectives',
        size: '2.4 MB',
        uploadedAt: '2025-01-15',
      },
      {
        id: '2',
        title: 'Week 1 Lecture Slides',
        type: 'pdf',
        description: 'Introduction to course concepts',
        size: '5.1 MB',
        uploadedAt: '2025-01-20',
      },
      {
        id: '3',
        title: 'Reading Material - Chapter 1',
        type: 'pdf',
        description: 'Required reading for this week',
        size: '3.8 MB',
        uploadedAt: '2025-01-18',
      },
      {
        id: '4',
        title: 'Video Lecture - Introduction',
        type: 'video',
        description: 'Recorded lecture session',
        size: '125 MB',
        uploadedAt: '2025-01-19',
      },
      {
        id: '5',
        title: 'Assignment Template',
        type: 'doc',
        description: 'Template for submitting assignments',
        size: '0.5 MB',
        uploadedAt: '2025-01-16',
      },
      {
        id: '6',
        title: 'Study Guide',
        type: 'pdf',
        description: 'Comprehensive study guide for midterm',
        size: '4.2 MB',
        uploadedAt: '2025-02-01',
      },
    ];
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'doc':
        return (
          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading resources...</div>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const resources = selectedCourse ? getCourseResources(selectedCourse) : [];

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Resources Library</h1>
        <p className="mt-2 text-sm text-slate-500">
          Access course materials, lecture notes, and study resources.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Course Selector */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Course</h2>
            <div className="space-y-2">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                    selectedCourse === course.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{course.instructor}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="lg:col-span-3">
          {selectedCourseData ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedCourseData.title}</h2>
                  <p className="text-sm text-slate-500">{resources.length} resources available</p>
                </div>
              </div>

              {resources.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {resources.map(resource => (
                    <div
                      key={resource.id}
                      className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 truncate">{resource.title}</h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{resource.description}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                            <span>{resource.size}</span>
                            <span>•</span>
                            <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          <button
                            className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                            onClick={() => {
                              // In a real app, this would download the file
                              alert(`Downloading ${resource.title}...`);
                            }}
                          >
                            Download →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No resources available for this course yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
              <p className="text-sm text-slate-500">Select a course to view resources</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesLibrary;

