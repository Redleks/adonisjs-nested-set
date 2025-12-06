/*
|--------------------------------------------------------------------------
| Tree Builder
|--------------------------------------------------------------------------
|
| Methods for building tree structures from flat collections
|
*/

import type { BaseModel } from '@adonisjs/lucid/orm'

/**
 * Tree node with children
 */
export interface TreeNode extends BaseModel {
  children?: TreeNode[]
  parent?: TreeNode | null
}

/**
 * Convert flat collection to tree structure
 */
export function toTree(nodes: BaseModel[], rootId: number | string | null = null): TreeNode[] {
  const parentIdColumn = 'parent_id' // This should be configurable
  const tree: TreeNode[] = []
  const nodeMap = new Map<number | string, TreeNode>()
  
  // First pass: create map of all nodes
  for (const node of nodes) {
    const treeNode = node as TreeNode
    treeNode.children = []
    nodeMap.set(node.id as number | string, treeNode)
  }
  
  // Second pass: build tree structure
  for (const node of nodes) {
    const treeNode = nodeMap.get(node.id as number | string)!
    const parentId = node[parentIdColumn] as number | string | null
    
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
export function toFlatTree(nodes: BaseModel[], rootId: number | string | null = null): BaseModel[] {
  const parentIdColumn = 'parent_id'
  const result: BaseModel[] = []
  const nodeMap = new Map<number | string, BaseModel>()
  const childrenMap = new Map<number | string | null, BaseModel[]>()
  
  // Build children map
  for (const node of nodes) {
    const parentId = node[parentIdColumn] as number | string | null
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(node)
    nodeMap.set(node.id as number | string, node)
  }
  
  // Recursively add nodes to result
  const addNode = (parentId: number | string | null) => {
    const children = childrenMap.get(parentId) || []
    for (const child of children) {
      result.push(child)
      addNode(child.id as number | string)
    }
  }
  
  addNode(rootId)
  return result
}

/**
 * Extend BaseModel with tree methods
 */
export function extendModelWithTreeMethods(Model: typeof BaseModel) {
  /**
   * Convert query results to tree
   */
  Model.prototype.toTree = function (this: BaseModel[], rootId?: number | string | null): TreeNode[] {
    return toTree(this, rootId)
  }
  
  /**
   * Convert query results to flat tree
   */
  Model.prototype.toFlatTree = function (this: BaseModel[], rootId?: number | string | null): BaseModel[] {
    return toFlatTree(this, rootId)
  }
}

