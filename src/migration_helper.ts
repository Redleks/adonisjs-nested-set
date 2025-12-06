/*
|--------------------------------------------------------------------------
| Migration Helper
|--------------------------------------------------------------------------
|
| Helper functions for creating nested set columns in migrations
|
*/

// Knex types are provided by @adonisjs/lucid

/**
 * Add nested set columns to table
 */
export function addNestedSetColumns(
  table: any,
  lftColumn: string = '_lft',
  rgtColumn: string = '_rgt',
  parentIdColumn: string = 'parent_id'
) {
  table.unsignedInteger(lftColumn).nullable()
  table.unsignedInteger(rgtColumn).nullable()
  table.unsignedInteger(parentIdColumn).nullable()

  // Add indexes for better performance
  table.index([lftColumn, rgtColumn])
  table.index([parentIdColumn])
}

/**
 * Drop nested set columns from table
 */
export function dropNestedSetColumns(
  table: any,
  lftColumn: string = '_lft',
  rgtColumn: string = '_rgt',
  parentIdColumn: string = 'parent_id'
) {
  table.dropIndex([lftColumn, rgtColumn])
  table.dropIndex([parentIdColumn])
  table.dropColumn(lftColumn)
  table.dropColumn(rgtColumn)
  table.dropColumn(parentIdColumn)
}
