import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oigqvrpqsrulujmzshqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZ3F2cnBxc3J1bHVqbXpzaHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE5MDEsImV4cCI6MjA2NzA1NzkwMX0.E4orddM857QdtFn27mGAZTL7Xt5wj8y56K8fparTtMM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);