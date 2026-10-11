import type { NodeMetadata, NodeType } from '../types/workflow'

export const NODE_REGISTRY: Record<NodeType, NodeMetadata> = {
  webhook_trigger: {
    type: 'webhook_trigger',
    category: 'trigger',
    label: 'Webhook Girişi',
    description: 'Harici sistemlerden HTTP POST yükü dinler ve akışı tetikler',
    icon: 'Radio',
    color: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    defaultData: {
      path: '/api/v1/webhook/events',
      method: 'POST',
      mockPayload: { userId: 'usr_8492', role: 'admin', ip: '10.0.4.15', amount: 5400 }
    }
  },
  schedule_trigger: {
    type: 'schedule_trigger',
    category: 'trigger',
    label: 'Zamanlanmış Tetikleyici',
    description: 'Cron takvimine göre periyodik arka plan yürütmesi başlatır',
    icon: 'Clock',
    color: 'from-blue-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    defaultData: {
      cron: '0 0 * * *',
      timezone: 'Europe/Istanbul',
      label: 'Gece Yarısı Senkronizasyonu'
    }
  },
  event_trigger: {
    type: 'event_trigger',
    category: 'trigger',
    label: 'Olay Dinleyicisi',
    description: 'Kafka/RabbitMQ veya iç sistem olaylarını yakalar',
    icon: 'Zap',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    defaultData: {
      eventName: 'security.anomaly.detected',
      source: 'auth-broker'
    }
  },
  data_transformer: {
    type: 'data_transformer',
    category: 'logic',
    label: 'Veri Dönüştürücü',
    description: 'Girdi verilerini filtreler, alanları haritalar ve normalize eder',
    icon: 'SlidersHorizontal',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    defaultData: {
      transformScript: 'payload.amount = payload.amount * 1.18;\nreturn payload;'
    }
  },
  condition_branch: {
    type: 'condition_branch',
    category: 'logic',
    label: 'Koşullu Dallanma',
    description: 'Kural motoru: Karşılaştırmaya göre True/False rotalarına ayırır',
    icon: 'GitFork',
    color: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    defaultData: {
      field: 'amount',
      operator: '>',
      threshold: 1000
    }
  },
  crypto_hash: {
    type: 'crypto_hash',
    category: 'logic',
    label: 'SHA-256 İmzası',
    description: 'Yük bütünlüğünü denetler ve kriptografik hash üretir',
    icon: 'ShieldCheck',
    color: 'from-violet-500 to-purple-700',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    defaultData: {
      algorithm: 'SHA-256',
      salt: 'env_secret_salt'
    }
  },
  rate_limiter: {
    type: 'rate_limiter',
    category: 'logic',
    label: 'Hız Sınırlayıcı',
    description: 'Token Bucket algoritması ile aşırı istek koruması sağlar',
    icon: 'Gauge',
    color: 'from-yellow-500 to-amber-600',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    defaultData: {
      limit: 100,
      windowSec: 60
    }
  },
  ai_prompt: {
    type: 'ai_prompt',
    category: 'ai',
    label: 'Ajan Şablonu (LLM)',
    description: 'Yapay zeka ajanı ile akıllı analiz ve veri çıkarımı yapar',
    icon: 'Sparkles',
    color: 'from-fuchsia-500 to-purple-600',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    defaultData: {
      model: 'gemini-1.5-pro',
      template: 'Şüpheli işlem risk skorunu hesapla ve güvenlik önerisi sun.'
    }
  },
  sentiment_analyzer: {
    type: 'sentiment_analyzer',
    category: 'ai',
    label: 'Duygu Analizörü',
    description: 'Metin girdisindeki tonu, memnuniyet oranını ve riski puanlar',
    icon: 'Smile',
    color: 'from-rose-500 to-pink-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    defaultData: {
      language: 'tr',
      threshold: 0.75
    }
  },
  intent_classifier: {
    type: 'intent_classifier',
    category: 'ai',
    label: 'Niyet Sınıflandırıcı',
    description: 'Gelen talebi kategoriye ve öncelik derecesine göre etiketler',
    icon: 'BrainCircuit',
    color: 'from-indigo-500 to-blue-600',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    defaultData: {
      categories: ['Güvenlik Alarmı', 'Finansal Anomali', 'Destek Talebi']
    }
  },
  rest_api: {
    type: 'rest_api',
    category: 'action',
    label: 'Harici API Çağrısı',
    description: 'Hedef servise güvenli TLS ile REST payload gönderir',
    icon: 'Globe',
    color: 'from-emerald-500 to-green-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    defaultData: {
      endpoint: 'https://api.internal/v1/security/dispatch',
      method: 'POST'
    }
  },
  notification_dispatch: {
    type: 'notification_dispatch',
    category: 'action',
    label: 'Bildirim Dağıtımı',
    description: 'Slack, Discord veya Webhook kanallarına acil bildirim iletir',
    icon: 'BellRing',
    color: 'from-orange-500 to-red-600',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    defaultData: {
      channel: 'Slack #secops-critical',
      priority: 'HIGH'
    }
  },
  audit_logger: {
    type: 'audit_logger',
    category: 'action',
    label: 'Denetim Günlüğü',
    description: 'Değiştirilemez (Append-Only) denetim kütüğüne kaydeder',
    icon: 'FileText',
    color: 'from-slate-500 to-zinc-600',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    defaultData: {
      retentionDays: 365,
      complianceStandard: 'ISO-27001'
    }
  }
}
