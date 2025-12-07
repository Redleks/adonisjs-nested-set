/*
|--------------------------------------------------------------------------
| Query Builder Tests
|--------------------------------------------------------------------------
|
| Tests for query builder extensions
|
*/

import { test } from '@japa/runner'
import { TestCategorySimple } from './helpers/setup_simple.js'

test.group('Query Builder', () => {
  test('roots should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).roots)
  })

  test('ancestorsOf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).ancestorsOf)
  })

  test('ancestorsAndSelf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).ancestorsAndSelf)
  })

  test('descendantsOf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).descendantsOf)
  })

  test('descendantsAndSelf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).descendantsAndSelf)
  })

  test('siblingsOf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).siblingsOf)
  })

  test('siblingsAndSelf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).siblingsAndSelf)
  })

  test('whereAncestorOf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).whereAncestorOf)
  })

  test('whereAncestorOrSelf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).whereAncestorOrSelf)
  })

  test('whereDescendantOf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).whereDescendantOf)
  })

  test('whereDescendantOrSelf should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).whereDescendantOrSelf)
  })

  test('withDepth should be a function', ({ assert }) => {
    assert.isFunction((TestCategorySimple as any).withDepth)
  })
})
