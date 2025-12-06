# AdonisJS Nested Set

Nested set model implementation for AdonisJS, similar to [laravel-nestedset](https://github.com/lazychaser/laravel-nestedset) for Laravel.

This package provides efficient tree operations using the Nested Set Model algorithm.

## Installation

```bash
npm install adonisjs-nested-set
```

## Usage

### 1. Create Migration

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'
import { addNestedSetColumns } from 'adonisjs-nested-set'

export default class extends BaseSchema {
  protected tableName = 'categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()

      // Add nested set columns (_lft, _rgt, parent_id)
      addNestedSetColumns(table)

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### 2. Create Model

```typescript
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { applyNestedSet } from 'adonisjs-nested-set'

export default class Category extends BaseModel {
  static table = 'categories'

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
applyNestedSet(Category)
```

### 3. Use in Your Code

#### Inserting Nodes

```typescript
// Create root node
const root = await Category.create({ name: 'Root' })
await Category.fixTree()

// Create child node
const child = await Category.create({ name: 'Child', parentId: root.id })
await Category.fixTree()

// Or use appendTo method
const child2 = new Category()
child2.name = 'Child 2'
await child2.appendTo(root)
```

#### Retrieving Nodes

```typescript
// Get all roots
const roots = await Category.roots().exec()

// Get ancestors
const ancestors = await Category.ancestorsOf(node).exec()
const ancestorsAndSelf = await Category.ancestorsAndSelf(node).exec()

// Get descendants
const descendants = await Category.descendantsOf(node).exec()
const descendantsAndSelf = await Category.descendantsAndSelf(node).exec()

// Get siblings
const siblings = await Category.siblingsOf(node).exec()
const siblingsAndSelf = await Category.siblingsAndSelf(node).exec()

// Instance methods
const node = await Category.find(1)
const nodeAncestors = await node.ancestors().exec()
const nodeDescendants = await node.descendants().exec()
const nodeChildren = await node.children().exec()
const nodeParent = await node.parent()
```

#### Building Tree

```typescript
// Convert to tree structure
const nodes = await Category.all()
const tree = nodes.toTree()

// Convert to flat tree (children immediately after parent)
const flatTree = nodes.toFlatTree()

// Get subtree
const root = await Category.find(rootId)
const subtree = await Category.descendantsAndSelf(rootId).exec()
const treeStructure = subtree.toTree()
```

#### Helper Methods

```typescript
const node = await Category.find(1)

// Check node properties
node.isRoot() // Check if node is root
node.isLeaf() // Check if node is leaf
node.isDescendantOf(other) // Check if node is descendant
node.isAncestorOf(other) // Check if node is ancestor
node.isChildOf(other) // Check if node is child
node.isSiblingOf(other) // Check if node is sibling
await node.getDepth() // Get depth of node
```

#### Checking Consistency

```typescript
// Check if tree is broken
const isBroken = await Category.isBroken()

// Get error statistics
const errors = await Category.countErrors()
// Returns: { oddness, duplicates, wrong_parent, missing_parent }

// Fix tree structure
await Category.fixTree()
```

#### Query Constraints

```typescript
// Where ancestor of
const result = await Category.whereAncestorOf(node).exec()
const result2 = await Category.whereAncestorOrSelf(node).exec()

// Where descendant of
const result3 = await Category.whereDescendantOf(node).exec()
const result4 = await Category.whereDescendantOrSelf(node).exec()
```

## API Reference

### Static Methods

- `Category.roots()` - Get all root nodes
- `Category.ancestorsOf(node)` - Get ancestors of a node
- `Category.ancestorsAndSelf(node)` - Get ancestors including self
- `Category.descendantsOf(node)` - Get descendants of a node
- `Category.descendantsAndSelf(node)` - Get descendants including self
- `Category.siblingsOf(node)` - Get siblings of a node
- `Category.siblingsAndSelf(node)` - Get siblings including self
- `Category.whereAncestorOf(node)` - Where ancestor of
- `Category.whereAncestorOrSelf(node)` - Where ancestor or self
- `Category.whereDescendantOf(node)` - Where descendant of
- `Category.whereDescendantOrSelf(node)` - Where descendant or self
- `Category.isBroken()` - Check if tree is broken
- `Category.countErrors()` - Count errors in tree
- `Category.fixTree()` - Fix tree structure
- `Category.getLftName()` - Get left column name (default: '\_lft')
- `Category.getRgtName()` - Get right column name (default: '\_rgt')
- `Category.getParentIdName()` - Get parent ID column name (default: 'parent_id')

### Instance Methods

- `node.isRoot()` - Check if node is root
- `node.isLeaf()` - Check if node is leaf
- `node.isDescendantOf(other)` - Check if node is descendant
- `node.isAncestorOf(other)` - Check if node is ancestor
- `node.isChildOf(other)` - Check if node is child
- `node.isSiblingOf(other)` - Check if node is sibling
- `node.getDepth()` - Get depth of node
- `node.siblings()` - Get siblings query
- `node.ancestors()` - Get ancestors query
- `node.descendants()` - Get descendants query
- `node.children()` - Get children query
- `node.parent()` - Get parent node
- `node.makeRoot()` - Make node a root
- `node.appendTo(parent)` - Append node to parent

### Collection Methods

- `collection.toTree()` - Convert collection to tree structure
- `collection.toFlatTree()` - Convert collection to flat tree

## Migration Helpers

- `addNestedSetColumns(table, lftColumn?, rgtColumn?, parentIdColumn?)` - Add nested set columns
- `dropNestedSetColumns(table, lftColumn?, rgtColumn?, parentIdColumn?)` - Drop nested set columns

## License

MIT
