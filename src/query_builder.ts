/*
|--------------------------------------------------------------------------
| Query Builder Extensions
|--------------------------------------------------------------------------
|
| Extensions for Lucid query builder to work with nested sets
|
*/

import type { ModelQueryBuilderContract, LucidModel, LucidRow } from '@adonisjs/lucid/types/model'
import { addTreeMethodsToArray } from './tree_builder.js'

/**
 * Extend query builder with nested set methods
 */
export function extendQueryBuilder(Model: LucidModel) {
  // Override query() to add tree methods to exec() results
  const originalQuery = Model.query.bind(Model)
  Model.query = function (this: LucidModel) {
    const query = originalQuery.call(this)
    const originalExec = query.exec.bind(query)
    query.exec = async function () {
      const results = await originalExec()
      return addTreeMethodsToArray(results as LucidRow[])
    }
    return query
  } as typeof Model.query
  const lftColumn = (Model as LucidModel & { getLftName(): string }).getLftName()
  const rgtColumn = (Model as LucidModel & { getRgtName(): string }).getRgtName()
  const parentIdColumn = (Model as LucidModel & { getParentIdName(): string }).getParentIdName()

  /**
   * Get all roots
   */
  ;(Model as LucidModel & { roots(): ModelQueryBuilderContract<LucidModel> }).roots = function (
    this: LucidModel
  ): ModelQueryBuilderContract<LucidModel> {
    return this.query().whereNull(parentIdColumn)
  }

  /**
   * Get ancestors of a node
   */
  ;(
    Model as LucidModel & {
      ancestorsOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).ancestorsOf = function (
    this: LucidModel,
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    const query = this.query()

    if (typeof node === 'object' && node !== null) {
      const nodeLft = node.$getAttribute(lftColumn) as number
      const nodeRgt = node.$getAttribute(rgtColumn) as number
      return query
        .where(lftColumn, '<', nodeLft)
        .where(rgtColumn, '>', nodeRgt)
        .orderBy(lftColumn, 'asc')
    }

    // If node is ID, return empty query - user should load node first
    return query.whereRaw('1 = 0')
  }

  /**
   * Get ancestors including self
   */
  ;(
    Model as LucidModel & {
      ancestorsAndSelf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).ancestorsAndSelf = function (
    this: LucidModel,
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    const query = this.query()

    if (typeof node === 'object' && node !== null) {
      const nodeLft = node.$getAttribute(lftColumn) as number
      const nodeRgt = node.$getAttribute(rgtColumn) as number
      return query
        .where(lftColumn, '<=', nodeLft)
        .where(rgtColumn, '>=', nodeRgt)
        .orderBy(lftColumn, 'asc')
    }

    return query.whereRaw('1 = 0')
  }

  /**
   * Get descendants of a node
   */
  ;(
    Model as LucidModel & {
      descendantsOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).descendantsOf = function (
    this: LucidModel,
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    const query = this.query()

    if (typeof node === 'object' && node !== null) {
      const nodeLft = node.$getAttribute(lftColumn) as number
      const nodeRgt = node.$getAttribute(rgtColumn) as number
      return query
        .where(lftColumn, '>', nodeLft)
        .where(rgtColumn, '<', nodeRgt)
        .orderBy(lftColumn, 'asc')
    }

    return query.whereRaw('1 = 0')
  }

  /**
   * Get descendants including self
   */
  ;(
    Model as LucidModel & {
      descendantsAndSelf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).descendantsAndSelf = function (
    this: LucidModel,
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    const query = this.query()

    if (typeof node === 'object' && node !== null) {
      const nodeLft = node.$getAttribute(lftColumn) as number
      const nodeRgt = node.$getAttribute(rgtColumn) as number
      return query
        .where(lftColumn, '>=', nodeLft)
        .where(rgtColumn, '<=', nodeRgt)
        .orderBy(lftColumn, 'asc')
    }

    return query.whereRaw('1 = 0')
  }

  /**
   * Get siblings of a node
   */
  ;(
    Model as LucidModel & {
      siblingsOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).siblingsOf = function (
    this: LucidModel,
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    const query = this.query()

    if (typeof node === 'object' && node !== null) {
      const parentId = node.$getAttribute(parentIdColumn) as number | string | null
      query.where('id', '!=', node.$primaryKeyValue ?? node.$getAttribute('id'))

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
  ;(
    Model as LucidModel & {
      siblingsAndSelf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).siblingsAndSelf = function (
    this: LucidModel,
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    const query = this.query()

    if (typeof node === 'object' && node !== null) {
      const parentId = node.$getAttribute(parentIdColumn) as number | string | null

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
  ;(
    Model as LucidModel & {
      whereAncestorOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).whereAncestorOf = function (
    this: LucidModel & {
      ancestorsOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    },
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    return this.ancestorsOf(node) as any
  } as any

  /**
   * Where ancestor or self
   */
  ;(
    Model as LucidModel & {
      whereAncestorOrSelf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).whereAncestorOrSelf = function (
    this: LucidModel & {
      ancestorsAndSelf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    },
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    return this.ancestorsAndSelf(node) as any
  } as any

  /**
   * Where descendant of
   */
  ;(
    Model as LucidModel & {
      whereDescendantOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).whereDescendantOf = function (
    this: LucidModel & {
      descendantsOf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    },
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    return this.descendantsOf(node) as any
  } as any

  /**
   * Where descendant or self
   */
  ;(
    Model as LucidModel & {
      whereDescendantOrSelf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    }
  ).whereDescendantOrSelf = function (
    this: LucidModel & {
      descendantsAndSelf(node: LucidRow | number | string): ModelQueryBuilderContract<LucidModel>
    },
    node: LucidRow | number | string
  ): ModelQueryBuilderContract<LucidModel> {
    return this.descendantsAndSelf(node) as any
  } as any

  /**
   * Get nodes with depth
   */
  ;(
    Model as LucidModel & {
      withDepth(as?: string): ModelQueryBuilderContract<LucidModel>
    }
  ).withDepth = function (
    this: LucidModel,
    as: string = 'depth'
  ): ModelQueryBuilderContract<LucidModel> {
    const query = this.query()
    const tableName = (this as LucidModel).table

    // Calculate depth using subquery that counts ancestors
    // Depth = number of ancestors (nodes where lft < current.lft AND rgt > current.rgt)
    const db = (query as any).client
    const raw = db.raw(
      `(SELECT COUNT(*) FROM ${tableName} AS ancestors WHERE ancestors.${lftColumn} < ${tableName}.${lftColumn} AND ancestors.${rgtColumn} > ${tableName}.${rgtColumn}) AS ${as}`
    )
    return query.select('*').select(raw as any)
  }

  /**
   * Check if tree is broken
   */
  ;(
    Model as LucidModel & {
      isBroken(): Promise<boolean>
    }
  ).isBroken = async function (
    this: LucidModel & {
      countErrors(): Promise<{
        oddness: number
        duplicates: number
        wrong_parent: number
        missing_parent: number
      }>
    }
  ): Promise<boolean> {
    const errors = await this.countErrors()
    const values = Object.keys(errors).map((key) => errors[key as keyof typeof errors])
    return values.some((count) => count > 0)
  }

  /**
   * Count errors in tree
   */
  ;(
    Model as LucidModel & {
      countErrors(): Promise<{
        oddness: number
        duplicates: number
        wrong_parent: number
        missing_parent: number
      }>
    }
  ).countErrors = async function (this: LucidModel): Promise<{
    oddness: number
    duplicates: number
    wrong_parent: number
    missing_parent: number
  }> {
    const nodes = await this.query().exec()

    let oddness = 0
    let duplicates = 0
    const lftValues = new Set<number>()
    const rgtValues = new Set<number>()

    for (const node of nodes) {
      const lft = node.$getAttribute(lftColumn) as number
      const rgt = node.$getAttribute(rgtColumn) as number

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
      const parentId = node.$getAttribute(parentIdColumn) as number | string | null

      if (parentId) {
        const parent = nodes.find((n) => (n.$primaryKeyValue ?? n.$getAttribute('id')) === parentId)
        if (!parent) {
          missingParent++
        } else {
          const parentLft = parent.$getAttribute(lftColumn) as number
          const parentRgt = parent.$getAttribute(rgtColumn) as number
          const nodeLft = node.$getAttribute(lftColumn) as number
          const nodeRgt = node.$getAttribute(rgtColumn) as number

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
  ;(
    Model as LucidModel & {
      fixTree(): Promise<void>
    }
  ).fixTree = async function (this: LucidModel): Promise<void> {
    const nodes = await this.query().orderBy(parentIdColumn, 'asc').orderBy('id', 'asc').exec()

    let counter = 1

    const buildTree = async (
      parentId: number | string | null,
      nodeList: LucidRow[]
    ): Promise<void> => {
      const children = nodeList.filter(
        (node) => (node.$getAttribute(parentIdColumn) as number | string | null) === parentId
      )

      for (const node of children) {
        node.$setAttribute(lftColumn, counter++)
        await node.save()

        const nodeId = node.$primaryKeyValue ?? node.$getAttribute('id')
        const nodeChildren = nodeList.filter(
          (n) => (n.$getAttribute(parentIdColumn) as number | string | null) === nodeId
        )
        if (nodeChildren.length > 0) {
          await buildTree(nodeId, nodeList)
        }

        node.$setAttribute(rgtColumn, counter++)
        await node.save()
      }
    }

    await buildTree(null, nodes)
  }
}
