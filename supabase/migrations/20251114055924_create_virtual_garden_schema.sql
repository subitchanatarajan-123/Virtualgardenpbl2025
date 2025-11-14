/*
  # Virtual Garden Database Schema

  1. New Tables
    - `gardens`
      - `id` (uuid, primary key) - Unique garden identifier
      - `user_id` (uuid) - Reference to auth.users
      - `name` (text) - Garden name
      - `created_at` (timestamptz) - When garden was created
      
    - `plants`
      - `id` (uuid, primary key) - Unique plant identifier
      - `garden_id` (uuid) - Reference to gardens table
      - `type` (text) - Plant type (flower, tree, succulent, mushroom)
      - `position_x` (integer) - X coordinate in garden
      - `position_y` (integer) - Y coordinate in garden
      - `growth_stage` (integer) - Current growth stage (0-5)
      - `water_level` (integer) - Water level (0-100)
      - `happiness` (integer) - Happiness level (0-100)
      - `last_watered` (timestamptz) - Last time plant was watered
      - `last_visited` (timestamptz) - Last time garden was visited
      - `created_at` (timestamptz) - When plant was planted
      
  2. Security
    - Enable RLS on all tables
    - Users can only access their own gardens and plants
    - Policies for select, insert, update, and delete operations
    
  3. Important Notes
    - Each garden belongs to one user
    - Plants belong to gardens and inherit user ownership
    - Growth stages and attributes update based on user interactions
*/

CREATE TABLE IF NOT EXISTS gardens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'My Garden',
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'flower',
  position_x integer NOT NULL DEFAULT 0,
  position_y integer NOT NULL DEFAULT 0,
  growth_stage integer NOT NULL DEFAULT 0,
  water_level integer NOT NULL DEFAULT 100,
  happiness integer NOT NULL DEFAULT 100,
  last_watered timestamptz DEFAULT now() NOT NULL,
  last_visited timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gardens"
  ON gardens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own gardens"
  ON gardens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gardens"
  ON gardens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gardens"
  ON gardens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view plants in own gardens"
  ON plants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = plants.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add plants to own gardens"
  ON plants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = plants.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update plants in own gardens"
  ON plants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = plants.garden_id
      AND gardens.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = plants.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove plants from own gardens"
  ON plants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = plants.garden_id
      AND gardens.user_id = auth.uid()
    )
  );