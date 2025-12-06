/*
|--------------------------------------------------------------------------
| Migration Helper Tests
|--------------------------------------------------------------------------
|
| Tests for migration helper functions
|
*/

import { test } from '@japa/runner'
import { addNestedSetColumns, dropNestedSetColumns } from '../src/migration_helper.js'

test.group('Migration Helper', () => {
  test('addNestedSetColumns should add correct columns', async ({ assert }) => {
    const table: any = {
      columns: [] as any[],
      indexes: [] as any[],
      unsignedInteger: function (name: string) {
        const column = { name, type: 'unsignedInteger', nullable: true }
        this.columns.push(column)
        return {
          nullable: function () {
            return this
          }.bind({ columns: this.columns, indexes: this.indexes }),
        }
      },
      index: function (columns: string[]) {
        this.indexes.push(columns)
        return this
      },
    }

    addNestedSetColumns(table)

    const columnNames = table.columns.map((c: any) => c.name)
    assert.include(columnNames, '_lft')
    assert.include(columnNames, '_rgt')
    assert.include(columnNames, 'parent_id')

    // Check indexes
    const hasLftRgtIndex = table.indexes.some(
      (idx: string[]) => idx.includes('_lft') && idx.includes('_rgt')
    )
    const hasParentIdIndex = table.indexes.some((idx: string[]) => idx.includes('parent_id'))

    assert.isTrue(hasLftRgtIndex)
    assert.isTrue(hasParentIdIndex)
  })

  test('addNestedSetColumns should use custom column names', async ({ assert }) => {
    const table: any = {
      columns: [] as any[],
      indexes: [] as any[],
      unsignedInteger: function (name: string) {
        const column = { name, type: 'unsignedInteger', nullable: true }
        this.columns.push(column)
        return {
          nullable: function () {
            return this
          }.bind({ columns: this.columns, indexes: this.indexes }),
        }
      },
      index: function (columns: string[]) {
        this.indexes.push(columns)
        return this
      },
    }

    addNestedSetColumns(table, 'left', 'right', 'parent')

    const columnNames = table.columns.map((c: any) => c.name)
    assert.include(columnNames, 'left')
    assert.include(columnNames, 'right')
    assert.include(columnNames, 'parent')
  })

  test('dropNestedSetColumns should drop correct columns', async ({ assert }) => {
    const droppedColumns: string[] = []
    const droppedIndexes: string[][] = []

    const table: any = {
      dropIndex: function (columns: string[]) {
        droppedIndexes.push(columns)
        return this
      },
      dropColumn: function (name: string) {
        droppedColumns.push(name)
        return this
      },
    }

    dropNestedSetColumns(table)

    assert.include(droppedColumns, '_lft')
    assert.include(droppedColumns, '_rgt')
    assert.include(droppedColumns, 'parent_id')

    // Check that indexes were dropped
    assert.isTrue(droppedIndexes.length >= 2)
  })
})
