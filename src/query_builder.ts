/*
|--------------------------------------------------------------------------
| Query Builder Extensions
|--------------------------------------------------------------------------
|
| Extensions for Lucid query builder to work with nested sets
|
*/

import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BaseModel } from '@adonisjs/lucid/orm'

/**
 * Extend query builder with nested set methods
 */
export function extendQueryBuilder(Model: typeof BaseModel) {
  const lftColumn = (Model as typeof BaseModel & { getLftName(): string }).getLftName()
  const rgtColumn = (Model as typeof BaseModel & { getRgtName(): string }).getRgtName()
  const parentIdColumn = (Model as typeof BaseModel & { getParentIdName(): string }).getParentIdName()

  /**
   * Get all roots
   */
  Model.roots = function (): ModelQueryBuilderContract<BaseModel> {
    return this.query().whereNull(parentIdColumn)
  }

  /**
   * Get ancestors of a node
   */
  Model.ancestorsOf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    const query = this.query()
    
    if (typeof node === 'object' && node !== null) {
      return query
        .where(lftColumn, '<', node[lftColumn] as number)
        .where(rgtColumn, '>', node[rgtColumn] as number)
        .orderBy(lftColumn, 'asc')
    }
    
    // If node is ID, we need to load it first
    return query.whereRaw('1 = 0') // Return empty query for now
  }

  /**
   * Get ancestors including self
   */
  Model.ancestorsAndSelf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    const query = this.query()
    
    if (typeof node === 'object' && node !== null) {
      return query
        .where(lftColumn, '<=', node[lftColumn] as number)
        .where(rgtColumn, '>=', node[rgtColumn] as number)
        .orderBy(lftColumn, 'asc')
    }
    
    return query.whereRaw('1 = 0')
  }

  /**
   * Get descendants of a node
   */
  Model.descendantsOf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    const query = this.query()
    
    if (typeof node === 'object' && node !== null) {
      return query
        .where(lftColumn, '>', node[lftColumn] as number)
        .where(rgtColumn, '<', node[rgtColumn] as number)
        .orderBy(lftColumn, 'asc')
    }
    
    return query.whereRaw('1 = 0')
  }

  /**
   * Get descendants including self
   */
  Model.descendantsAndSelf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    const query = this.query()
    
    if (typeof node === 'object' && node !== null) {
      return query
        .where(lftColumn, '>=', node[lftColumn] as number)
        .where(rgtColumn, '<=', node[rgtColumn] as number)
        .orderBy(lftColumn, 'asc')
    }
    
    return query.whereRaw('1 = 0')
  }

  /**
   * Get siblings of a node
   */
  Model.siblingsOf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    const query = this.query()
    
    if (typeof node === 'object' && node !== null) {
      const parentId = node[parentIdColumn] as number | string | null
      query.where('id', '!=', node.id)
      
      if (parentId) {
        query.where(parentIdColumn, parentId)
      } else {
        query.whereNull(parentIdColumn)
      }
      
      return query
    }
    
    return query.whereRaw('1 = 0')
  }

  /**
   * Get siblings including self
   */
  Model.siblingsAndSelf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    const query = this.query()
    
    if (typeof node === 'object' && node !== null) {
      const parentId = node[parentIdColumn] as number | string | null
      
      if (parentId) {
        query.where(parentIdColumn, parentId)
      } else {
        query.whereNull(parentIdColumn)
      }
      
      return query
    }
    
    return query.whereRaw('1 = 0')
  }

  /**
   * Where ancestor of
   */
  Model.whereAncestorOf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    return this.ancestorsOf(node)
  }

  /**
   * Where ancestor or self
   */
  Model.whereAncestorOrSelf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    return this.ancestorsAndSelf(node)
  }

  /**
   * Where descendant of
   */
  Model.whereDescendantOf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    return this.descendantsOf(node)
  }

  /**
   * Where descendant or self
   */
  Model.whereDescendantOrSelf = function (node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel> {
    return this.descendantsAndSelf(node)
  }

  /**
   * Get nodes with depth
   */
  Model.withDepth = function (as: string = 'depth'): ModelQueryBuilderContract<BaseModel> {
    const query = this.query()
    const lftColumn = (Model as typeof BaseModel & { getLftName(): string }).getLftName()
    const rgtColumn = (Model as typeof BaseModel & { getRgtName(): string }).getRgtName()
    
    // This is a simplified version - full implementation would need subquery
    return query.select('*')
  }

  /**
   * Check if tree is broken
   */
  Model.isBroken = async function (): Promise<boolean> {
    const errors = await this.countErrors()
    const values = Object.keys(errors).map(key => errors[key as keyof typeof errors])
    return values.some(count => count > 0)
  }

  /**
   * Count errors in tree
   */
  Model.countErrors = async function (): Promise<{
    oddness: number
    duplicates: number
    wrong_parent: number
    missing_parent: number
  }> {
    const nodes = await this.query().exec()
    const lftColumn = (Model as typeof BaseModel & { getLftName(): string }).getLftName()
    const rgtColumn = (Model as typeof BaseModel & { getRgtName(): string }).getRgtName()
    const parentIdColumn = (Model as typeof BaseModel & { getParentIdName(): string }).getParentIdName()
    
    let oddness = 0
    let duplicates = 0
    const lftValues = new Set<number>()
    const rgtValues = new Set<number>()
    
    for (const node of nodes) {
      const lft = node[lftColumn] as number
      const rgt = node[rgtColumn] as number
      
      if (lft >= rgt) {
        oddness++
      }
      
      if (lftValues.has(lft) || rgtValues.has(rgt)) {
        duplicates++
      }
      
      lftValues.add(lft)
      rgtValues.add(rgt)
    }
    
    // Check wrong_parent and missing_parent
    let wrongParent = 0
    let missingParent = 0
    
    for (const node of nodes) {
      const parentId = node[parentIdColumn] as number | string | null
      
      if (parentId) {
        const parent = nodes.find(n => n.id === parentId)
        if (!parent) {
          missingParent++
        } else {
          const parentLft = parent[lftColumn] as number
          const parentRgt = parent[rgtColumn] as number
          const nodeLft = node[lftColumn] as number
          const nodeRgt = node[rgtColumn] as number
          
          if (nodeLft <= parentLft || nodeRgt >= parentRgt) {
            wrongParent++
          }
        }
      }
    }
    
    return {
      oddness,
      duplicates,
      wrong_parent: wrongParent,
      missing_parent: missingParent,
    }
  }

  /**
   * Fix tree structure
   */
  Model.fixTree = async function (): Promise<void> {
    const lftColumn = (Model as typeof BaseModel & { getLftName(): string }).getLftName()
    const rgtColumn = (Model as typeof BaseModel & { getRgtName(): string }).getRgtName()
    const parentIdColumn = (Model as typeof BaseModel & { getParentIdName(): string }).getParentIdName()
    const nodes = await this.query().orderBy(parentIdColumn, 'asc').orderBy('id', 'asc').exec()
    
    let counter = 1
    
    const buildTree = async (parentId: number | string | null, nodeList: BaseModel[]): Promise<void> => {
      const children = nodeList.filter(node => (node[parentIdColumn] as number | string | null) === parentId)
      
      for (const node of children) {
        node[lftColumn] = counter++
        await node.save()
        
        const nodeChildren = nodeList.filter(n => (n[parentIdColumn] as number | string | null) === node.id)
        if (nodeChildren.length > 0) {
          await buildTree(node.id, nodeList)
        }
        
        node[rgtColumn] = counter++
        await node.save()
      }
    }
    
    await buildTree(null, nodes)
  }
}

