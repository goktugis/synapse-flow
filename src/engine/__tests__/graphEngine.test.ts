import { describe, it, expect } from 'vitest'
import { detectCycles, topologicalSort, computeHash, executeSingleNode } from '../graphEngine'
import type { WorkflowNode, WorkflowEdge } from '../../types/workflow'

describe('SynapseFlow Graph Engine', () => {
  const sampleNodes: WorkflowNode[] = [
    { id: 'node-1', type: 'webhook_trigger', label: 'Tetikleyici', position: { x: 0, y: 0 }, status: 'idle', data: {} },
    { id: 'node-2', type: 'data_transformer', label: 'Dönüştürücü', position: { x: 100, y: 0 }, status: 'idle', data: {} },
    { id: 'node-3', type: 'crypto_hash', label: 'Karma Hesaplayıcı', position: { x: 200, y: 0 }, status: 'idle', data: {} },
  ]

  it('geçerli bir DAG için döngü tespit etmemelidir (hasCycle = false)', () => {
    const validEdges: WorkflowEdge[] = [
      { id: 'e1', source: 'node-1', target: 'node-2' },
      { id: 'e2', source: 'node-2', target: 'node-3' },
    ]

    const result = detectCycles(sampleNodes, validEdges)
    expect(result.hasCycle).toBe(false)
    expect(result.cyclePath).toHaveLength(0)
  })

  it('döngü içeren grafikte çevrimi tespit etmeli ve döngü rotasını döndürmelidir', () => {
    const cyclicEdges: WorkflowEdge[] = [
      { id: 'e1', source: 'node-1', target: 'node-2' },
      { id: 'e2', source: 'node-2', target: 'node-3' },
      { id: 'e3', source: 'node-3', target: 'node-1' }, // Cycle back to 1
    ]

    const result = detectCycles(sampleNodes, cyclicEdges)
    expect(result.hasCycle).toBe(true)
    expect(result.cyclePath.length).toBeGreaterThan(0)
  })

  it('Kahn algoritması düğümleri doğru topolojik sırada sıralamalıdır', () => {
    const edges: WorkflowEdge[] = [
      { id: 'e1', source: 'node-1', target: 'node-2' },
      { id: 'e2', source: 'node-2', target: 'node-3' },
    ]

    const sorted = topologicalSort(sampleNodes, edges)
    expect(sorted).toEqual(['node-1', 'node-2', 'node-3'])
  })

  it('Kahn algoritması döngü olduğunda hata fırlatmalıdır', () => {
    const cyclicEdges: WorkflowEdge[] = [
      { id: 'e1', source: 'node-1', target: 'node-2' },
      { id: 'e2', source: 'node-2', target: 'node-1' },
    ]

    expect(() => topologicalSort(sampleNodes, cyclicEdges)).toThrow()
  })

  it('computeHash fonksiyonu SHA-256 veya hex çıktısı üretmelidir', async () => {
    const hash1 = await computeHash('test-string')
    const hash2 = await computeHash('test-string')
    expect(hash1).toBe(hash2)
    expect(typeof hash1).toBe('string')
    expect(hash1.length).toBeGreaterThan(5)
  })

  it('condition_branch düğümü koşul sağlandığında true dalını seçmelidir', async () => {
    const conditionNode: WorkflowNode = {
      id: 'cond-1',
      type: 'condition_branch',
      label: 'Büyük mü Kontrolü',
      position: { x: 0, y: 0 },
      status: 'idle',
      data: { field: 'amount', operator: '>', threshold: 100 }
    }

    const res = await executeSingleNode(conditionNode, { payload: { amount: 250 } })
    expect(res.branchChoice).toBe('true')
    expect(res.output.conditionMet).toBe(true)
  })

  it('condition_branch düğümü koşul sağlanmadığında false dalını seçmelidir', async () => {
    const conditionNode: WorkflowNode = {
      id: 'cond-1',
      type: 'condition_branch',
      label: 'Büyük mü Kontrolü',
      position: { x: 0, y: 0 },
      status: 'idle',
      data: { field: 'amount', operator: '>', threshold: 500 }
    }

    const res = await executeSingleNode(conditionNode, { payload: { amount: 120 } })
    expect(res.branchChoice).toBe('false')
    expect(res.output.conditionMet).toBe(false)
  })
})
