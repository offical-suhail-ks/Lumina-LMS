/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const forumService = {
  async createCategory(categoryData) {
    const id = `cat-${uuid()}`;
    const { name, description, courseId, orderIndex = 0 } = categoryData;

    await query(
      `INSERT INTO forum_categories (id, name, description, course_id, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, description, courseId, orderIndex]
    );

    return this.getCategoryById(id);
  },

  async getCategoryById(id) {
    const [category] = await query(
      `SELECT 
        id, name, description, course_id as courseId, order_index as orderIndex,
        created_at as createdAt
      FROM forum_categories WHERE id = ?`,
      [id]
    );
    return category;
  },

  async getCategoriesByCourse(courseId) {
    const categories = await query(
      `SELECT 
        id, name, description, course_id as courseId, order_index as orderIndex,
        created_at as createdAt
      FROM forum_categories 
      WHERE course_id = ? OR course_id IS NULL
      ORDER BY order_index, name`,
      [courseId]
    );
    return categories;
  },

  async createThread(threadData) {
    const id = `thread-${uuid()}`;
    const {
      categoryId,
      courseId,
      title,
      content,
      authorId,
      authorName,
      authorRole,
    } = threadData;

    await query(
      `INSERT INTO forum_threads (
        id, category_id, course_id, title, content,
        author_id, author_name, author_role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, categoryId, courseId, title, content, authorId, authorName, authorRole]
    );

    return this.getThreadById(id);
  },

  async getThreadById(id) {
    const [thread] = await query(
      `SELECT 
        id, category_id as categoryId, course_id as courseId,
        title, content, author_id as authorId, author_name as authorName,
        author_role as authorRole, is_pinned as isPinned,
        is_locked as isLocked, views, reply_count as replyCount,
        last_reply_at as lastReplyAt, created_at as createdAt,
        updated_at as updatedAt
      FROM forum_threads WHERE id = ?`,
      [id]
    );

    if (thread) {
      // Increment views
      await query(`UPDATE forum_threads SET views = views + 1 WHERE id = ?`, [id]);
      thread.views = (thread.views || 0) + 1;
    }

    return thread;
  },

  async getThreadsByCategory(categoryId) {
    const threads = await query(
      `SELECT 
        id, category_id as categoryId, course_id as courseId,
        title, content, author_id as authorId, author_name as authorName,
        author_role as authorRole, is_pinned as isPinned,
        is_locked as isLocked, views, reply_count as replyCount,
        last_reply_at as lastReplyAt, created_at as createdAt
      FROM forum_threads 
      WHERE category_id = ?
      ORDER BY is_pinned DESC, last_reply_at DESC, created_at DESC`,
      [categoryId]
    );
    return threads;
  },

  async createReply(replyData) {
    const id = `reply-${uuid()}`;
    const {
      threadId,
      content,
      authorId,
      authorName,
      authorRole,
    } = replyData;

    await query(
      `INSERT INTO forum_replies (
        id, thread_id, content, author_id, author_name, author_role
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, threadId, content, authorId, authorName, authorRole]
    );

    // Update thread reply count and last reply time
    await query(
      `UPDATE forum_threads 
       SET reply_count = reply_count + 1, last_reply_at = NOW()
       WHERE id = ?`,
      [threadId]
    );

    return this.getReplyById(id);
  },

  async getReplyById(id) {
    const [reply] = await query(
      `SELECT 
        id, thread_id as threadId, content,
        author_id as authorId, author_name as authorName,
        author_role as authorRole, is_solution as isSolution,
        created_at as createdAt, updated_at as updatedAt
      FROM forum_replies WHERE id = ?`,
      [id]
    );
    return reply;
  },

  async getRepliesByThread(threadId) {
    const replies = await query(
      `SELECT 
        id, thread_id as threadId, content,
        author_id as authorId, author_name as authorName,
        author_role as authorRole, is_solution as isSolution,
        created_at as createdAt, updated_at as updatedAt
      FROM forum_replies 
      WHERE thread_id = ?
      ORDER BY created_at ASC`,
      [threadId]
    );
    return replies;
  },

  async markAsSolution(replyId) {
    // Unmark other solutions in the thread
    const reply = await this.getReplyById(replyId);
    await query(
      `UPDATE forum_replies SET is_solution = FALSE WHERE thread_id = ?`,
      [reply.threadId]
    );

    // Mark this as solution
    await query(
      `UPDATE forum_replies SET is_solution = TRUE WHERE id = ?`,
      [replyId]
    );

    return this.getReplyById(replyId);
  },
};

module.exports = forumService;

