/*
|--------------------------------------------------------------------------
| Nested Set Trait Tests
|--------------------------------------------------------------------------
|
| Tests for nested set trait instance methods
|
*/

import { test } from '@japa/runner'
import { TestCategorySimple } from './helpers/setup_simple.js'

test.group('Nested Set Trait', () => {
  test('isRoot should return true for root nodes', ({ assert }) => {
    const root = new TestCategorySimple()
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 2

    assert.isTrue(root.isRoot())
  })

  test('isRoot should return false for child nodes', ({ assert }) => {
    const root = new TestCategorySimple()
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 4
    root.id = 1

    const child = new TestCategorySimple()
    child.name = 'Child'
    child.parentId = root.id
    child._lft = 2
    child._rgt = 3
    child.id = 2

    assert.isFalse(child.isRoot())
  })

  test('isLeaf should return true for leaf nodes', ({ assert }) => {
    const leaf = new TestCategorySimple()
    leaf.name = 'Leaf'
    leaf.parentId = null
    leaf._lft = 1
    leaf._rgt = 2

    assert.isTrue(leaf.isLeaf())
  })

  test('isLeaf should return false for nodes with children', ({ assert }) => {
    const parent = new TestCategorySimple()
    parent.name = 'Parent'
    parent.parentId = null
    parent._lft = 1
    parent._rgt = 4

    const child = new TestCategorySimple()
    child.name = 'Child'
    child.parentId = parent.id
    child._lft = 2
    child._rgt = 3

    assert.isFalse(parent.isLeaf())
    assert.isTrue(child.isLeaf())
  })

  test('isDescendantOf should correctly identify descendants', ({ assert }) => {
    const root = new TestCategorySimple()
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 6
    root.id = 1

    const child = new TestCategorySimple()
    child.name = 'Child'
    child.parentId = root.id
    child._lft = 2
    child._rgt = 5
    child.id = 2

    const grandchild = new TestCategorySimple()
    grandchild.name = 'Grandchild'
    grandchild.parentId = child.id
    grandchild._lft = 3
    grandchild._rgt = 4
    grandchild.id = 3

    assert.isTrue(child.isDescendantOf(root))
    assert.isTrue(grandchild.isDescendantOf(root))
    assert.isTrue(grandchild.isDescendantOf(child))
    assert.isFalse(root.isDescendantOf(child))
  })

  test('isAncestorOf should correctly identify ancestors', ({ assert }) => {
    const root = new TestCategorySimple()
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 6
    root.id = 1

    const child = new TestCategorySimple()
    child.name = 'Child'
    child.parentId = root.id
    child._lft = 2
    child._rgt = 5
    child.id = 2

    const grandchild = new TestCategorySimple()
    grandchild.name = 'Grandchild'
    grandchild.parentId = child.id
    grandchild._lft = 3
    grandchild._rgt = 4
    grandchild.id = 3

    assert.isTrue(root.isAncestorOf(child))
    assert.isTrue(root.isAncestorOf(grandchild))
    assert.isTrue(child.isAncestorOf(grandchild))
    assert.isFalse(child.isAncestorOf(root))
  })

  test('isChildOf should correctly identify parent-child relationship', ({ assert }) => {
    const root = new TestCategorySimple()
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 4
    root.id = 1

    const child = new TestCategorySimple()
    child.name = 'Child'
    child.parentId = root.id
    child._lft = 2
    child._rgt = 3
    child.id = 2

    assert.isTrue(child.isChildOf(root))
    assert.isFalse(root.isChildOf(child))
  })

  test('isSiblingOf should correctly identify siblings', ({ assert }) => {
    const root = new TestCategorySimple()
    root.name = 'Root'
    root.parentId = null
    root._lft = 1
    root._rgt = 8
    root.id = 1

    const child1 = new TestCategorySimple()
    child1.name = 'Child 1'
    child1.parentId = root.id
    child1._lft = 2
    child1._rgt = 3
    child1.id = 2

    const child2 = new TestCategorySimple()
    child2.name = 'Child 2'
    child2.parentId = root.id
    child2._lft = 4
    child2._rgt = 5
    child2.id = 3

    assert.isTrue(child1.isSiblingOf(child2))
    assert.isTrue(child2.isSiblingOf(child1))
    assert.isFalse(root.isSiblingOf(child1))
  })
})
