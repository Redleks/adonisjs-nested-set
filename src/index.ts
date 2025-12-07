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

/**
 * Apply nested set functionality to a model
 */
import type { LucidModel } from '@adonisjs/lucid/types/model'
import { extendQueryBuilder } from './query_builder.js'
import { extendModelWithTreeMethods } from './tree_builder.js'
import { nestedSetTraitMethods, nestedSetStaticMethods } from './nested_set_trait.js'

export function applyNestedSet<T extends LucidModel>(Model: T): T {
  // Apply instance methods to model prototype
  Object.assign(Model.prototype, nestedSetTraitMethods)

  // Apply static methods to model
  Object.assign(Model, nestedSetStaticMethods)

  // Extend query builder
  extendQueryBuilder(Model as LucidModel)

  // Extend model with tree methods
  extendModelWithTreeMethods(Model as LucidModel)

  return Model
}
