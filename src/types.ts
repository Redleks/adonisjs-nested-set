/*
|--------------------------------------------------------------------------
| Type Declarations for Nested Set
|--------------------------------------------------------------------------
|
| Type augmentations for LucidModel to include nested set methods
|
*/

import type { ModelQueryBuilderContract, LucidModel, LucidRow } from '@adonisjs/lucid/types/model'
import type { TreeNode } from './tree_builder.js'

/**
 * Helper type to extract node identifier from various input types
 */
type NodeIdentifier<Model extends LucidModel> =
  | InstanceType<Model>
  | number
  | string
  | { $getAttribute(key: string): any; [key: string]: any }

/**
 * Helper type for query builder with nested set methods
 */
type NestedSetQueryBuilder<Model extends LucidModel> = ModelQueryBuilderContract<
  Model,
  InstanceType<Model>
>

/**
 * Interface for nested set query builder methods with generic model support
 */
export interface NestedSetQueryBuilderMethods<Model extends LucidModel = LucidModel> {
  /**
   * Get all root nodes
   */
  roots(): NestedSetQueryBuilder<Model>

  /**
   * Get ancestors of a node
   * Accepts model instance, ID (number/string), or any object with $getAttribute method
   */
  ancestorsOf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Get ancestors including self
   */
  ancestorsAndSelf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Get descendants of a node
   */
  descendantsOf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Get descendants including self
   */
  descendantsAndSelf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Get siblings of a node
   */
  siblingsOf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Get siblings including self
   */
  siblingsAndSelf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Where ancestor of
   */
  whereAncestorOf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Where ancestor or self
   */
  whereAncestorOrSelf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Where descendant of
   */
  whereDescendantOf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Where descendant or self
   */
  whereDescendantOrSelf(node: NodeIdentifier<Model>): NestedSetQueryBuilder<Model>

  /**
   * Get nodes with depth
   */
  withDepth(as?: string): NestedSetQueryBuilder<Model>

  /**
   * Check if tree is broken
   */
  isBroken(): Promise<boolean>

  /**
   * Count errors in tree
   */
  countErrors(): Promise<{
    oddness: number
    duplicates: number
    wrong_parent: number
    missing_parent: number
  }>

  /**
   * Fix tree structure
   */
  fixTree(): Promise<void>

  /**
   * Get the left column name
   */
  getLftName(): string

  /**
   * Get the right column name
   */
  getRgtName(): string

  /**
   * Get the parent ID column name
   */
  getParentIdName(): string

  /**
   * Get scope attributes
   */
  getScopeAttributes(): string[]
}

/**
 * Interface for nested set instance methods
 */
export interface NestedSetInstanceMethods {
  /**
   * Check if node is root
   */
  isRoot(): boolean

  /**
   * Check if node is leaf
   */
  isLeaf(): boolean

  /**
   * Check if node is descendant of another node
   */
  isDescendantOf(other: LucidRow | number | string): boolean

  /**
   * Check if node is ancestor of another node
   */
  isAncestorOf(other: LucidRow): boolean

  /**
   * Check if node is child of another node
   */
  isChildOf(other: LucidRow): boolean

  /**
   * Check if node is sibling of another node
   */
  isSiblingOf(other: LucidRow): boolean

  /**
   * Get depth of the node
   */
  getDepth(): Promise<number>

  /**
   * Get siblings query
   */
  siblings(): NestedSetQueryBuilder<LucidModel>

  /**
   * Get ancestors query
   */
  ancestors(): NestedSetQueryBuilder<LucidModel>

  /**
   * Get descendants query
   */
  descendants(): NestedSetQueryBuilder<LucidModel>

  /**
   * Get children query
   */
  children(): NestedSetQueryBuilder<LucidModel>

  /**
   * Get parent
   */
  parent(): Promise<LucidRow | null>

  /**
   * Make node a root
   */
  makeRoot(): Promise<void>

  /**
   * Append node to parent
   */
  appendTo(parent: LucidRow | number | string): Promise<void>
}

/**
 * Interface for tree collection methods
 */
export interface TreeCollectionMethods {
  /**
   * Convert collection to tree structure
   */
  toTree(rootId?: number | string | null): TreeNode[]

  /**
   * Convert collection to flat tree
   */
  toFlatTree(rootId?: number | string | null): LucidRow[]
}

/**
 * Type helper to add nested set methods to a model class
 */
export type NestedSetModel<Model extends LucidModel> = Model & NestedSetQueryBuilderMethods<Model>

/**
 * Type helper to add nested set methods to a model instance
 */
export type NestedSetRow<Row extends LucidRow> = Row & NestedSetInstanceMethods

/**
 * Helper type to properly export a model with nested set methods
 * This preserves the instance type information for methods like find()
 *
 * @template ModelConstructor - The model class constructor (e.g., typeof Category)
 */
export type NestedSetModelExport<ModelConstructor extends LucidModel> = ModelConstructor &
  NestedSetQueryBuilderMethods<ModelConstructor> & {
    new (...args: any[]): InstanceType<ModelConstructor> & NestedSetInstanceMethods
    find(
      id: number | string
    ): Promise<(InstanceType<ModelConstructor> & NestedSetInstanceMethods) | null>
    findOrFail(
      id: number | string
    ): Promise<InstanceType<ModelConstructor> & NestedSetInstanceMethods>
    create(values: any): Promise<InstanceType<ModelConstructor> & NestedSetInstanceMethods>
    first(): Promise<(InstanceType<ModelConstructor> & NestedSetInstanceMethods) | null>
    firstOrFail(): Promise<InstanceType<ModelConstructor> & NestedSetInstanceMethods>
  }

/**
 * Array type with tree methods
 */
export interface TreeArray<T> extends Array<T> {
  toTree(rootId?: number | string | null): TreeNode[]
  toFlatTree(rootId?: number | string | null): T[]
}

/**
 * Module augmentation for LucidModel, LucidRow, and ModelQueryBuilderContract
 * Note: These are base augmentations. For better type inference with specific models,
 * use the NestedSetModel type helper or applyNestedSet return type.
 */
declare module '@adonisjs/lucid/types/model' {
  interface LucidModel extends NestedSetQueryBuilderMethods<LucidModel> {}
  interface LucidRow extends NestedSetInstanceMethods {}
  interface ModelQueryBuilderContract<Model extends LucidModel, Result = InstanceType<Model>> {
    exec(): Promise<TreeArray<Result>>
  }
}
