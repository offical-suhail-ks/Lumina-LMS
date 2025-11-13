import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { useSelector } from 'react-redux';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const quizData = await quizService.getQuizById(id);
      setQuiz(quizData);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const attempt = await quizService.startAttempt(id, user.id);
      navigate(`/quizzes/${id}/take/${attempt.id}`);
    } catch (error) {
      alert(error.message || 'Failed to start quiz');
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="p-8 text-black">Quiz not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">{quiz.title}</h1>
        <p className="text-gray-600">{quiz.description}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Type</p>
            <p className="text-black font-medium">{quiz.quizType}</p>
          </div>
          {quiz.timeLimit && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Time Limit</p>
              <p className="text-black font-medium">{quiz.timeLimit} minutes</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Points</p>
            <p className="text-black font-medium">{quiz.totalPoints}</p>
          </div>
          {quiz.passingScore && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Passing Score</p>
              <p className="text-black font-medium">{quiz.passingScore}%</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleStartQuiz}
        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
      >
        Start Quiz
      </button>
    </div>
  );
};

export default QuizDetail;

