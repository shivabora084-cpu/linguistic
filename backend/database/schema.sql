-- ==============================================================================
-- LinguaMate AI - Single Central Database Schema
-- Supabase PostgreSQL with pgvector and Storage
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. PROFILES TABLE (Users & Authentication)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
    preferred_language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync any existing users table into profiles
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        INSERT INTO profiles (id, email, password_hash, full_name, role, preferred_language, created_at)
        SELECT id, email, password_hash, COALESCE(name, 'User'), COALESCE(role, 'user'), COALESCE(preferred_language, 'en'), created_at
        FROM users
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;

-- 3. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    speech_rate FLOAT DEFAULT 1.0,
    speech_pitch FLOAT DEFAULT 1.0,
    selected_voice VARCHAR(100) DEFAULT 'default',
    target_language VARCHAR(50) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'dark',
    auto_play_audio BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title VARCHAR(255) DEFAULT 'New Conversation',
    language VARCHAR(50) DEFAULT 'en',
    is_saved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure required columns exist if conversations table was pre-existing
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT 'New Conversation';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'en';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender VARCHAR(50) DEFAULT 'user',
    text TEXT NOT NULL,
    detected_language VARCHAR(50),
    mixed_languages JSONB DEFAULT '[]'::jsonb,
    intent VARCHAR(100),
    sentiment VARCHAR(50) DEFAULT 'neutral',
    urgency VARCHAR(20) DEFAULT 'low',
    is_clarification BOOLEAN DEFAULT false,
    clarification_options JSONB DEFAULT '[]'::jsonb,
    source_documents JSONB DEFAULT '[]'::jsonb,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure required columns exist if messages table was pre-existing
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender VARCHAR(50) DEFAULT 'user';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS detected_language VARCHAR(50);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS mixed_languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS intent VARCHAR(100);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50) DEFAULT 'neutral';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'low';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_clarification BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS clarification_options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS source_documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 6. CONVERSATION SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS conversation_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    summary TEXT NOT NULL,
    last_message_index INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. KNOWLEDGE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    chunk_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. KNOWLEDGE CHUNKS TABLE (with pgvector embedding for Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    conversation_id UUID NOT NULL,
    message_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ESCALATIONS TABLE (Human Support Escalation)
CREATE TABLE IF NOT EXISTS escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID,
    issue_summary TEXT NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'en',
    escalation_reason TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved', 'closed')),
    assigned_agent_id UUID,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUPPORT AGENTS TABLE
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    languages_supported JSONB DEFAULT '["en"]'::jsonb,
    is_online BOOLEAN DEFAULT true,
    active_tickets INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    event_type VARCHAR(100) NOT NULL,
    language VARCHAR(50),
    input_type VARCHAR(20) DEFAULT 'text',
    latency_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_feedback_conversation_id ON feedback(conversation_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_user_id ON escalations(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- Vector similarity index (cosine distance)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_knowledge_chunks_embedding'
    ) THEN
        CREATE INDEX idx_knowledge_chunks_embedding 
        ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- In case table is empty or ivfflat requires rows first, continue gracefully
    NULL;
END $$;

-- ==============================================================================
-- SUPABASE STORAGE BUCKET CREATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('linguamate-files', 'linguamate-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (idempotent: drop before create)
DROP POLICY IF EXISTS "Public read for linguamate-files" ON storage.objects;
CREATE POLICY "Public read for linguamate-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'linguamate-files');

DROP POLICY IF EXISTS "Full access for linguamate-files" ON storage.objects;
CREATE POLICY "Full access for linguamate-files"
ON storage.objects FOR ALL
USING (bucket_id = 'linguamate-files')
WITH CHECK (bucket_id = 'linguamate-files');

-- ==============================================================================
-- VECTOR SEARCH HELPER FUNCTION (RPC)
-- ==============================================================================
CREATE OR REPLACE FUNCTION match_knowledge_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INT,
  content TEXT,
  similarity float,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.chunk_index,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kc.metadata
  FROM knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
