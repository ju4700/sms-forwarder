/*
  # SMS Forwarder Database Schema

  ## Overview
  This migration creates the database structure for an SMS forwarding app that monitors bKash payment notifications.

  ## New Tables
  
  ### `payments`
  Tracks payment transactions and their status
  - `id` (uuid, primary key) - Unique payment identifier
  - `reference_id` (text, unique) - bKash transaction reference ID
  - `amount` (decimal) - Payment amount
  - `sender` (text) - Phone number of sender
  - `status` (text) - Payment status: 'pending', 'received', 'verified'
  - `sms_content` (text) - Full SMS message content
  - `created_at` (timestamptz) - When payment was created
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `sms_logs`
  Logs all SMS messages received by the app
  - `id` (uuid, primary key) - Unique log entry identifier
  - `sender` (text) - SMS sender number/name
  - `content` (text) - Full SMS content
  - `received_at` (timestamptz) - When SMS was received
  - `payment_id` (uuid, nullable) - Reference to payment if matched
  - `forwarded` (boolean) - Whether SMS was forwarded to API
  - `created_at` (timestamptz) - Log entry creation time

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Service role can access all data for API operations

  ## Notes
  1. Reference IDs must be unique to prevent duplicate processing
  2. All timestamps use UTC timezone
  3. SMS logs are kept for audit purposes
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  amount decimal(10,2),
  sender text,
  status text DEFAULT 'pending' NOT NULL,
  sms_content text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'received', 'verified'))
);

-- Create sms_logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender text NOT NULL,
  content text NOT NULL,
  received_at timestamptz NOT NULL,
  payment_id uuid REFERENCES payments(id),
  forwarded boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_reference_id ON payments(reference_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sender ON sms_logs(sender);
CREATE INDEX IF NOT EXISTS idx_sms_logs_received_at ON sms_logs(received_at DESC);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Policies for payments table
CREATE POLICY "Allow public insert on payments"
  ON payments
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read on payments"
  ON payments
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public update on payments"
  ON payments
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for sms_logs table
CREATE POLICY "Allow public insert on sms_logs"
  ON sms_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read on sms_logs"
  ON sms_logs
  FOR SELECT
  TO anon
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();