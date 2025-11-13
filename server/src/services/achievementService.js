/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const achievementService = {
  async createAchievement(achievementData) {
    const id = `ach-${uuid()}`;
    const {
      name,
      description,
      iconUrl,
      points = 0,
      achievementType = 'custom',
      criteria,
    } = achievementData;

    await query(
      `INSERT INTO achievements (
        id, name, description, icon_url, points, achievement_type, criteria
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, description, iconUrl, points, achievementType,
        criteria ? JSON.stringify(criteria) : null,
      ]
    );

    return this.getAchievementById(id);
  },

  async getAchievementById(id) {
    const [achievement] = await query(
      `SELECT 
        id, name, description, icon_url as iconUrl,
        points, achievement_type as achievementType,
        criteria, created_at as createdAt
      FROM achievements WHERE id = ?`,
      [id]
    );
    if (achievement && achievement.criteria) {
      achievement.criteria = JSON.parse(achievement.criteria);
    }
    return achievement;
  },

  async getAllAchievements() {
    const achievements = await query(
      `SELECT 
        id, name, description, icon_url as iconUrl,
        points, achievement_type as achievementType,
        criteria, created_at as createdAt
      FROM achievements ORDER BY created_at DESC`
    );
    return achievements.map(a => ({
      ...a,
      criteria: a.criteria ? JSON.parse(a.criteria) : null,
    }));
  },

  async awardAchievement(studentId, achievementId) {
    // Check if already awarded
    const existing = await query(
      `SELECT id FROM student_achievements 
       WHERE student_id = ? AND achievement_id = ?`,
      [studentId, achievementId]
    );

    if (existing.length > 0) {
      return existing[0];
    }

    const id = `sa-${uuid()}`;
    await query(
      `INSERT INTO student_achievements (id, student_id, achievement_id)
       VALUES (?, ?, ?)`,
      [id, studentId, achievementId]
    );

    return this.getStudentAchievement(id);
  },

  async getStudentAchievement(id) {
    const [studentAchievement] = await query(
      `SELECT 
        sa.id, sa.student_id as studentId, sa.achievement_id as achievementId,
        sa.earned_at as earnedAt,
        a.name as achievementName, a.description as achievementDescription,
        a.icon_url as achievementIcon, a.points as achievementPoints
      FROM student_achievements sa
      JOIN achievements a ON sa.achievement_id = a.id
      WHERE sa.id = ?`,
      [id]
    );
    return studentAchievement;
  },

  async getStudentAchievements(studentId) {
    const achievements = await query(
      `SELECT 
        sa.id, sa.student_id as studentId, sa.achievement_id as achievementId,
        sa.earned_at as earnedAt,
        a.name as achievementName, a.description as achievementDescription,
        a.icon_url as achievementIcon, a.points as achievementPoints,
        a.achievement_type as achievementType
      FROM student_achievements sa
      JOIN achievements a ON sa.achievement_id = a.id
      WHERE sa.student_id = ?
      ORDER BY sa.earned_at DESC`,
      [studentId]
    );
    return achievements;
  },

  async checkAndAwardAchievements(studentId) {
    // Check course completion
    const completedCourses = await query(
      `SELECT ce.course_id, c.title
       FROM course_enrollments ce
       JOIN courses c ON ce.course_id = c.id
       WHERE ce.student_id = ?`,
      [studentId]
    );

    // Award course completion achievements
    for (const course of completedCourses) {
      const achievement = await query(
        `SELECT id FROM achievements 
         WHERE achievement_type = 'course_completion' 
         AND criteria LIKE ?`,
        [`%${course.course_id}%`]
      );

      if (achievement.length > 0) {
        await this.awardAchievement(studentId, achievement[0].id);
      }
    }
  },
};

module.exports = achievementService;

