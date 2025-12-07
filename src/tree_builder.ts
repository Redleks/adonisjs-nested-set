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
  // Preserve the original node object and add children/parent properties
  for (const node of nodes) {
    // Use the original node as base and add tree-specific properties
    const treeNode = node as unknown as TreeNode
    // Initialize children array using Object.defineProperty to ensure it's properly set
    if (!('children' in treeNode) || !Array.isArray((treeNode as any).children)) {
      Object.defineProperty(treeNode, 'children', {
        value: [],
        writable: true,
        enumerable: true,
        configurable: true,
      })
    }
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
      // Ensure parent.children is an array
      if (!parent.children || !Array.isArray(parent.children)) {
        parent.children = []
      }
      parent.children.push(treeNode)
      treeNode.parent = parent
    }
  }

  // Third pass: add root nodes to tree
  // If rootId is specified, only add that node and its descendants
  // If rootId node doesn't exist, add nodes with parentId === rootId (orphaned nodes)
  // Otherwise, add all nodes with null parentId
  if (rootId !== null && rootId !== undefined) {
    const rootNode = nodeMap.get(rootId)
    if (rootNode) {
      // Node with id === rootId exists, add it
      tree.push(rootNode)
    } else {
      // Node with id === rootId doesn't exist, add orphaned nodes with parentId === rootId
      for (const node of nodes) {
        const nodeId = node.$primaryKeyValue ?? node.$getAttribute('id')
        const treeNode = nodeMap.get(nodeId as number | string)!
        const parentId = node.$getAttribute(parentIdColumn) as number | string | null

        if (parentId === rootId) {
          tree.push(treeNode)
        }
      }
    }
  } else {
    for (const node of nodes) {
      const nodeId = node.$primaryKeyValue ?? node.$getAttribute('id')
      const treeNode = nodeMap.get(nodeId as number | string)!
      const parentId = node.$getAttribute(parentIdColumn) as number | string | null

      if (!parentId) {
        tree.push(treeNode)
      }
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

  // If rootId is specified, start from that node, otherwise start from null (root nodes)
  if (rootId !== null && rootId !== undefined) {
    // First add the root node itself
    const rootNode = nodeMap.get(rootId)
    if (rootNode) {
      result.push(rootNode)
      // Then add all its descendants
      addNode(rootId)
    }
  } else {
    addNode(null)
  }

  return result
}

/**
 * Add tree methods to an array
 */
export function addTreeMethodsToArray<T extends LucidRow[]>(
  arr: T
): T & {
  toTree(rootId?: number | string | null): TreeNode[]
  toFlatTree(rootId?: number | string | null): LucidRow[]
} {
  ;(arr as any).toTree = function (rootId?: number | string | null) {
    return toTree(this, rootId)
  }
  ;(arr as any).toFlatTree = function (rootId?: number | string | null) {
    return toFlatTree(this, rootId)
  }
  return arr as T & {
    toTree(rootId?: number | string | null): TreeNode[]
    toFlatTree(rootId?: number | string | null): LucidRow[]
  }
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

  // Override all() static method to add tree methods to result
  const ModelConstructor = Model as any
  const originalAll = ModelConstructor.all
  if (originalAll && typeof originalAll === 'function') {
    ModelConstructor.all = async function (this: typeof Model) {
      const results = await originalAll.call(this)
      return addTreeMethodsToArray(results)
    }
  }
}
