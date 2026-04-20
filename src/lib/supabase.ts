import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2EpGAhvdqN36MrQkXqAxEg_nXG4Rs3r';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
