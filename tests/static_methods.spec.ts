/*
|--------------------------------------------------------------------------
| Static Methods Tests
|--------------------------------------------------------------------------
|
| Tests for static methods (getLftName, getRgtName, etc.)
|
*/

import { test } from '@japa/runner'
import { TestCategorySimple } from './helpers/setup_simple.js'

test.group('Static Methods', () => {
  test('getLftName should return default left column name', ({ assert }) => {
    assert.equal(TestCategorySimple.getLftName(), '_lft')
  })

  test('getRgtName should return default right column name', ({ assert }) => {
    assert.equal(TestCategorySimple.getRgtName(), '_rgt')
  })

  test('getParentIdName should return default parent ID column name', ({ assert }) => {
    assert.equal(TestCategorySimple.getParentIdName(), 'parentId')
  })

  test('getScopeAttributes should return empty array by default', ({ assert }) => {
    const attributes = TestCategorySimple.getScopeAttributes()
    assert.isArray(attributes)
    assert.lengthOf(attributes, 0)
  })
})
