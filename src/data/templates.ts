import type { WorkflowTemplate } from '../types/workflow'

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'secops_pipeline',
    title: 'Siber Güvenlik & Şüpheli İstek Analiz Hattı',
    description: 'Webhook girişinden gelen istekleri SHA-256 ile doğrular, AI ile tehdit analizi yapar ve kritik durumlarda SecOps kanalına alarm iletir.',
    category: 'Güvenlik & SecOps',
    samplePayload: {
      userId: 'usr_9812_admin',
      ip: '194.26.29.112',
      userAgent: 'curl/7.88.1 (suspicious)',
      amount: 14500,
      attempts: 6,
      country: 'TR'
    },
    nodes: [
      {
        id: 'node_1',
        type: 'webhook_trigger',
        label: 'İstek Webhook Girişi',
        position: { x: 50, y: 180 },
        status: 'idle',
        data: { path: '/api/v1/auth/verify', method: 'POST' }
      },
      {
        id: 'node_2',
        type: 'crypto_hash',
        label: 'SHA-256 Bütünlük İmzası',
        position: { x: 340, y: 180 },
        status: 'idle',
        data: { algorithm: 'SHA-256' }
      },
      {
        id: 'node_3',
        type: 'ai_prompt',
        label: 'AI Tehdit Analiz Ajanı',
        position: { x: 630, y: 180 },
        status: 'idle',
        data: { template: 'Gelen oturum ve IP parametrelerini inceleyip anomalileri sınıflandır.' }
      },
      {
        id: 'node_4',
        type: 'condition_branch',
        label: 'Risk Skoru Karar Motoru',
        position: { x: 920, y: 180 },
        status: 'idle',
        data: { field: 'amount', operator: '>', threshold: 5000 }
      },
      {
        id: 'node_5',
        type: 'notification_dispatch',
        label: 'Acil SecOps Slack Alarmı',
        position: { x: 1220, y: 80 },
        status: 'idle',
        data: { channel: 'Slack #secops-critical', priority: 'CRITICAL' }
      },
      {
        id: 'node_6',
        type: 'audit_logger',
        label: 'Değiştirilemez Denetim Günlüğü',
        position: { x: 1220, y: 280 },
        status: 'idle',
        data: { complianceStandard: 'SOC-2 / ISO-27001' }
      }
    ],
    edges: [
      { id: 'e1', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e3', source: 'node_3', target: 'node_4', animated: true },
      { id: 'e4', source: 'node_4', target: 'node_5', sourceHandle: 'true', label: 'Yüksek Risk (True)' },
      { id: 'e5', source: 'node_4', target: 'node_6', sourceHandle: 'false', label: 'Normal / Audit' }
    ]
  },
  {
    id: 'customer_support_triage',
    title: 'Akıllı Müşteri Talebi & Duygu Analizi Yönlendirmesi',
    description: 'Müşteri mesajlarını alır, duygu durumunu (Sentiment) analiz eder, negatif/kriz durumlarında öncelikli destek ekibine iletir.',
    category: 'Müşteri Deneyimi & NLP',
    samplePayload: {
      ticketId: 'TCK_74812',
      customerName: 'Ahmet Yılmaz',
      text: 'Sistem 3 saattir yanıt vermiyor ve acil üretim durdu, lütfen hemen yardım edin!',
      tier: 'Enterprise'
    },
    nodes: [
      {
        id: 'cs_1',
        type: 'event_trigger',
        label: 'Destek Talebi Olayı',
        position: { x: 50, y: 180 },
        status: 'idle',
        data: { eventName: 'ticket.created' }
      },
      {
        id: 'cs_2',
        type: 'sentiment_analyzer',
        label: 'Duygu & Ton Analizi',
        position: { x: 350, y: 180 },
        status: 'idle',
        data: { threshold: 0.8 }
      },
      {
        id: 'cs_3',
        type: 'intent_classifier',
        label: 'Kategori Sınıflandırıcı',
        position: { x: 650, y: 180 },
        status: 'idle',
        data: { categories: ['Kesinti', 'Faturalama', 'Genel Soru'] }
      },
      {
        id: 'cs_4',
        type: 'rest_api',
        label: 'CRM & Bilet Atama',
        position: { x: 960, y: 180 },
        status: 'idle',
        data: { endpoint: 'https://crm.internal/api/tickets/escalate' }
      }
    ],
    edges: [
      { id: 'e_cs1', source: 'cs_1', target: 'cs_2', animated: true },
      { id: 'e_cs2', source: 'cs_2', target: 'cs_3', animated: true },
      { id: 'e_cs3', source: 'cs_3', target: 'cs_4', animated: true }
    ]
  },
  {
    id: 'etl_data_pipeline',
    title: 'Zamanlanmış Telemetri & ETL Veri Boru Hattı',
    description: 'Her gece yarısı çalışarak telemetri verilerini toplar, hız sınırlarını denetler, dönüştürür ve şifreleyerek veri ambarına aktarır.',
    category: 'Veri Mühendisliği & ETL',
    samplePayload: {
      batchId: 'BATCH_2026_10_11',
      recordCount: 84000,
      region: 'eu-central-1',
      checksum: 'valid'
    },
    nodes: [
      {
        id: 'etl_1',
        type: 'schedule_trigger',
        label: 'Gece Yarısı Tetikleyicisi',
        position: { x: 50, y: 180 },
        status: 'idle',
        data: { cron: '0 0 * * *' }
      },
      {
        id: 'etl_2',
        type: 'rate_limiter',
        label: 'Bant Genişliği Koruyucu',
        position: { x: 350, y: 180 },
        status: 'idle',
        data: { limit: 500 }
      },
      {
        id: 'etl_3',
        type: 'data_transformer',
        label: 'Şema & Veri Dönüştürücü',
        position: { x: 650, y: 180 },
        status: 'idle',
        data: {}
      },
      {
        id: 'etl_4',
        type: 'audit_logger',
        label: 'Veri Ambarı Kütüğü',
        position: { x: 960, y: 180 },
        status: 'idle',
        data: {}
      }
    ],
    edges: [
      { id: 'e_etl1', source: 'etl_1', target: 'etl_2', animated: true },
      { id: 'e_etl2', source: 'etl_2', target: 'etl_3', animated: true },
      { id: 'e_etl3', source: 'etl_3', target: 'etl_4', animated: true }
    ]
  }
]
