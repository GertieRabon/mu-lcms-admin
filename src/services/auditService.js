import { supabase } from './supabaseClient';

export const updateClearanceWithAudit = async (data) => {
    const { clearance_uuid, student_id, old_status, new_status, performed_by, editor_name, remarks, last_fetched_at } = data;

    // 1. Update with WHERE clause check (Conflict Resolution)
    const { data: updateData, error: clearanceError, count } = await supabase
        .from('clearance')
        .update({
            clearance_status: new_status,
            last_updated_by: performed_by,
            last_updated_at: new Date().toISOString()
        })
        .eq('clearance_uuid', clearance_uuid)
        .eq('last_updated_at', last_fetched_at) // Only update if timestamp matches
        .select();

    // If count is 0 but there was no error, someone else updated it first
    if (!clearanceError && (!updateData || updateData.length === 0)) {
        throw new Error("CONFLICT_DETECTED: This record was recently updated by another librarian. Please refresh the page.");
    }

    if (clearanceError) throw clearanceError;

  // 2. Insert into Audit Trail Table (FR4.1)
  const { error: auditError } = await supabase
    .from('audit_trail')
    .insert([{
      clearance_uuid,
      student_id,
      action_type: 'STATUS_CHANGE',
      old_status,
      new_status,
      performed_by,
      editor_name,
      remarks, // Mandatory if "Not Cleared" per FR3.3
      timestamp: new Date().toISOString()
    }]);

  if (auditError) throw auditError;
};