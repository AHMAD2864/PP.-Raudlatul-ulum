/*
  # Create records table

  1. New Tables
    - `records`
      - `id` (uuid, primary key)
      - `title` (text, searchable)
      - `description` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `records` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own records"
  ON records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records"
  ON records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_records_title ON records USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_records_category ON records (category);