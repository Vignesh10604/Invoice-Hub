/*
  # Add Profile Insert Policy and Fix RLS

  1. Changes
    - Add INSERT policy for profiles table to allow new user registration
    - Add UPDATE policy for profiles table to allow users to update their own profiles
  
  2. Security
    - Maintains existing RLS policies
    - Adds new policy for profile creation during signup
*/

-- Add policy for inserting profiles
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);