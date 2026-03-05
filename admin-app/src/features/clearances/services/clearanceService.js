import { supabase } from '../../../services/supabaseClient';

export const fetchClearances = async () => {
  const { data: clearanceData, error: clearanceError } = await supabase
    .from('clearance')
    .select('*')
    .order('data_logged', { ascending: false });

  if (clearanceError) throw clearanceError;
  if (!clearanceData || clearanceData.length === 0) return [];

  const studentIds = Array.from(new Set(clearanceData.map((c) => c.student_id).filter(Boolean)));
  
  // Updated to join program and purpose tables based on the supabase
  const { data: studentsData, error: studentsError } = await supabase
    .from('student')
    .select(`
      *,
      program:program_id(program_name),
      purpose:purpose_id(purpose_name)
    `)
    .in('student_id', studentIds);

  if (studentsError) throw studentsError;
  const studentById = Object.fromEntries((studentsData || []).map((s) => [s.student_id, s]));

  return clearanceData.map((c) => ({
    ...c,
    student: studentById[c.student_id] || null,
  }));
};

export const fetchClearanceReportData = async () => {
  // Updated to join program and purpose tables based on your schema
  const { data, error } = await supabase
    .from('clearance')
    .select(`
      clearance_status,
      data_logged,
      student:student_id (
        student_number, 
        first_name, 
        last_name, 
        program:program_id(program_name),
        purpose:purpose_id(purpose_name)
      ),
      librarian:last_updated_by (
        first_name, 
        last_name
      )
    `)
    .order('data_logged', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchDashboardMetrics = async () => {
  const { count: pending, error: pendingError } = await supabase
    .from('clearance')
    .select('*', { count: 'exact', head: true })
    .eq('clearance_status', 'NOT CLEARED');

  if (pendingError) throw pendingError;

  const { count: cleared, error: clearedError } = await supabase
    .from('clearance')
    .select('*', { count: 'exact', head: true })
    .eq('clearance_status', 'CLEARED');

  if (clearedError) throw clearedError;

  const { count: total, error: totalError } = await supabase
    .from('clearance')
    .select('*', { count: 'exact', head: true });

  if (totalError) throw totalError;

  const unfinished = Math.max(0, (total || 0) - (cleared || 0));

  return {
    pending: pending || 0,
    unfinished,
    cleared: cleared || 0,
  };
};

export const fetchRecentAuditActivity = async (limit = 5) => {
  const { data, error } = await supabase
    .from('audit_trail')
    .select(`
      audit_id,
      action_type,
      old_status,
      new_status,
      editor_name,
      timestamp,
      remarks,
      student:student_id (
        student_number,
        first_name,
        middle_name,
        last_name
      )
    `)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};