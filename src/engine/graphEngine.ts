import type { WorkflowNode, WorkflowEdge } from '../types/workflow'

export interface CycleDetectionResult {
  hasCycle: boolean
  cyclePath: string[]
}

/**
 * Detects if a cycle exists in the directed graph using DFS coloring.
 * White (0) = Unvisited, Gray (1) = Visiting, Black (2) = Finished
 */
export function detectCycles(nodes: WorkflowNode[], edges: WorkflowEdge[]): CycleDetectionResult {
  const adj = new Map<string, string[]>()
  nodes.forEach(n => adj.set(n.id, []))
  edges.forEach(e => {
    if (adj.has(e.source)) {
      adj.get(e.source)!.push(e.target)
    }
  })

  const state = new Map<string, number>()
  nodes.forEach(n => state.set(n.id, 0))

  const path: string[] = []
  let cycleFound: string[] = []

  function dfs(nodeId: string): boolean {
    state.set(nodeId, 1) // Gray
    path.push(nodeId)

    const neighbors = adj.get(nodeId) || []
    for (const neighbor of neighbors) {
      const neighborState = state.get(neighbor) || 0
      if (neighborState === 1) {
        // Cycle detected
        const cycleStartIndex = path.indexOf(neighbor)
        cycleFound = path.slice(cycleStartIndex).concat(neighbor)
        return true
      }
      if (neighborState === 0) {
        if (dfs(neighbor)) return true
      }
    }

    path.pop()
    state.set(nodeId, 2) // Black
    return false
  }

  for (const node of nodes) {
    if ((state.get(node.id) || 0) === 0) {
      if (dfs(node.id)) {
        return { hasCycle: true, cyclePath: cycleFound }
      }
    }
  }

  return { hasCycle: false, cyclePath: [] }
}

/**
 * Kahn's algorithm for Topological Sorting of the DAG.
 * Returns the ordered node IDs for linear execution sequence.
 */
export function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  nodes.forEach(n => {
    inDegree.set(n.id, 0)
    adj.set(n.id, [])
  })

  edges.forEach(e => {
    if (adj.has(e.source)) {
      adj.get(e.source)!.push(e.target)
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
    }
  })

  const queue: string[] = []
  nodes.forEach(n => {
    if (inDegree.get(n.id) === 0) {
      queue.push(n.id)
    }
  })

  const sorted: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(current)

    const neighbors = adj.get(current) || []
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) {
        queue.push(neighbor)
      }
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error('İş akışında döngüsel bağımlılık (cycle) tespit edildi. DAG geçerli değil.')
  }

  return sorted
}

/**
 * Simple client-side SHA-256 implementation or mock hash for high speed
 */
export async function computeHash(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback simple checksum if SubtleCrypto is unavailable
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return 'fallback_' + Math.abs(hash).toString(16)
}

/**
 * Node execution handler simulation
 */
export async function executeSingleNode(
  node: WorkflowNode,
  inputs: Record<string, any>
): Promise<{ output: Record<string, any>; branchChoice?: 'true' | 'false' }> {
  // Simulate network/compute latency (50ms - 200ms)
  await new Promise(r => setTimeout(r, 60))

  switch (node.type) {
    case 'webhook_trigger':
      return {
        output: {
          receivedAt: new Date().toISOString(),
          headers: { 'content-type': 'application/json', 'x-request-id': 'req_' + Math.random().toString(36).substring(7) },
          payload: inputs.payload || node.data.mockPayload || { user: 'goktug', role: 'admin', ip: '192.168.1.42', amount: 4500 }
        }
      }

    case 'schedule_trigger':
      return {
        output: {
          cron: node.data.cron || '0 0 * * *',
          triggeredAt: new Date().toISOString(),
          cycle: 'daily_tick',
          metrics: { activeWorkers: 4, memoryUsageMb: 128 }
        }
      }

    case 'event_trigger':
      return {
        output: {
          event: node.data.eventName || 'user.login.anomaly',
          timestamp: new Date().toISOString(),
          source: 'auth_service',
          meta: { attempts: 3, riskScore: 82 }
        }
      }

    case 'data_transformer': {
      const source = inputs.payload || inputs
      const transformed = {
        ...source,
        _transformedAt: new Date().toISOString(),
        normalizedScore: typeof source.amount === 'number' ? source.amount / 100 : 1.0,
        sanitizedData: true
      }
      return { output: transformed }
    }

    case 'condition_branch': {
      const source = inputs.payload || inputs
      const field = node.data.field || 'amount'
      const operator = node.data.operator || '>'
      const threshold = Number(node.data.threshold ?? 1000)
      const val = Number(source[field] ?? 0)

      let result = false
      if (operator === '>') result = val > threshold
      else if (operator === '>=') result = val >= threshold
      else if (operator === '<') result = val < threshold
      else if (operator === '==') result = val === threshold
      else if (operator === '!=') result = val !== threshold

      const branchChoice = result ? 'true' : 'false'
      return {
        output: {
          evaluatedField: field,
          fieldValue: val,
          operator,
          threshold,
          conditionMet: result,
          selectedBranch: branchChoice
        },
        branchChoice
      }
    }

    case 'crypto_hash': {
      const payloadString = JSON.stringify(inputs)
      const hash = await computeHash(payloadString)
      return {
        output: {
          algorithm: 'SHA-256',
          hash,
          payloadBytes: payloadString.length,
          integrityCheck: 'PASSED'
        }
      }
    }

    case 'rate_limiter': {
      const limit = Number(node.data.limit || 100)
      const current = Math.floor(Math.random() * 40) + 10
      return {
        output: {
          bucketLimit: limit,
          consumedTokens: current,
          remainingTokens: limit - current,
          status: 'ALLOWED'
        }
      }
    }

    case 'ai_prompt': {
      const promptTemplate = node.data.template || 'Gelen veriyi özetle ve güvenlik riskini puanla.'
      return {
        output: {
          template: promptTemplate,
          model: 'gemini-pro-mock',
          generatedResponse: `[Ajan Çıktısı]: ${promptTemplate} -> İşlenen veri incelendi, parametreler güvenli aralıkta.`
        }
      }
    }

    case 'sentiment_analyzer': {
      const text = inputs.payload?.text || inputs.text || 'Bu servis gerçekten çok hızlı ve sorunsuz çalışıyor!'
      const isPositive = !text.toLowerCase().includes('hata') && !text.toLowerCase().includes('kötü')
      return {
        output: {
          analyzedText: text,
          sentiment: isPositive ? 'POZİTİF' : 'NEGATİF',
          confidenceScore: 0.94,
          primaryEmotion: isPositive ? 'memnuniyet' : 'endişe'
        }
      }
    }

    case 'intent_classifier': {
      return {
        output: {
          intent: 'SECURITY_ALERT_CHECK',
          confidence: 0.98,
          priority: 'YÜKSEK',
          recommendedAction: 'AUDIT_LOG_AND_NOTIFY'
        }
      }
    }

    case 'rest_api': {
      return {
        output: {
          statusCode: 200,
          statusText: 'OK',
          endpoint: node.data.endpoint || 'https://api.internal/v1/event',
          deliveredAt: new Date().toISOString(),
          responsePayload: { success: true, ref: 'TXN_' + Math.floor(Math.random() * 900000 + 100000) }
        }
      }
    }

    case 'notification_dispatch': {
      return {
        output: {
          channel: node.data.channel || 'Slack #dev-alerts',
          messageSent: true,
          recipient: 'goktug-lead-dev',
          sentAt: new Date().toISOString()
        }
      }
    }

    case 'audit_logger': {
      return {
        output: {
          ledgerId: 'LEDGER_' + Date.now(),
          storedPayloadHash: await computeHash(JSON.stringify(inputs)),
          immutableState: 'COMMITTED',
          timestamp: new Date().toISOString()
        }
      }
    }

    default:
      return { output: { executed: true, data: inputs } }
  }
}
