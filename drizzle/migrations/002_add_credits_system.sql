-- Add credit management tables for Polar integration

-- Update users table to include Polar subscription info
ALTER TABLE users ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_reset_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Credit usage tracking
CREATE TABLE IF NOT EXISTS credit_usage (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'video_generation', 'top_up', 'reset', etc.
  metadata JSONB, -- Store video type, generator used, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Credit top-up history
CREATE TABLE IF NOT EXISTS credit_topups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_added INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL, -- In cents for accuracy
  currency TEXT DEFAULT 'USD',
  payment_intent_id TEXT, -- Stripe payment intent
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_usage_user_id ON credit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_created_at ON credit_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_topups_user_id ON credit_topups(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_topups_status ON credit_topups(status);
CREATE INDEX IF NOT EXISTS idx_users_polar_subscription ON users(polar_subscription_id);

-- Add credit usage function for easy tracking
CREATE OR REPLACE FUNCTION track_credit_usage(
  p_user_id TEXT,
  p_credits_used INTEGER,
  p_type TEXT,
  p_metadata JSONB DEFAULT NULL
) RETURNS TABLE(
  success BOOLEAN,
  remaining_credits INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF v_current_credits < p_credits_used THEN
    RETURN QUERY SELECT FALSE, v_current_credits, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_credits - p_credits_used;
  
  -- Update user credits
  UPDATE users
  SET credits = v_new_balance
  WHERE id = p_user_id;
  
  -- Track usage
  INSERT INTO credit_usage (
    user_id,
    credits_used,
    credits_remaining,
    type,
    metadata
  ) VALUES (
    p_user_id,
    p_credits_used,
    v_new_balance,
    p_type,
    p_metadata
  );
  
  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;