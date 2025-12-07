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
  NestedSetModelExport,
  NestedSetQueryBuilderMethods,
  NestedSetInstanceMethods,
  TreeArray,
} from './types.js'

import type { NestedSetQueryBuilderMethods, NestedSetInstanceMethods } from './types.js'

/**
 * Apply nested set functionality to a model
 */
import type { LucidModel } from '@adonisjs/lucid/types/model'
import { extendQueryBuilder } from './query_builder.js'
import { extendModelWithTreeMethods } from './tree_builder.js'
import { nestedSetTraitMethods, nestedSetStaticMethods } from './nested_set_trait.js'

/**
 * Apply nested set functionality to a model
 *
 * @param Model - The model class constructor (must extend BaseModel)
 * @returns The same model class with nested set methods added and proper typing
 */
export function applyNestedSet<Model extends LucidModel>(
  Model: Model
): Model &
  NestedSetQueryBuilderMethods<Model> & {
    new (...args: any[]): InstanceType<Model> & NestedSetInstanceMethods
    find(id: number | string): Promise<(InstanceType<Model> & NestedSetInstanceMethods) | null>
    findOrFail(id: number | string): Promise<InstanceType<Model> & NestedSetInstanceMethods>
    create(values: any): Promise<InstanceType<Model> & NestedSetInstanceMethods>
    first(): Promise<(InstanceType<Model> & NestedSetInstanceMethods) | null>
    firstOrFail(): Promise<InstanceType<Model> & NestedSetInstanceMethods>
  } {
  // Apply instance methods to model prototype
  Object.assign(Model.prototype, nestedSetTraitMethods)

  // Override delete method to delete descendants
  const originalDelete = Model.prototype.delete
  Model.prototype.delete = async function (this: any) {
    const ModelClass = this.constructor as LucidModel & {
      getLftName(): string
      getRgtName(): string
      descendantsOf(node: any): any
    }
    const lftColumn = ModelClass.getLftName()
    const rgtColumn = ModelClass.getRgtName()

    // Refresh node to get latest _lft and _rgt values
    if (this.$isPersisted) {
      await this.refresh()
    }

    const nodeLft = this.$getAttribute(lftColumn) as number
    const nodeRgt = this.$getAttribute(rgtColumn) as number

    if (nodeLft && nodeRgt) {
      // Delete all descendants (nodes where lft > nodeLft AND rgt < nodeRgt)
      const descendants = ModelClass.descendantsOf(this)
      const descendantsList = await descendants.exec()

      // Delete descendants first (from bottom to top)
      for (const descendant of descendantsList.reverse()) {
        // Use original delete to avoid recursion
        await originalDelete.call(descendant)
      }
    }

    // Delete the node itself
    return originalDelete.call(this)
  }

  // Apply static methods to model
  Object.assign(Model, nestedSetStaticMethods)

  // Extend query builder
  extendQueryBuilder(Model as unknown as LucidModel)

  // Extend model with tree methods
  extendModelWithTreeMethods(Model as unknown as LucidModel)

  return Model as Model &
    NestedSetQueryBuilderMethods<Model> & {
      new (...args: any[]): InstanceType<Model> & NestedSetInstanceMethods
      find(id: number | string): Promise<(InstanceType<Model> & NestedSetInstanceMethods) | null>
      findOrFail(id: number | string): Promise<InstanceType<Model> & NestedSetInstanceMethods>
      create(values: any): Promise<InstanceType<Model> & NestedSetInstanceMethods>
      first(): Promise<(InstanceType<Model> & NestedSetInstanceMethods) | null>
      firstOrFail(): Promise<InstanceType<Model> & NestedSetInstanceMethods>
    }
}
