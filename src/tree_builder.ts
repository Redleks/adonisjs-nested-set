/*
|--------------------------------------------------------------------------
| Tree Builder
|--------------------------------------------------------------------------
|
| Methods for building tree structures from flat collections
|
*/

import type { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'

/**
 * Tree node with children
 */
export interface TreeNode extends Omit<LucidRow, 'children' | 'parent'> {
  children?: TreeNode[]
  parent?: TreeNode | null
}

/**
 * Convert flat collection to tree structure
 */
export function toTree(nodes: LucidRow[], rootId: number | string | null = null): TreeNode[] {
  const parentIdColumn = 'parentId' // Use camelCase for AdonisJS models
  const tree: TreeNode[] = []
  const nodeMap = new Map<number | string, TreeNode>()

  // First pass: create map of all nodes
  for (const node of nodes) {
    const treeNode = { ...node, children: [] } as unknown as TreeNode
    const nodeId = node.$primaryKeyValue ?? node.$getAttribute('id')
    nodeMap.set(nodeId as number | string, treeNode)
  }

  // Second pass: build tree structure
  for (const node of nodes) {
    const nodeId = node.$primaryKeyValue ?? node.$getAttribute('id')
    const treeNode = nodeMap.get(nodeId as number | string)!
    const parentId = node.$getAttribute(parentIdColumn) as number | string | null

    if (parentId && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId)!
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(treeNode)
      treeNode.parent = parent
    } else if (parentId === rootId || (!parentId && rootId === null)) {
      tree.push(treeNode)
    }
  }

  return tree
}

/**
 * Convert tree to flat list (children immediately after parent)
 */
export function toFlatTree(nodes: LucidRow[], rootId: number | string | null = null): LucidRow[] {
  const parentIdColumn = 'parentId' // Use camelCase for AdonisJS models
  const result: LucidRow[] = []
  const nodeMap = new Map<number | string, LucidRow>()
  const childrenMap = new Map<number | string | null, LucidRow[]>()

  // Build children map
  for (const node of nodes) {
    const parentId = node.$getAttribute(parentIdColumn) as number | string | null
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(node)
    const nodeId = node.$primaryKeyValue ?? node.$getAttribute('id')
    nodeMap.set(nodeId as number | string, node)
  }

  // Recursively add nodes to result
  const addNode = (parentId: number | string | null) => {
    const children = childrenMap.get(parentId) || []
    for (const child of children) {
      result.push(child)
      const childId = child.$primaryKeyValue ?? child.$getAttribute('id')
      addNode(childId as number | string)
    }
  }

  addNode(rootId)
  return result
}

/**
 * Extend BaseModel with tree methods
 */
export function extendModelWithTreeMethods(Model: LucidModel) {
  /**
   * Convert query results to tree
   */
  ;(Model.prototype as any).toTree = function (
    this: LucidRow[],
    rootId?: number | string | null
  ): TreeNode[] {
    return toTree(this, rootId)
  }

  /**
   * Convert query results to flat tree
   */
  ;(Model.prototype as any).toFlatTree = function (
    this: LucidRow[],
    rootId?: number | string | null
  ): LucidRow[] {
    return toFlatTree(this, rootId)
  }
}
