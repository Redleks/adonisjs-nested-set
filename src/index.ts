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
import type { BaseModel } from '@adonisjs/lucid/orm'
import { extendQueryBuilder } from './query_builder.js'
import { extendModelWithTreeMethods } from './tree_builder.js'
import { nestedSetTraitMethods, nestedSetStaticMethods } from './nested_set_trait.js'

export function applyNestedSet(Model: typeof BaseModel) {
  // Apply instance methods to model prototype
  Object.assign(Model.prototype, nestedSetTraitMethods)
  
  // Apply static methods to model
  Object.assign(Model, nestedSetStaticMethods)
  
  // Extend query builder
  extendQueryBuilder(Model)
  
  // Extend model with tree methods
  extendModelWithTreeMethods(Model)
}

