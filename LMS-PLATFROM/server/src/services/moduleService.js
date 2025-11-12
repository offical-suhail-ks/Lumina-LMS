/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const moduleService = {
  async getAllByCourse(courseId) {
    const modules = await query(
      `SELECT 
        m.id, m.course_id as courseId, m.title, m.description, 
        m.duration_hours as durationHours, m.order_index as orderIndex,
        m.created_at as createdAt, m.updated_at as updatedAt
      FROM course_modules m
      WHERE m.course_id = ?
      ORDER BY m.order_index ASC, m.created_at ASC`,
      [courseId]
    );

    // Get materials for each module
    for (const module of modules) {
      const materials = await query(
        `SELECT 
          mat.id, mat.module_id as moduleId, mat.title, mat.file_name as fileName,
          mat.file_path as filePath, mat.file_size as fileSize, mat.file_type as fileType,
          mat.uploaded_by as uploadedBy, mat.created_at as createdAt
        FROM module_materials mat
        WHERE mat.module_id = ?
        ORDER BY mat.created_at ASC`,
        [module.id]
      );
      // Convert BigInt to Number for JSON serialization
      module.materials = materials.map(mat => ({
        ...mat,
        fileSize: mat.fileSize ? Number(mat.fileSize) : null,
      }));
    }

    return modules;
  },

  async getById(id) {
    const [module] = await query(
      `SELECT 
        m.id, m.course_id as courseId, m.title, m.description, 
        m.duration_hours as durationHours, m.order_index as orderIndex,
        m.created_at as createdAt, m.updated_at as updatedAt
      FROM course_modules m
      WHERE m.id = ?`,
      [id]
    );

    if (module) {
      const materials = await query(
        `SELECT 
          mat.id, mat.module_id as moduleId, mat.title, mat.file_name as fileName,
          mat.file_path as filePath, mat.file_size as fileSize, mat.file_type as fileType,
          mat.uploaded_by as uploadedBy, mat.created_at as createdAt
        FROM module_materials mat
        WHERE mat.module_id = ?
        ORDER BY mat.created_at ASC`,
        [id]
      );
      // Convert BigInt to Number for JSON serialization
      module.materials = materials.map(mat => ({
        ...mat,
        fileSize: mat.fileSize ? Number(mat.fileSize) : null,
      }));
    }

    return module || null;
  },

  async create(moduleData) {
    const id = `module-${uuid()}`;
    const { courseId, title, description, durationHours, orderIndex } = moduleData;

    await query(
      `INSERT INTO course_modules (id, course_id, title, description, duration_hours, order_index)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, courseId, title, description || null, durationHours || null, orderIndex || 0]
    );

    return this.getById(id);
  },

  async update(id, moduleData) {
    const { title, description, durationHours, orderIndex } = moduleData;

    await query(
      `UPDATE course_modules SET
        title = COALESCE(?, title),
        description = ?,
        duration_hours = ?,
        order_index = COALESCE(?, order_index),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [title, description, durationHours || null, orderIndex || null, id]
    );

    return this.getById(id);
  },

  async delete(id) {
    const result = await query('DELETE FROM course_modules WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async addMaterial(moduleId, materialData) {
    const id = `material-${uuid()}`;
    const { title, fileName, filePath, fileSize, fileType, uploadedBy } = materialData;

    await query(
      `INSERT INTO module_materials (id, module_id, title, file_name, file_path, file_size, file_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, moduleId, title, fileName || null, filePath || null, fileSize || null, fileType || null, uploadedBy || null]
    );

    const [material] = await query(
      `SELECT 
        id, module_id as moduleId, title, file_name as fileName,
        file_path as filePath, file_size as fileSize, file_type as fileType,
        uploaded_by as uploadedBy, created_at as createdAt
      FROM module_materials
      WHERE id = ?`,
      [id]
    );

    // Convert BigInt to Number for JSON serialization
    if (material) {
      return {
        ...material,
        fileSize: material.fileSize ? Number(material.fileSize) : null,
      };
    }

    return material;
  },

  async deleteMaterial(materialId) {
    const result = await query('DELETE FROM module_materials WHERE id = ?', [materialId]);
    return result.affectedRows > 0;
  },
};

module.exports = moduleService;
