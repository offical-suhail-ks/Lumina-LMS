import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listCourses } from '../../services/courseService';

const MyCourses = () => {
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await listCourses();
      // Filter courses by department (show all courses from faculty's department)
      // If faculty has no department set, show all courses (fallback)
      const departmentCourses = user?.department
        ? data.filter(c => 
            c.department && 
            c.department.toLowerCase() === user.department.toLowerCase()
          )
        : data; // Show all courses if department not set
      setCourses(departmentCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Department Courses</h1>
            <p className="mt-2 text-sm text-slate-500">
              {user?.department ? `All courses from ${user.department} department. Create modules and manage course materials.` : 'Manage courses, view student rosters, and track progress.'}
            </p>
          </div>
          <Link
            to="/faculty/student-roster"
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            View All Students
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        {courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div
                key={course.id}
                className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-base font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{course.description}</p>
                {course.department && (
                  <p className="mt-2 text-xs text-purple-600 font-medium">🏛️ {course.department}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <p>{course.enrolled?.length || 0} students</p>
                    <p>Capacity: {course.capacity || 'N/A'}</p>
                  </div>
                  {course.startDate && course.endDate && (
                    <div className="text-xs text-slate-400">
                      <p>{new Date(course.startDate).toLocaleDateString()}</p>
                      <p>to {new Date(course.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                {Array.isArray(course.tags) && course.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {course.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/faculty/manage-modules/${course.id}`}
                    className="flex-1 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-600 transition hover:bg-purple-100 text-center"
                  >
                    Manage Modules
                  </Link>
                  <Link
                    to={`/courses/${course.id}`}
                    className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {user?.department ? `No courses found in ${user.department} department yet.` : 'No courses available.'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {user?.department ? 'Courses will appear here once they are created for your department.' : 'Contact administrator to set your department.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyCourses;

