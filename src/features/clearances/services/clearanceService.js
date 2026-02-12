import { supabase } from '../../../services/supabaseClient';

export const submitStudentLog = async (formData) => {
  // 1. Insert into "student" table (Matches ERD exactly)
  const { data: student, error: sError } = await supabase
    .from('student')
    .insert([{
      student_number: formData.studentNo,
      first_name: formData.firstName,
      middle_name: formData.middleName,
      last_name: formData.lastName,
      program: formData.program,
      purpose_of_clearance: formData.purpose
    }])
    .select()
    .single();

  if (sError) throw sError;

  // 2. Insert into "clearance" table (Matches ERD exactly)
  const { error: logError } = await supabase
    .from('clearance')
    .insert([{
      student_id: student.student_id,
      clearance_status: 'NOT CLEARED',
      data_logged: new Date().toISOString()
    }]);

  if (logError) throw logError;
};

/**
 * Fetch clearance records with related student data so the
 * Clearance List page can display real Supabase data.
 */
export const fetchClearances = async () => {
  try {
    // 1. Fetch raw clearance rows
    const { data: clearanceData, error: clearanceError } = await supabase
      .from('clearance')
      .select('*')
      .order('data_logged', { ascending: false });

    if (clearanceError) {
      console.error('Supabase fetchClearances (clearance) error:', clearanceError);
      throw clearanceError;
    }

    if (!clearanceData || clearanceData.length === 0) {
      return [];
    }

    // 2. Collect all related student IDs
    const studentIds = Array.from(
      new Set(
        clearanceData
          .map((c) => c.student_id)
          .filter(Boolean)
      )
    );

    // 3. Fetch all referenced students in a single query
    const { data: studentsData, error: studentsError } = await supabase
      .from('student')
      .select('*')
      .in('student_id', studentIds);

    if (studentsError) {
      console.error('Supabase fetchClearances (student) error:', studentsError);
      throw studentsError;
    }

    const studentById = Object.fromEntries(
      (studentsData || []).map((s) => [s.student_id, s])
    );

    // 4. Attach student details and expose a friendly clearance_id field
    const result = clearanceData.map((c) => ({
      ...c,
      clearance_id: c.clearance_uuid ?? c.clearance_id,
      student: studentById[c.student_id] || null,
    }));

    return result;
  } catch (err) {
    console.error('fetchClearances failed:', err);
    throw err;
  }
};