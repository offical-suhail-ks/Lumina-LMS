import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { quizService } from '../../services/quizService';
import { listCourses } from '../../services/courseService';

const QuizList = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const coursesData = await listCourses();
      setCourses(coursesData);
      
      // Load quizzes for all courses
      const allQuizzes = [];
      for (const course of coursesData) {
        try {
          const courseQuizzes = await quizService.getQuizzesByCourse(course.id);
          allQuizzes.push(...courseQuizzes.map(q => ({ ...q, courseName: course.title })));
        } catch (error) {
          console.error(`Error loading quizzes for course ${course.id}:`, error);
        }
      }
      setQuizzes(allQuizzes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading quizzes...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Quizzes & Exams</h1>
          <p className="text-gray-600">Take quizzes and view your results</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button
            onClick={() => navigate('/quizzes/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Quiz
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No quizzes available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map(quiz => (
            <Link
              key={quiz.id}
              to={`/quizzes/${quiz.id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-1">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{quiz.courseName}</p>
                  <p className="text-xs text-gray-500">{quiz.description}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {quiz.quizType}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;

