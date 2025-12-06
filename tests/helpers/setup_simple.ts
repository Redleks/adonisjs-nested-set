/*
|--------------------------------------------------------------------------
| Simple Test Setup (without full AdonisJS setup)
|--------------------------------------------------------------------------
|
| Simplified setup for testing without full AdonisJS application
|
*/

import { BaseModel, column } from '@adonisjs/lucid/orm'
import { applyNestedSet } from '../../src/index.js'

/**
 * Test model for nested set
 * This is a simplified version that doesn't require database connection
 * for unit tests that don't need actual database operations
 */
export class TestCategorySimple extends BaseModel {
  static table = 'test_categories'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare parentId: number | null

  @column()
  declare _lft: number

  @column()
  declare _rgt: number
}

// Apply nested set functionality
applyNestedSet(TestCategorySimple)
