/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const quizService = {
  async createQuiz(quizData) {
    const id = `quiz-${uuid()}`;
    const {
      courseId,
      title,
      description,
      quizType = 'quiz',
      timeLimit,
      totalPoints = 0,
      passingScore,
      allowRetake = false,
      maxAttempts = 1,
      shuffleQuestions = false,
      showResults = true,
      startDate,
      endDate,
      createdBy,
    } = quizData;

    await query(
      `INSERT INTO quizzes (
        id, course_id, title, description, quiz_type, time_limit,
        total_points, passing_score, allow_retake, max_attempts,
        shuffle_questions, show_results, start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, courseId, title, description, quizType, timeLimit,
        totalPoints, passingScore, allowRetake ? 1 : 0, maxAttempts,
        shuffleQuestions ? 1 : 0, showResults ? 1 : 0, startDate, endDate, createdBy,
      ]
    );

    return this.getQuizById(id);
  },

  async getQuizById(id) {
    const [quiz] = await query(
      `SELECT 
        id, course_id as courseId, title, description, quiz_type as quizType,
        time_limit as timeLimit, total_points as totalPoints,
        passing_score as passingScore, allow_retake as allowRetake,
        max_attempts as maxAttempts, shuffle_questions as shuffleQuestions,
        show_results as showResults, start_date as startDate,
        end_date as endDate, created_by as createdBy,
        created_at as createdAt, updated_at as updatedAt
      FROM quizzes WHERE id = ?`,
      [id]
    );
    return quiz;
  },

  async getQuizzesByCourse(courseId) {
    const quizzes = await query(
      `SELECT 
        id, course_id as courseId, title, description, quiz_type as quizType,
        time_limit as timeLimit, total_points as totalPoints,
        passing_score as passingScore, allow_retake as allowRetake,
        max_attempts as maxAttempts, start_date as startDate,
        end_date as endDate, created_at as createdAt
      FROM quizzes WHERE course_id = ? ORDER BY created_at DESC`,
      [courseId]
    );
    return quizzes;
  },

  async addQuestion(questionData) {
    const id = `q-${uuid()}`;
    const { quizId, questionText, questionType, points = 1, orderIndex = 0 } = questionData;

    await query(
      `INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, quizId, questionText, questionType, points, orderIndex]
    );

    // Update quiz total points
    await query(
      `UPDATE quizzes SET total_points = (
        SELECT COALESCE(SUM(points), 0) FROM quiz_questions WHERE quiz_id = ?
      ) WHERE id = ?`,
      [quizId, quizId]
    );

    return this.getQuestionById(id);
  },

  async getQuestionById(id) {
    const [question] = await query(
      `SELECT 
        id, quiz_id as quizId, question_text as questionText,
        question_type as questionType, points, order_index as orderIndex,
        created_at as createdAt
      FROM quiz_questions WHERE id = ?`,
      [id]
    );
    return question;
  },

  async getQuestionsByQuiz(quizId) {
    const questions = await query(
      `SELECT 
        id, quiz_id as quizId, question_text as questionText,
        question_type as questionType, points, order_index as orderIndex
      FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index, created_at`,
      [quizId]
    );

    // Get options for each question
    for (const question of questions) {
      question.options = await query(
        `SELECT 
          id, question_id as questionId, option_text as optionText,
          is_correct as isCorrect, order_index as orderIndex
        FROM quiz_question_options WHERE question_id = ? ORDER BY order_index`,
        [question.id]
      );
    }

    return questions;
  },

  async addQuestionOption(optionData) {
    const id = `opt-${uuid()}`;
    const { questionId, optionText, isCorrect = false, orderIndex = 0 } = optionData;

    await query(
      `INSERT INTO quiz_question_options (id, question_id, option_text, is_correct, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      [id, questionId, optionText, isCorrect ? 1 : 0, orderIndex]
    );

    return { id, questionId, optionText, isCorrect, orderIndex };
  },

  async startAttempt(quizId, studentId) {
    // Check existing attempts
    const existingAttempts = await query(
      `SELECT attempt_number, status FROM quiz_attempts 
       WHERE quiz_id = ? AND student_id = ? ORDER BY attempt_number DESC`,
      [quizId, studentId]
    );

    const quiz = await this.getQuizById(quizId);
    const attemptNumber = existingAttempts.length + 1;

    if (quiz.maxAttempts && attemptNumber > quiz.maxAttempts) {
      throw new Error('Maximum attempts reached');
    }

    const id = `attempt-${uuid()}`;
    await query(
      `INSERT INTO quiz_attempts (id, quiz_id, student_id, attempt_number, status)
       VALUES (?, ?, ?, ?, 'in_progress')`,
      [id, quizId, studentId, attemptNumber]
    );

    return this.getAttemptById(id);
  },

  async getAttemptById(id) {
    const [attempt] = await query(
      `SELECT 
        id, quiz_id as quizId, student_id as studentId,
        attempt_number as attemptNumber, started_at as startedAt,
        submitted_at as submittedAt, time_taken as timeTaken,
        score, percentage, passed, status
      FROM quiz_attempts WHERE id = ?`,
      [id]
    );
    return attempt;
  },

  async submitAnswer(attemptId, questionId, answerData) {
    const id = `answer-${uuid()}`;
    const { answerText, selectedOptions } = answerData;

    // Get question to auto-grade if possible
    const question = await this.getQuestionById(questionId);
    let isCorrect = null;
    let pointsEarned = 0;

    if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
      const correctOptions = await query(
        `SELECT id FROM quiz_question_options 
         WHERE question_id = ? AND is_correct = TRUE`,
        [questionId]
      );
      const correctOptionIds = correctOptions.map(o => o.id).sort();
      const selectedIds = (selectedOptions || []).sort();

      isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(selectedIds);
      pointsEarned = isCorrect ? question.points : 0;
    }

    await query(
      `INSERT INTO quiz_answers (
        id, attempt_id, question_id, answer_text, selected_options,
        points_earned, is_correct
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        answer_text = VALUES(answer_text),
        selected_options = VALUES(selected_options),
        points_earned = VALUES(points_earned),
        is_correct = VALUES(is_correct)`,
      [
        id, attemptId, questionId, answerText,
        selectedOptions ? JSON.stringify(selectedOptions) : null,
        pointsEarned, isCorrect,
      ]
    );

    return { id, attemptId, questionId, answerText, selectedOptions, pointsEarned, isCorrect };
  },

  async submitAttempt(attemptId, timeTaken) {
    // Calculate score
    const answers = await query(
      `SELECT points_earned FROM quiz_answers WHERE attempt_id = ?`,
      [attemptId]
    );
    const totalScore = answers.reduce((sum, a) => sum + parseFloat(a.points_earned || 0), 0);

    const attempt = await this.getAttemptById(attemptId);
    const quiz = await this.getQuizById(attempt.quizId);

    const percentage = quiz.totalPoints > 0
      ? (totalScore / quiz.totalPoints) * 100
      : 0;

    const passed = quiz.passingScore
      ? percentage >= quiz.passingScore
      : null;

    await query(
      `UPDATE quiz_attempts 
       SET submitted_at = NOW(), time_taken = ?, score = ?, percentage = ?, passed = ?, status = 'submitted'
       WHERE id = ?`,
      [timeTaken, totalScore, percentage, passed, attemptId]
    );

    return this.getAttemptById(attemptId);
  },

  async getAttemptResults(attemptId) {
    const attempt = await this.getAttemptById(attemptId);
    const quiz = await this.getQuizById(attempt.quizId);
    const questions = await this.getQuestionsByQuiz(attempt.quizId);

    const answers = await query(
      `SELECT 
        id, question_id as questionId, answer_text as answerText,
        selected_options as selectedOptions, points_earned as pointsEarned,
        is_correct as isCorrect
      FROM quiz_answers WHERE attempt_id = ?`,
      [attemptId]
    );

    // Map answers to questions
    questions.forEach(question => {
      question.answer = answers.find(a => a.questionId === question.id);
    });

    return {
      attempt,
      quiz,
      questions,
    };
  },
};

module.exports = quizService;

