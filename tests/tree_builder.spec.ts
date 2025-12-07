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

  test('toTree should handle rootId parameter for orphaned nodes', ({ assert }) => {
    // Test with orphaned node (parent doesn't exist in nodes)
    const orphan = new TestCategorySimple()
    orphan.id = 3
    orphan.name = 'Orphan'
    orphan.parentId = 999 // Parent doesn't exist

    const nodes = [orphan]
    // When rootId is 999, orphaned nodes with parentId === 999 should be in tree
    const tree = toTree(nodes, 999)

    // Orphaned node with matching parentId should be included
    assert.lengthOf(tree, 1)
    assert.equal(tree[0].name, 'Orphan')
  })

  test('toFlatTree should handle rootId parameter', ({ assert }) => {
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null

    const child = new TestCategorySimple()
    child.id = 2
    child.name = 'Child'
    child.parentId = 1

    const nodes = [root, child]
    // Test with rootId = null (default behavior)
    const flatTree = toFlatTree(nodes, null)

    assert.lengthOf(flatTree, 2)
    assert.equal(flatTree[0].name, 'Root')
    assert.equal(flatTree[1].name, 'Child')
  })

  test('toTree should handle node with parent that has no children array', ({ assert }) => {
    // This tests the case where parent.children might not exist
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null

    const child = new TestCategorySimple()
    child.id = 2
    child.name = 'Child'
    child.parentId = 1

    const nodes = [root, child]
    const tree = toTree(nodes)

    assert.lengthOf(tree, 1)
    assert.isArray((tree[0] as any).children)
    assert.lengthOf((tree[0] as any).children, 1)
  })

  test('toTree should set parent reference on children', ({ assert }) => {
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null

    const child = new TestCategorySimple()
    child.id = 2
    child.name = 'Child'
    child.parentId = 1

    const nodes = [root, child]
    const tree = toTree(nodes)

    assert.lengthOf(tree, 1)
    const childNode = (tree[0] as any).children[0]
    assert.exists(childNode.parent)
    assert.equal(childNode.parent.name, 'Root')
  })

  test('extendModelWithTreeMethods should add toTree method to prototype', ({ assert }) => {
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null

    const child = new TestCategorySimple()
    child.id = 2
    child.name = 'Child'
    child.parentId = 1

    // Create an array that mimics query results and call toTree on it
    const results = [root, child] as any
    // Bind the prototype method to the array to test it
    const toTreeMethod = (TestCategorySimple.prototype as any).toTree
    assert.isFunction(toTreeMethod)

    // Actually call the method to cover the implementation
    const tree = toTreeMethod.call(results)
    assert.lengthOf(tree, 1)
    assert.equal(tree[0].name, 'Root')
  })

  test('extendModelWithTreeMethods should add toFlatTree method to prototype', ({ assert }) => {
    const root = new TestCategorySimple()
    root.id = 1
    root.name = 'Root'
    root.parentId = null

    const child = new TestCategorySimple()
    child.id = 2
    child.name = 'Child'
    child.parentId = 1

    // Verify the method exists and can be called
    const toFlatTreeMethod = (TestCategorySimple.prototype as any).toFlatTree
    assert.isFunction(toFlatTreeMethod)

    // Actually call the method to cover the implementation
    const results = [root, child] as any
    const flatTree = toFlatTreeMethod.call(results)
    assert.lengthOf(flatTree, 2)
    assert.equal(flatTree[0].name, 'Root')
  })
})
