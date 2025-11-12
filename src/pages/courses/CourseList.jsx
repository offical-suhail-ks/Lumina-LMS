import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listCourses } from '../../services/courseService';

const CourseList = () => {
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await listCourses();
        
        // Filter courses by instructor for faculty
        if (user?.role === 'faculty') {
          const myCourses = data.filter(c => 
            c.instructor?.toLowerCase() === user?.name?.toLowerCase() || 
            c.instructor?.toLowerCase().includes(user?.name?.split(' ')[0]?.toLowerCase() || '')
          );
          setCourses(myCourses);
        } else {
          setCourses(data);
        }
      } catch (error) {
        console.error(error);
        setError('Unable to load courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          {user?.role === 'faculty' ? 'My Courses' : 'Courses'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {user?.role === 'faculty' 
            ? 'Manage your assigned courses and track student progress.'
            : 'Explore live programmes, check schedules, and dive into curated learning paths.'}
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading courses...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-500">No courses available yet.</p>
        ) : (
          <ul className="space-y-4">
            {courses.map(course => (
              <li
                key={course.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="text-base font-semibold text-slate-900">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{course.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Led by {course.instructor} · Capacity {course.capacity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                  <Link
                    to={`/courses/${course.id}`}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-600 transition hover:bg-indigo-100"
                  >
                    View details
                  </Link>
                  {Array.isArray(course.tags) && course.tags.length > 0 ? (
                    <div className="flex flex-wrap justify-end gap-1 text-[11px] font-semibold uppercase text-indigo-500">
                      {course.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CourseList;
