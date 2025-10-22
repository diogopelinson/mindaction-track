-- Add INSERT policy for profiles table (CRITICAL FIX)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Add DELETE policy for admin_requests table
CREATE POLICY "Admins can delete admin requests" 
ON public.admin_requests 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add comment to document the security fix
COMMENT ON POLICY "Users can insert their own profile" ON public.profiles IS 
'Allows users to create their own profile during signup. Without this policy, handle_new_user() trigger fails with RLS violation.';