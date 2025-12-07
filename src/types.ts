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
 * Helper type for query builder with nested set methods
 */
type NestedSetQueryBuilder<Model extends LucidModel> = ModelQueryBuilderContract<
  Model,
  InstanceType<Model>
>

/**
 * Interface for nested set query builder methods
 */
export interface NestedSetQueryBuilderMethods {
  /**
   * Get all root nodes
   */
  roots(): NestedSetQueryBuilder<LucidModel>

  /**
   * Get ancestors of a node
   */
  ancestorsOf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Get ancestors including self
   */
  ancestorsAndSelf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Get descendants of a node
   */
  descendantsOf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Get descendants including self
   */
  descendantsAndSelf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Get siblings of a node
   */
  siblingsOf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Get siblings including self
   */
  siblingsAndSelf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Where ancestor of
   */
  whereAncestorOf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Where ancestor or self
   */
  whereAncestorOrSelf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Where descendant of
   */
  whereDescendantOf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Where descendant or self
   */
  whereDescendantOrSelf(node: LucidRow | number | string): NestedSetQueryBuilder<LucidModel>

  /**
   * Get nodes with depth
   */
  withDepth(as?: string): NestedSetQueryBuilder<LucidModel>

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
export type NestedSetModel<Model extends LucidModel> = Model & NestedSetQueryBuilderMethods

/**
 * Type helper to add nested set methods to a model instance
 */
export type NestedSetRow<Row extends LucidRow> = Row & NestedSetInstanceMethods

/**
 * Array type with tree methods
 */
export interface TreeArray<T> extends Array<T> {
  toTree(rootId?: number | string | null): TreeNode[]
  toFlatTree(rootId?: number | string | null): T[]
}

/**
 * Module augmentation for LucidModel, LucidRow, and ModelQueryBuilderContract
 */
declare module '@adonisjs/lucid/types/model' {
  interface LucidModel extends NestedSetQueryBuilderMethods {}
  interface LucidRow extends NestedSetInstanceMethods {}
  interface ModelQueryBuilderContract<Model extends LucidModel, Result = InstanceType<Model>> {
    exec(): Promise<TreeArray<Result>>
  }
}
