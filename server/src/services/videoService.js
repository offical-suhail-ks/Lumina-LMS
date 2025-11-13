/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const videoService = {
  async addVideo(videoData) {
    const id = `video-${uuid()}`;
    const {
      courseId,
      moduleId,
      title,
      description,
      videoUrl,
      videoType,
      duration,
      thumbnailUrl,
      orderIndex = 0,
      isPreview = false,
    } = videoData;

    await query(
      `INSERT INTO course_videos (
        id, course_id, module_id, title, description,
        video_url, video_type, duration, thumbnail_url,
        order_index, is_preview
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, courseId, moduleId, title, description,
        videoUrl, videoType, duration, thumbnailUrl,
        orderIndex, isPreview ? 1 : 0,
      ]
    );

    return this.getVideoById(id);
  },

  async getVideoById(id) {
    const [video] = await query(
      `SELECT 
        id, course_id as courseId, module_id as moduleId,
        title, description, video_url as videoUrl,
        video_type as videoType, duration, thumbnail_url as thumbnailUrl,
        order_index as orderIndex, is_preview as isPreview,
        created_at as createdAt
      FROM course_videos WHERE id = ?`,
      [id]
    );
    return video;
  },

  async getVideosByCourse(courseId) {
    const videos = await query(
      `SELECT 
        id, course_id as courseId, module_id as moduleId,
        title, description, video_url as videoUrl,
        video_type as videoType, duration, thumbnail_url as thumbnailUrl,
        order_index as orderIndex, is_preview as isPreview,
        created_at as createdAt
      FROM course_videos 
      WHERE course_id = ?
      ORDER BY order_index, created_at`,
      [courseId]
    );
    return videos;
  },

  async updateVideoProgress(videoId, studentId, progressData) {
    const { progressPercentage, watchedDuration, isCompleted } = progressData;

    const id = `vp-${uuid()}`;
    await query(
      `INSERT INTO video_progress (
        id, video_id, student_id, progress_percentage,
        watched_duration, is_completed, last_watched_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        progress_percentage = VALUES(progress_percentage),
        watched_duration = VALUES(watched_duration),
        is_completed = VALUES(is_completed),
        last_watched_at = NOW()`,
      [id, videoId, studentId, progressPercentage, watchedDuration, isCompleted ? 1 : 0]
    );

    return this.getVideoProgress(videoId, studentId);
  },

  async getVideoProgress(videoId, studentId) {
    const [progress] = await query(
      `SELECT 
        id, video_id as videoId, student_id as studentId,
        progress_percentage as progressPercentage,
        watched_duration as watchedDuration,
        is_completed as isCompleted,
        last_watched_at as lastWatchedAt
      FROM video_progress 
      WHERE video_id = ? AND student_id = ?`,
      [videoId, studentId]
    );
    return progress;
  },

  async getStudentVideoProgress(studentId, courseId) {
    const progress = await query(
      `SELECT 
        vp.id, vp.video_id as videoId, vp.student_id as studentId,
        vp.progress_percentage as progressPercentage,
        vp.watched_duration as watchedDuration,
        vp.is_completed as isCompleted,
        v.id as videoId, v.title as videoTitle,
        v.duration as videoDuration
      FROM video_progress vp
      JOIN course_videos v ON vp.video_id = v.id
      WHERE vp.student_id = ? AND v.course_id = ?`,
      [studentId, courseId]
    );
    return progress;
  },
};

module.exports = videoService;

