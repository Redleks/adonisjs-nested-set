/*
|--------------------------------------------------------------------------
| Nested Set Trait
|--------------------------------------------------------------------------
|
| This trait provides nested set functionality for Lucid models.
| It implements the Nested Set Model algorithm for efficient tree operations.
|
*/

import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BaseModel } from '@adonisjs/lucid/orm'

/**
 * Interface for nested set node
 */
export interface NestedSetNode {
  id: number | string
  parentId: number | string | null
  lft: number
  rgt: number
  [key: string]: any
}

/**
 * Options for nested set operations
 */
export interface NestedSetOptions {
  lftColumn?: string
  rgtColumn?: string
  parentIdColumn?: string
  scopeAttributes?: string[]
}

/**
 * Nested Set Trait Methods
 *
 * Provides instance methods for working with nested sets in AdonisJS models
 */
export const nestedSetTraitMethods = {
  /**
   * Check if node is root
   */
  isRoot(this: BaseModel): boolean {
    const Model = this.constructor as typeof BaseModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this[parentIdColumn] as number | string | null | undefined
    return parentId === null || parentId === undefined
  },

  /**
   * Check if node is leaf
   */
  isLeaf(this: BaseModel): boolean {
    const Model = this.constructor as typeof BaseModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()
    return (this[rgtColumn] as number) - (this[lftColumn] as number) === 1
  },

  /**
   * Check if node is descendant of another node
   */
  isDescendantOf(this: BaseModel, other: BaseModel | number | string): boolean {
    const Model = this.constructor as typeof BaseModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()

    if (typeof other === 'object' && other !== null) {
      return (
        (this[lftColumn] as number) > (other[lftColumn] as number) &&
        (this[rgtColumn] as number) < (other[rgtColumn] as number)
      )
    }

    // If other is ID, we need to load it first
    return false
  },

  /**
   * Check if node is ancestor of another node
   */
  isAncestorOf(this: BaseModel, other: BaseModel): boolean {
    const Model = this.constructor as typeof BaseModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()
    return (
      (this[lftColumn] as number) < (other[lftColumn] as number) &&
      (this[rgtColumn] as number) > (other[rgtColumn] as number)
    )
  },

  /**
   * Check if node is child of another node
   */
  isChildOf(this: BaseModel, other: BaseModel): boolean {
    const Model = this.constructor as typeof BaseModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this[parentIdColumn] as number | string | null | undefined
    return parentId !== null && parentId !== undefined && parentId === other.id
  },

  /**
   * Check if node is sibling of another node
   */
  isSiblingOf(this: BaseModel, other: BaseModel): boolean {
    const Model = this.constructor as typeof BaseModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const thisParentId = this[parentIdColumn] as number | string | null | undefined
    const otherParentId = other[parentIdColumn] as number | string | null | undefined

    // Can't be sibling if same node
    if (this.id === other.id) {
      return false
    }

    // Both are roots (null/undefined) - they are siblings
    if (
      (thisParentId === null || thisParentId === undefined) &&
      (otherParentId === null || otherParentId === undefined)
    ) {
      return true
    }

    // Both must have same parent (and not be null/undefined)
    return (
      thisParentId !== null &&
      thisParentId !== undefined &&
      otherParentId !== null &&
      otherParentId !== undefined &&
      thisParentId === otherParentId
    )
  },

  /**
   * Get depth of the node
   */
  async getDepth(this: BaseModel): Promise<number> {
    const Model = this.constructor as typeof BaseModel & {
      ancestorsOf(node: BaseModel | number | string): ModelQueryBuilderContract<BaseModel>
    }

    const ancestors = await Model.ancestorsOf(this).exec()
    return ancestors.length
  },

  /**
   * Get siblings query
   */
  siblings(this: BaseModel): ModelQueryBuilderContract<BaseModel> {
    const Model = this.constructor as typeof BaseModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this[parentIdColumn] as number | string | null

    const query = Model.query().where('id', '!=', this.id)

    if (parentId) {
      query.where(parentIdColumn, parentId)
    } else {
      query.whereNull(parentIdColumn)
    }

    return query
  },

  /**
   * Get ancestors query
   */
  ancestors(this: BaseModel): ModelQueryBuilderContract<BaseModel> {
    const Model = this.constructor as typeof BaseModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()

    return Model.query()
      .where(lftColumn, '<', this[lftColumn] as number)
      .where(rgtColumn, '>', this[rgtColumn] as number)
      .orderBy(lftColumn, 'asc')
  },

  /**
   * Get descendants query
   */
  descendants(this: BaseModel): ModelQueryBuilderContract<BaseModel> {
    const Model = this.constructor as typeof BaseModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()

    return Model.query()
      .where(lftColumn, '>', this[lftColumn] as number)
      .where(rgtColumn, '<', this[rgtColumn] as number)
      .orderBy(lftColumn, 'asc')
  },

  /**
   * Get children query
   */
  children(this: BaseModel): ModelQueryBuilderContract<BaseModel> {
    const Model = this.constructor as typeof BaseModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()

    return Model.query().where(parentIdColumn, this.id)
  },

  /**
   * Get parent
   */
  async parent(this: BaseModel): Promise<BaseModel | null> {
    const Model = this.constructor as typeof BaseModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this[parentIdColumn] as number | string | null

    if (!parentId) {
      return null
    }

    return Model.find(parentId)
  },

  /**
   * Make node a root
   */
  async makeRoot(this: BaseModel): Promise<void> {
    const Model = this.constructor as typeof BaseModel & {
      getParentIdName(): string
      fixTree(): Promise<void>
    }
    const parentIdColumn = Model.getParentIdName()
    this[parentIdColumn] = null
    await this.save()
    await Model.fixTree()
  },

  /**
   * Append node to parent
   */
  async appendTo(this: BaseModel, parent: BaseModel | number | string): Promise<void> {
    const Model = this.constructor as typeof BaseModel & {
      getParentIdName(): string
      fixTree(): Promise<void>
    }
    const parentIdColumn = Model.getParentIdName()

    let parentNode: BaseModel | null = null
    if (typeof parent === 'object' && parent !== null) {
      parentNode = parent
    } else {
      parentNode = await Model.find(parent)
    }

    if (!parentNode) {
      throw new Error('Parent node not found')
    }

    this[parentIdColumn] = parentNode.id
    await this.save()
    await Model.fixTree()
  },
}

/**
 * Static methods for nested set
 */
export const nestedSetStaticMethods = {
  /**
   * Get the left column name
   */
  getLftName(): string {
    return '_lft'
  },

  /**
   * Get the right column name
   */
  getRgtName(): string {
    return '_rgt'
  },

  /**
   * Get the parent ID column name
   * Returns camelCase for AdonisJS models (parentId) but can be overridden
   */
  getParentIdName(): string {
    return 'parentId'
  },

  /**
   * Get scope attributes
   */
  getScopeAttributes(): string[] {
    return []
  },
}
