/*
|--------------------------------------------------------------------------
| Tree Builder Tests
|--------------------------------------------------------------------------
|
| Tests for tree building functions
|
*/

import { test } from '@japa/runner'
import { toTree, toFlatTree } from '../src/tree_builder.js'
import { TestCategorySimple } from './helpers/setup_simple.js'

test.group('Tree Builder', () => {
  test('toTree should convert flat collection to tree', ({ assert }) => {
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 8

    const child1 = new TestCategorySimple()
    child1.id = 2
    child1.name = 'Child 1'
    child1.parentId = 1
    child1._lft = 2
    child1._rgt = 5

    const child2 = new TestCategorySimple()
    child2.id = 3
    child2.name = 'Child 2'
    child2.parentId = 1
    child2._lft = 6
    child2._rgt = 7

    const grandchild = new TestCategorySimple()
    grandchild.id = 4
    grandchild.name = 'Grandchild'
    grandchild.parentId = 2
    grandchild._lft = 3
    grandchild._rgt = 4

    const nodes = [root, child1, child2, grandchild]
    const tree = toTree(nodes)

    assert.lengthOf(tree, 1)
    assert.equal(tree[0].name, 'Root')
    assert.isArray((tree[0] as any).children)
    assert.lengthOf((tree[0] as any).children, 2)
    assert.equal((tree[0] as any).children[0].name, 'Child 1')
    assert.equal((tree[0] as any).children[1].name, 'Child 2')
    assert.lengthOf((tree[0] as any).children[0].children, 1)
    assert.equal((tree[0] as any).children[0].children[0].name, 'Grandchild')
  })

  test('toFlatTree should convert to flat tree structure', ({ assert }) => {
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 8

    const child1 = new TestCategorySimple()
    child1.id = 2
    child1.name = 'Child 1'
    child1.parentId = 1
    child1._lft = 2
    child1._rgt = 5

    const child2 = new TestCategorySimple()
    child2.id = 3
    child2.name = 'Child 2'
    child2.parentId = 1
    child2._lft = 6
    child2._rgt = 7

    const grandchild = new TestCategorySimple()
    grandchild.id = 4
    grandchild.name = 'Grandchild'
    grandchild.parentId = 2
    grandchild._lft = 3
    grandchild._rgt = 4

    const nodes = [root, child1, child2, grandchild]
    const flatTree = toFlatTree(nodes)

    assert.lengthOf(flatTree, 4)
    assert.equal(flatTree[0].name, 'Root')
    assert.equal(flatTree[1].name, 'Child 1')
    assert.equal(flatTree[2].name, 'Grandchild')
    assert.equal(flatTree[3].name, 'Child 2')
  })

  test('toTree should handle empty collection', ({ assert }) => {
    const tree = toTree([])
    assert.lengthOf(tree, 0)
  })

  test('toFlatTree should handle empty collection', ({ assert }) => {
    const flatTree = toFlatTree([])
    assert.lengthOf(flatTree, 0)
  })

  test('toTree should handle single root node', ({ assert }) => {
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null

    const tree = toTree([root])
    assert.lengthOf(tree, 1)
    assert.equal(tree[0].name, 'Root')
  })
})
