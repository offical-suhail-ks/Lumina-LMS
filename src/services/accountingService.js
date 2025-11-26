import { supabase } from '../lib/supabase';

export const getAccountingTasks = async (filters = {}) => {
  let query = supabase
    .from('accounting_tasks')
    .select(`
      id,
      student_id,
      task_type,
      status,
      priority,
      assigned_to,
      title,
      description,
      student_data,
      fee_details,
      notes,
      admin_remarks,
      accounting_remarks,
      completed_at,
      completed_by,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at,
      students:student_id (
        first_name,
        last_name,
        email,
        application_status
      ),
      users:assigned_to (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  if (filters.taskType) {
    query = query.eq('task_type', filters.taskType);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform the data to match the expected format
  return (data || []).map(task => {
    const parseJSON = (value) => {
      if (!value) return null;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    return {
      id: task.id,
      studentId: task.student_id,
      taskType: task.task_type,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assigned_to,
      title: task.title,
      description: task.description,
      studentData: parseJSON(task.student_data),
      feeDetails: parseJSON(task.fee_details),
      notes: task.notes,
      adminRemarks: task.admin_remarks,
      accountingRemarks: task.accounting_remarks,
      completedAt: task.completed_at,
      completedBy: task.completed_by,
      reviewedBy: task.reviewed_by,
      reviewedAt: task.reviewed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      studentFirstName: task.students?.first_name || null,
      studentLastName: task.students?.last_name || null,
      studentEmail: task.students?.email || null,
      applicationStatus: task.students?.application_status || null,
      assignedToName: task.users?.name || null,
    };
  });
};

export const getAccountingTask = async (id) => {
  const { data, error } = await supabase
    .from('accounting_tasks')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name,
        email,
        phone,
        course_id,
        application_status
      ),
      users:assigned_to (
        name
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  if (!data) return null;

  const parseJSON = (value) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  return {
    ...data,
    studentId: data.student_id,
    taskType: data.task_type,
    assignedTo: data.assigned_to,
    studentData: parseJSON(data.student_data),
    feeDetails: parseJSON(data.fee_details),
    adminRemarks: data.admin_remarks,
    accountingRemarks: data.accounting_remarks,
    completedAt: data.completed_at,
    completedBy: data.completed_by,
    reviewedBy: data.reviewed_by,
    reviewedAt: data.reviewed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    studentFirstName: data.students?.first_name || null,
    studentLastName: data.students?.last_name || null,
    studentEmail: data.students?.email || null,
    studentPhone: data.students?.phone || null,
    courseId: data.students?.course_id || null,
    applicationStatus: data.students?.application_status || null,
    assignedToName: data.users?.name || null,
  };
};

export const updateAccountingTask = async (id, updateData) => {
  const updatePayload = {
    ...updateData,
    updated_at: new Date().toISOString(),
  };
  
  // Handle JSON fields
  if (updateData.feeDetails) {
    updatePayload.fee_details = typeof updateData.feeDetails === 'string' 
      ? updateData.feeDetails 
      : JSON.stringify(updateData.feeDetails);
  }
  if (updateData.studentData) {
    updatePayload.student_data = typeof updateData.studentData === 'string'
      ? updateData.studentData
      : JSON.stringify(updateData.studentData);
  }

  const { data, error } = await supabase
    .from('accounting_tasks')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const completeAccountingTask = async (id, completedBy, feeDetails, accountingRemarks) => {
  const updatePayload = {
    status: 'completed',
    completed_by: completedBy,
    completed_at: new Date().toISOString(),
    accounting_remarks: accountingRemarks,
    updated_at: new Date().toISOString(),
  };
  
  if (feeDetails) {
    updatePayload.fee_details = typeof feeDetails === 'string' 
      ? feeDetails 
      : JSON.stringify(feeDetails);
  }

  const { data, error } = await supabase
    .from('accounting_tasks')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const sendTaskToAdmin = async (id, completedBy, feeDetails, accountingRemarks) => {
  const updatePayload = {
    status: 'pending',
    completed_by: completedBy,
    completed_at: new Date().toISOString(),
    accounting_remarks: accountingRemarks,
    updated_at: new Date().toISOString(),
  };
  
  if (feeDetails) {
    updatePayload.fee_details = typeof feeDetails === 'string'
      ? feeDetails
      : JSON.stringify(feeDetails);
  }

  const { data, error } = await supabase
    .from('accounting_tasks')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const reviewTask = async (id, reviewedBy, action, adminRemarks) => {
  const updatePayload = {
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
    admin_remarks: adminRemarks,
    updated_at: new Date().toISOString(),
  };
  
  if (action === 'approve') {
    updatePayload.status = 'completed';
  } else if (action === 'reject') {
    updatePayload.status = 'pending';
  }

  const { data, error } = await supabase
    .from('accounting_tasks')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createAccountingTask = async (taskData) => {
  const insertData = {
    id: crypto.randomUUID(),
    student_id: taskData.studentId,
    task_type: taskData.taskType || 'fee_setup',
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    assigned_to: taskData.assignedTo || null,
    title: taskData.title,
    description: taskData.description || null,
    student_data: taskData.studentData ? (typeof taskData.studentData === 'string' ? taskData.studentData : JSON.stringify(taskData.studentData)) : null,
    fee_details: taskData.feeDetails ? (typeof taskData.feeDetails === 'string' ? taskData.feeDetails : JSON.stringify(taskData.feeDetails)) : null,
    notes: taskData.notes || null,
    admin_remarks: taskData.adminRemarks || null,
    accounting_remarks: taskData.accountingRemarks || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('accounting_tasks')
    .insert(insertData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSalaries = async (filters = {}) => {
  let query = supabase
    .from('salaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.employeeType) {
    query = query.eq('employee_type', filters.employeeType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getSalary = async (id) => {
  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createSalary = async (salaryData) => {
  const insertData = {
    id: crypto.randomUUID(),
    ...salaryData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('salaries')
    .insert(insertData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSalary = async (id, updateData) => {
  const updatePayload = {
    ...updateData,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('salaries')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSalaryPayments = async (salaryId) => {
  const { data, error } = await supabase
    .from('salary_payments')
    .select('*')
    .eq('salary_id', salaryId)
    .order('payment_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createSalaryPayment = async (salaryId, paymentData) => {
  const insertData = {
    id: crypto.randomUUID(),
    salary_id: salaryId,
    ...paymentData,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('salary_payments')
    .insert(insertData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSalaryPayment = async (id, updateData) => {
  const updatePayload = {
    ...updateData,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('salary_payments')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

