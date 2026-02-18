-- 1. Enable RLS on the projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can see projects they created
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Policy: Users can see projects shared with them (via email)
-- This assumes auth.jwt() contains the user's email
CREATE POLICY "Users can view projects shared with them"
ON projects FOR SELECT
TO authenticated
USING (
  shared_with @> ARRAY[auth.jwt() ->> 'email']::text[]
);

-- 4. Policy: Users can update their own projects
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Policy: Users can insert their own projects
CREATE POLICY "Users can insert their own projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
