import { supabase } from '../../../services/supabaseClient';

// PROGRAMS - CRUD Operations
export const fetchPrograms = async () => {
  const { data, error } = await supabase
    .from('program')
    .select('*')
    .order('program_name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createProgram = async (programData) => {
  const { data, error } = await supabase
    .from('program')
    .insert([programData])
    .select();
  
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

export const updateProgram = async (id, programData) => {
  const { data, error } = await supabase
    .from('program')
    .update(programData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

export const deleteProgram = async (id) => {
  const { error } = await supabase
    .from('program')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// PURPOSES - CRUD Operations
export const fetchPurposes = async () => {
  const { data, error } = await supabase
    .from('purpose')
    .select('*')
    .order('purpose_name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createPurpose = async (purposeData) => {
  const { data, error } = await supabase
    .from('purpose')
    .insert([purposeData])
    .select();
  
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

export const updatePurpose = async (id, purposeData) => {
  const { data, error } = await supabase
    .from('purpose')
    .update(purposeData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

export const deletePurpose = async (id, purposeName) => {
  // Prevent deletion of "Others" purpose
  if (purposeName === 'Others') {
    throw new Error('Cannot delete "Others" - this is a required system field');
  }
  
  const { error } = await supabase
    .from('purpose')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const fetchArchiveSettings = async () => {
  const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', 'archive_config')
      .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.setting_value || { intervalMonths: 6, lastArchived: new Date().toISOString() };
};

export const updateArchiveSettings = async (settings) => {
  const { error } = await supabase
      .from('system_settings')
      .upsert(
          {
            setting_key: 'archive_config',
            setting_value: settings
          },
          { onConflict: 'setting_key' }
      );
  if (error) throw error;
};