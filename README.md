# AdonisJS Nested Set

![license](https://img.shields.io/badge/license-MIT-brightGreen.svg)

Nested set model implementation for [AdonisJS](https://adonisjs.com), similar to [laravel-nestedset](https://github.com/lazychaser/laravel-nestedset) for Laravel.

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

class Category extends BaseModel {
  static table = 'categories'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({ columnName: 'parent_id' })
  declare parentId: number | null

  @column({ columnName: '_lft' })
  declare _lft: number

  @column({ columnName: '_rgt' })
  declare _rgt: number
}

// Apply nested set functionality to the model
// The function returns properly typed model with all nested set methods
const CategoryWithNestedSet = applyNestedSet(Category)

// Export the typed model
// TypeScript automatically infers all nested set methods with proper types
export default CategoryWithNestedSet
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
await Category.fixTree()
```

#### Retrieving Nodes

```typescript
// Get all roots
const roots = await Category.roots().exec()

// Get a node
const node = await Category.find(1)

if (node) {
  // Static methods - called on Category class
  const ancestors = await Category.ancestorsOf(node).exec()
  const ancestorsAndSelf = await Category.ancestorsAndSelf(node).exec()
  const descendants = await Category.descendantsOf(node).exec()
  const descendantsAndSelf = await Category.descendantsAndSelf(node).exec()
  const siblings = await Category.siblingsOf(node).exec()
  const siblingsAndSelf = await Category.siblingsAndSelf(node).exec()

  // Instance methods - called on node instance
  const nodeAncestors = await node.ancestors().exec()
  const nodeDescendants = await node.descendants().exec()
  const nodeChildren = await node.children().exec()
  const nodeParent = await node.parent()
}
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

if (node) {
  // Check node properties
  const isRoot = node.isRoot() // Check if node is root
  const isLeaf = node.isLeaf() // Check if node is leaf

  const other = await Category.find(2)
  if (other) {
    const isDescendant = node.isDescendantOf(other) // Check if node is descendant
    const isAncestor = node.isAncestorOf(other) // Check if node is ancestor
    const isChild = node.isChildOf(other) // Check if node is child
    const isSibling = node.isSiblingOf(other) // Check if node is sibling
  }

  const depth = await node.getDepth() // Get depth of node
}
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
const node = await Category.find(1)

if (node) {
  // Where ancestor of
  const result = await Category.whereAncestorOf(node).exec()
  const result2 = await Category.whereAncestorOrSelf(node).exec()

  // Where descendant of
  const result3 = await Category.whereDescendantOf(node).exec()
  const result4 = await Category.whereDescendantOrSelf(node).exec()

  // Get nodes with depth
  const nodesWithDepth = await Category.withDepth().exec()
  nodesWithDepth.forEach((node) => {
    console.log(`Node ${node.name} is at depth ${node.$extras.depth}`)
  })
}
```

#### Deleting Nodes

```typescript
// Delete a node - automatically deletes all descendants
const node = await Category.find(1)
await node.delete() // This will also delete all child nodes

// The delete method is automatically overridden to perform cascade deletion
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
- `Category.withDepth(as?)` - Get nodes with depth information (depth stored in `$extras.depth`)
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
- `node.delete()` - Delete node and all its descendants (cascade delete)

### Collection Methods

- `collection.toTree()` - Convert collection to tree structure
- `collection.toFlatTree()` - Convert collection to flat tree

## Migration Helpers

- `addNestedSetColumns(table, lftColumn?, rgtColumn?, parentIdColumn?)` - Add nested set columns
- `dropNestedSetColumns(table, lftColumn?, rgtColumn?, parentIdColumn?)` - Drop nested set columns

## Important Notes

### Cascade Deletion

When you delete a node using `node.delete()`, all its descendants are automatically deleted as well. This is handled automatically by the package.

### Column Names

The package uses the following default column names:

- `_lft` - Left boundary
- `_rgt` - Right boundary
- `parent_id` - Parent node ID (in database)
- `parentId` - Parent node ID (in model, camelCase)

Make sure to specify `columnName` in your model decorators if your database uses different naming:

```typescript
@column({ columnName: 'parent_id' })
declare parentId: number | null

@column({ columnName: '_lft' })
declare _lft: number

@column({ columnName: '_rgt' })
declare _rgt: number
```

### SQLite Compatibility

When using SQLite, use `integer` instead of `unsignedInteger` in migrations:

```typescript
table.integer('_lft').nullable()
table.integer('_rgt').nullable()
table.integer('parent_id').nullable()
```

## TypeScript Support

### Type Inference

The package provides full TypeScript support with automatic type inference - **no configuration needed!**

1. **Static Methods**: The `applyNestedSet()` function returns a properly typed model. All static methods like `ancestorsOf()`, `descendantsOf()`, etc. automatically accept model instances without type assertions.

2. **Instance Methods**: Instance methods are automatically typed via module augmentation for `LucidRow` (included in the package). Methods like `children()`, `isRoot()`, etc. work without any type assertions.

3. **Query Results**: Methods like `find()`, `create()`, `first()`, etc. automatically return instances with nested set methods included in their types.

### Example with Full Type Safety

```typescript
import Category from '#models/category'

// Static methods work without type assertions - automatic type inference!
const node = await Category.find(1)
if (node) {
  // ✅ All methods work without type assertions
  const ancestors = await Category.ancestorsOf(node).exec()
  const descendants = await Category.descendantsOf(node).exec()
  const children = await node.children().exec()
  const isRoot = node.isRoot()
  const isLeaf = node.isLeaf()
}
```

### Key Benefits

- ✅ **Zero Configuration**: No need for declaration merging files or manual type assertions
- ✅ **Full Type Safety**: All methods are properly typed with correct return types
- ✅ **IntelliSense Support**: Full autocomplete for all nested set methods
- ✅ **Type Inference**: TypeScript automatically infers correct types for model instances

## Testing

The package includes comprehensive unit tests. Run them with:

```bash
npm test
```

For integration tests with real database operations use AdonisJS application.

## License

MIT
