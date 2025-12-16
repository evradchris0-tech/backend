-- ============================================================================
-- SYNC SERVICE - OPERATION LOGS SCHEMA
-- ============================================================================
-- Optional PostgreSQL persistence for long-term audit trail
-- Use this to store operation logs beyond Redis TTL (90 days)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS sync_audit;

-- ============================================================================
-- TABLE: operation_logs
-- ============================================================================
-- Stockage persistant de tous les logs d'opération
CREATE TABLE IF NOT EXISTS sync_audit.operation_logs (
  id VARCHAR(16) PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  operation_type VARCHAR(20) NOT NULL,
  source_service VARCHAR(50) NOT NULL,
  target_services TEXT NOT NULL, -- JSON array as text: '["auth-service","room-service"]'
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  duration INTEGER NOT NULL, -- milliseconds
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  user_id VARCHAR(50),
  metadata JSONB, -- Flexible metadata
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_operation_logs_timestamp ON sync_audit.operation_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_operation_logs_entity ON sync_audit.operation_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_status ON sync_audit.operation_logs(status);
CREATE INDEX IF NOT EXISTS idx_operation_logs_event_id ON sync_audit.operation_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_event_type ON sync_audit.operation_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_operation_logs_source ON sync_audit.operation_logs(source_service);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON sync_audit.operation_logs(created_at DESC);

-- Index composite pour les requêtes groupées
CREATE INDEX IF NOT EXISTS idx_operation_logs_type_status ON sync_audit.operation_logs(event_type, status);
CREATE INDEX IF NOT EXISTS idx_operation_logs_entity_timestamp ON sync_audit.operation_logs(entity_id, timestamp DESC);

-- ============================================================================
-- TABLE: operation_statistics
-- ============================================================================
-- Statistiques pré-calculées pour les rapports rapides
CREATE TABLE IF NOT EXISTS sync_audit.operation_statistics (
  id SERIAL PRIMARY KEY,
  period_date DATE NOT NULL UNIQUE,
  total_operations INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  average_duration_ms NUMERIC(10, 2) DEFAULT 0,
  failure_rate_percent NUMERIC(5, 2) DEFAULT 0,
  operations_by_type JSONB, -- {"CREATED": 100, "UPDATED": 50, ...}
  operations_by_status JSONB, -- {"SUCCESS": 130, "FAILED": 20, ...}
  operations_by_service JSONB, -- {"auth-service": 100, "room-service": 30, ...}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operation_statistics_date ON sync_audit.operation_statistics(period_date DESC);

-- ============================================================================
-- TABLE: dlq_messages
-- ============================================================================
-- Messages envoyés au Dead Letter Queue
CREATE TABLE IF NOT EXISTS sync_audit.dlq_messages (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL UNIQUE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  retry_attempts INTEGER DEFAULT 0,
  max_retries_exceeded BOOLEAN DEFAULT FALSE,
  first_failure_at TIMESTAMP NOT NULL,
  last_failure_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dlq_messages_event_id ON sync_audit.dlq_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_dlq_messages_resolved ON sync_audit.dlq_messages(resolved_at);
CREATE INDEX IF NOT EXISTS idx_dlq_messages_created_at ON sync_audit.dlq_messages(created_at DESC);

-- ============================================================================
-- TABLE: audit_events
-- ============================================================================
-- Audit des accès à l'API d'historique
CREATE TABLE IF NOT EXISTS sync_audit.audit_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  action VARCHAR(100) NOT NULL, -- GET /history, POST /history/purge, etc.
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON sync_audit.audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_endpoint ON sync_audit.audit_events(endpoint);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON sync_audit.audit_events(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION sync_audit.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER trigger_operation_logs_updated_at
  BEFORE UPDATE ON sync_audit.operation_logs
  FOR EACH ROW
  EXECUTE FUNCTION sync_audit.update_updated_at_column();

CREATE TRIGGER trigger_operation_statistics_updated_at
  BEFORE UPDATE ON sync_audit.operation_statistics
  FOR EACH ROW
  EXECUTE FUNCTION sync_audit.update_updated_at_column();

CREATE TRIGGER trigger_dlq_messages_updated_at
  BEFORE UPDATE ON sync_audit.dlq_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_audit.update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Vue: Opérations échouées récentes (dernières 24h)
CREATE OR REPLACE VIEW sync_audit.recent_failures AS
SELECT
  id,
  event_id,
  event_type,
  operation_type,
  entity_id,
  error_message,
  timestamp,
  source_service,
  target_services
FROM sync_audit.operation_logs
WHERE status = 'FAILED'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Vue: Résumé statistique quotidien
CREATE OR REPLACE VIEW sync_audit.daily_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_operations,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failure_count,
  ROUND(AVG(duration)::numeric, 2) as avg_duration_ms,
  ROUND((SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as failure_rate_percent
FROM sync_audit.operation_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Vue: Opérations par service
CREATE OR REPLACE VIEW sync_audit.operations_by_service AS
SELECT
  source_service,
  unnest(string_to_array(target_services, ',')) as target_service,
  COUNT(*) as operation_count,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failure_count
FROM sync_audit.operation_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY source_service, target_service
ORDER BY operation_count DESC;

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Opérations échouées du jour
-- SELECT * FROM sync_audit.operation_logs
-- WHERE DATE(timestamp) = CURRENT_DATE AND status = 'FAILED'
-- ORDER BY timestamp DESC;

-- Durée moyenne par type d'opération (dernières 24h)
-- SELECT event_type, COUNT(*), AVG(duration) as avg_duration_ms
-- FROM sync_audit.operation_logs
-- WHERE timestamp > NOW() - INTERVAL '24 hours'
-- GROUP BY event_type
-- ORDER BY avg_duration_ms DESC;

-- Taux d'erreur par service
-- SELECT source_service, COUNT(*), SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failures
-- FROM sync_audit.operation_logs
-- WHERE timestamp > NOW() - INTERVAL '7 days'
-- GROUP BY source_service;

-- Messages au DLQ non résolus
-- SELECT * FROM sync_audit.dlq_messages
-- WHERE resolved_at IS NULL
-- ORDER BY first_failure_at DESC;

-- ============================================================================
-- RETENTION POLICY
-- ============================================================================
-- Archiver les opérations anciennes (example: garder 1 an)
-- DELETE FROM sync_audit.operation_logs
-- WHERE timestamp < NOW() - INTERVAL '1 year';

-- Purger les DLQ résolues après 30 jours
-- DELETE FROM sync_audit.dlq_messages
-- WHERE resolved_at IS NOT NULL
--   AND resolved_at < NOW() - INTERVAL '30 days';
