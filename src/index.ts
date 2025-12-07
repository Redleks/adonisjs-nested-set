/*
|--------------------------------------------------------------------------
| Adonis Nested Set Package
|--------------------------------------------------------------------------
|
| This package provides nested set functionality for AdonisJS models,
| similar to laravel-nestedset for Laravel.
|
*/

export { nestedSetTraitMethods, nestedSetStaticMethods } from './nested_set_trait.js'
export { extendQueryBuilder } from './query_builder.js'
export { toTree, toFlatTree, extendModelWithTreeMethods } from './tree_builder.js'
export { addNestedSetColumns, dropNestedSetColumns } from './migration_helper.js'
export type { NestedSetNode, NestedSetOptions } from './nested_set_trait.js'
export type { TreeNode } from './tree_builder.js'
export type {
  NestedSetModel,
  NestedSetRow,
  NestedSetQueryBuilderMethods,
  TreeArray,
} from './types.js'

/**
 * Apply nested set functionality to a model
 */
import type { LucidModel } from '@adonisjs/lucid/types/model'
import { extendQueryBuilder } from './query_builder.js'
import { extendModelWithTreeMethods } from './tree_builder.js'
import { nestedSetTraitMethods, nestedSetStaticMethods } from './nested_set_trait.js'

/**
 * Type for model constructor - accepts any class constructor
 * The model will be extended with nested set methods at runtime
 */
type ModelConstructor = new (...args: any[]) => any

/**
 * Apply nested set functionality to a model
 *
 * @param Model - The model class constructor (must extend BaseModel)
 * @returns The same model class with nested set methods added
 */
export function applyNestedSet<T extends ModelConstructor>(Model: T): T & LucidModel {
  // Apply instance methods to model prototype
  Object.assign(Model.prototype, nestedSetTraitMethods)

  // Apply static methods to model
  Object.assign(Model, nestedSetStaticMethods)

  // Extend query builder
  extendQueryBuilder(Model as unknown as LucidModel)

  // Extend model with tree methods
  extendModelWithTreeMethods(Model as unknown as LucidModel)

  return Model as T & LucidModel
}
