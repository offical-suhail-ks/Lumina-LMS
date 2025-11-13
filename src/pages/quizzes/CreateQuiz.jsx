import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { quizService } from '../../services/quizService';
import { listCourses } from '../../services/courseService';
import { getModulesByCourse } from '../../services/moduleService';
import api from '../../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    moduleId: '',
    title: '',
    description: '',
    quizType: 'quiz',
    timeLimit: '',
    passingScore: '',
    allowRetake: false,
    maxAttempts: 1,
    shuffleQuestions: false,
    showResults: true,
    startDate: '',
    endDate: '',
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    points: 1,
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      loadModules();
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

  const generateAIQuestions = async () => {
    if (!formData.title || !formData.courseId) {
      alert('Please fill in quiz title and select a course first');
      return;
    }

    setAiGenerating(true);
    try {
      // AI Integration placeholder - in production, this would call an AI service
      const response = await api.post('/ai/generate-questions', {
        topic: formData.title,
        courseId: formData.courseId,
        count: 5,
      });
      
      // For now, generate sample questions
      const sampleQuestions = [
        {
          questionText: `What is the main topic of ${formData.title}?`,
          questionType: 'multiple_choice',
          points: 1,
          options: [
            { text: 'Option A', isCorrect: true },
            { text: 'Option B', isCorrect: false },
            { text: 'Option C', isCorrect: false },
            { text: 'Option D', isCorrect: false },
          ],
        },
        {
          questionText: `Explain the key concepts in ${formData.title}`,
          questionType: 'short_answer',
          points: 2,
          options: [],
        },
      ];

      setQuestions([...questions, ...sampleQuestions]);
      alert('AI generated questions added! (This is a demo - integrate with actual AI service)');
    } catch (error) {
      // Fallback to demo questions
      const sampleQuestions = [
        {
          questionText: `What is the main topic of ${formData.title}?`,
          questionType: 'multiple_choice',
          points: 1,
          options: [
            { text: 'Option A', isCorrect: true },
            { text: 'Option B', isCorrect: false },
            { text: 'Option C', isCorrect: false },
            { text: 'Option D', isCorrect: false },
          ],
        },
      ];
      setQuestions([...questions, ...sampleQuestions]);
      alert('Demo questions added! (AI integration pending)');
    } finally {
      setAiGenerating(false);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText) {
      alert('Please enter a question');
      return;
    }

    if (currentQuestion.questionType === 'multiple_choice' || currentQuestion.questionType === 'true_false') {
      const hasCorrect = currentQuestion.options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        alert('Please mark at least one option as correct');
        return;
      }
    }

    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setLoading(true);
    try {
      const quiz = await quizService.createQuiz({
        ...formData,
        createdBy: user.id,
      });

      // Add questions
      for (const q of questions) {
        const question = await quizService.addQuestion(quiz.id, {
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
        });

        // Add options for multiple choice/true false
        if (q.questionType === 'multiple_choice' || q.questionType === 'true_false') {
          for (let i = 0; i < q.options.length; i++) {
            await quizService.addQuestionOption(question.id, {
              optionText: q.options[i].text,
              isCorrect: q.options[i].isCorrect,
              orderIndex: i,
            });
          }
        }
      }

      alert('Quiz created successfully!');
      navigate('/quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'faculty') {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">You don't have permission to create quizzes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Create Quiz</h1>
        <p className="text-gray-600">Build quizzes with AI-powered question generation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Module (Optional)</label>
              <select
                value={formData.moduleId}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
              >
                <option value="">No module</option>
                {modules.map(module => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Type *</label>
          <select
            required
            value={formData.quizType}
            onChange={(e) => setFormData({ ...formData, quizType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          >
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
            <input
              type="number"
              value={formData.passingScore}
              onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Attempts</label>
            <input
              type="number"
              value={formData.maxAttempts}
              onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.allowRetake}
              onChange={(e) => setFormData({ ...formData, allowRetake: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Allow Retake</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.shuffleQuestions}
              onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Shuffle Questions</span>
          </label>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">Questions ({questions.length})</h2>
            <button
              type="button"
              onClick={generateAIQuestions}
              disabled={aiGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {aiGenerating ? 'Generating...' : '🤖 Generate with AI'}
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {questions.map((q, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="font-medium text-black">{q.questionText}</p>
                <p className="text-sm text-gray-600 mt-1">{q.questionType} - {q.points} points</p>
              </div>
            ))}
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="font-medium text-black mb-4">Add New Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                <textarea
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={currentQuestion.questionType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        questionType: newType,
                        options: newType === 'multiple_choice' 
                          ? [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]
                          : newType === 'true_false'
                          ? [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }]
                          : [],
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points *</label>
                  <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseFloat(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>
              </div>

              {(currentQuestion.questionType === 'multiple_choice' || currentQuestion.questionType === 'true_false') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                  {currentQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[idx].text = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[idx].isCorrect = e.target.checked;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Correct</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addQuestion}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;

