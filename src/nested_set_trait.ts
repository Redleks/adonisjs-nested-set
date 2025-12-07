/*
|--------------------------------------------------------------------------
| Nested Set Trait
|--------------------------------------------------------------------------
|
| This trait provides nested set functionality for Lucid models.
| It implements the Nested Set Model algorithm for efficient tree operations.
|
*/

import type { ModelQueryBuilderContract, LucidModel, LucidRow } from '@adonisjs/lucid/types/model'

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
  isRoot(this: LucidRow): boolean {
    const Model = this.constructor as LucidModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this.$getAttribute(parentIdColumn) as number | string | null | undefined
    return parentId === null || parentId === undefined
  },

  /**
   * Check if node is leaf
   */
  isLeaf(this: LucidRow): boolean {
    const Model = this.constructor as LucidModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()
    return (
      (this.$getAttribute(rgtColumn) as number) - (this.$getAttribute(lftColumn) as number) === 1
    )
  },

  /**
   * Check if node is descendant of another node
   */
  isDescendantOf(this: LucidRow, other: LucidRow | number | string): boolean {
    const Model = this.constructor as LucidModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()

    if (typeof other === 'object' && other !== null) {
      return (
        (this.$getAttribute(lftColumn) as number) > (other.$getAttribute(lftColumn) as number) &&
        (this.$getAttribute(rgtColumn) as number) < (other.$getAttribute(rgtColumn) as number)
      )
    }

    // If other is ID, we need to load it first
    return false
  },

  /**
   * Check if node is ancestor of another node
   */
  isAncestorOf(this: LucidRow, other: LucidRow): boolean {
    const Model = this.constructor as LucidModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()
    return (
      (this.$getAttribute(lftColumn) as number) < (other.$getAttribute(lftColumn) as number) &&
      (this.$getAttribute(rgtColumn) as number) > (other.$getAttribute(rgtColumn) as number)
    )
  },

  /**
   * Check if node is child of another node
   */
  isChildOf(this: LucidRow, other: LucidRow): boolean {
    const Model = this.constructor as LucidModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this.$getAttribute(parentIdColumn) as number | string | null | undefined
    const otherId = other.$primaryKeyValue ?? other.$getAttribute('id')
    return parentId !== null && parentId !== undefined && parentId === otherId
  },

  /**
   * Check if node is sibling of another node
   */
  isSiblingOf(this: LucidRow, other: LucidRow): boolean {
    const Model = this.constructor as LucidModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const thisParentId = this.$getAttribute(parentIdColumn) as number | string | null | undefined
    const otherParentId = other.$getAttribute(parentIdColumn) as number | string | null | undefined

    // Can't be sibling if same node
    const thisId = this.$primaryKeyValue ?? this.$getAttribute('id')
    const otherId = other.$primaryKeyValue ?? other.$getAttribute('id')
    if (thisId === otherId) {
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
  async getDepth(this: LucidRow): Promise<number> {
    const Model = this.constructor as LucidModel & {
      ancestorsOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }

    const ancestorsQuery = Model.ancestorsOf(this)
    const ancestors = await ancestorsQuery.exec()
    return ancestors.length
  },

  /**
   * Get siblings query
   */
  siblings(this: LucidRow): ModelQueryBuilderContract<LucidModel> {
    const Model = this.constructor as LucidModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this.$getAttribute(parentIdColumn) as number | string | null

    const query = Model.query().where('id', '!=', this.$primaryKeyValue ?? this.$getAttribute('id'))

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
  ancestors(this: LucidRow): ModelQueryBuilderContract<LucidModel> {
    const Model = this.constructor as LucidModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()

    return Model.query()
      .where(lftColumn, '<', this.$getAttribute(lftColumn) as number)
      .where(rgtColumn, '>', this.$getAttribute(rgtColumn) as number)
      .orderBy(lftColumn, 'asc')
  },

  /**
   * Get descendants query
   */
  descendants(this: LucidRow): ModelQueryBuilderContract<LucidModel> {
    const Model = this.constructor as LucidModel & {
      getLftName(): string
      getRgtName(): string
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()

    return Model.query()
      .where(lftColumn, '>', this.$getAttribute(lftColumn) as number)
      .where(rgtColumn, '<', this.$getAttribute(rgtColumn) as number)
      .orderBy(lftColumn, 'asc')
  },

  /**
   * Get children query
   */
  children(this: LucidRow): ModelQueryBuilderContract<LucidModel> {
    const Model = this.constructor as LucidModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()

    return Model.query().where(parentIdColumn, this.$primaryKeyValue ?? this.$getAttribute('id'))
  },

  /**
   * Get parent
   */
  async parent(this: LucidRow): Promise<LucidRow | null> {
    const Model = this.constructor as LucidModel & { getParentIdName(): string }
    const parentIdColumn = Model.getParentIdName()
    const parentId = this.$getAttribute(parentIdColumn) as number | string | null

    if (!parentId) {
      return null
    }

    return Model.find(parentId) as Promise<LucidRow | null>
  },

  /**
   * Make node a root
   */
  async makeRoot(this: LucidRow): Promise<void> {
    const Model = this.constructor as LucidModel & {
      getParentIdName(): string
      fixTree(): Promise<void>
    }
    const parentIdColumn = Model.getParentIdName()
    this.$setAttribute(parentIdColumn, null)
    await this.save()
    await Model.fixTree()
  },

  /**
   * Append node to parent
   */
  async appendTo(this: LucidRow, parent: LucidRow | number | string): Promise<void> {
    const Model = this.constructor as LucidModel & {
      getParentIdName(): string
      fixTree(): Promise<void>
    }
    const parentIdColumn = Model.getParentIdName()

    let parentNode: LucidRow | null = null
    if (typeof parent === 'object' && parent !== null) {
      parentNode = parent
    } else {
      parentNode = await Model.find(parent)
    }

    if (!parentNode) {
      throw new Error('Parent node not found')
    }

    const parentNodeId = parentNode.$primaryKeyValue ?? parentNode.$getAttribute('id')
    this.$setAttribute(parentIdColumn, parentNodeId)
    await this.save()
    await Model.fixTree()
  },

  /**
   * Delete node and all its descendants
   */
  async deleteWithDescendants(this: LucidRow): Promise<void> {
    const Model = this.constructor as LucidModel & {
      getLftName(): string
      getRgtName(): string
      descendantsOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
    const lftColumn = Model.getLftName()
    const rgtColumn = Model.getRgtName()

    const nodeLft = this.$getAttribute(lftColumn) as number
    const nodeRgt = this.$getAttribute(rgtColumn) as number

    if (nodeLft && nodeRgt) {
      // Delete all descendants (nodes where lft > nodeLft AND rgt < nodeRgt)
      const descendantsQuery = Model.descendantsOf(this)
      const descendantsList = await descendantsQuery.exec()

      // Delete descendants first (from bottom to top)
      for (const descendant of descendantsList.reverse()) {
        await descendant.delete()
      }
    }

    // Delete the node itself
    await this.delete()
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
