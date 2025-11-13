import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forumService } from '../../services/forumService';
import { listCourses } from '../../services/courseService';

const ForumList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const coursesData = await listCourses();
      setCourses(coursesData);
      
      // Load categories for all courses
      const allCategories = [];
      for (const course of coursesData) {
        try {
          const courseCategories = await forumService.getCategoriesByCourse(course.id);
          allCategories.push(...courseCategories.map(c => ({ ...c, courseName: course.title })));
        } catch (error) {
          console.error(`Error loading categories for course ${course.id}:`, error);
        }
      }
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading forum...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Discussion Forum</h1>
          <p className="text-gray-600">Course discussions and Q&A</p>
        </div>
        <button
          onClick={() => navigate('/forum/create')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Create Thread
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No forum categories available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/forum/category/${category.id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition shadow-sm"
            >
              <h3 className="text-lg font-semibold text-black mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.courseName}</p>
              <p className="text-xs text-gray-500">{category.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumList;

