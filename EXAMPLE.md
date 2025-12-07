# Example Usage

This document shows how to use the nested set package in your AdonisJS application.

## Setup

1. Install the package (when published):

```bash
npm install adonisjs-nested-set
```

2. Or use it locally by linking:

```bash
cd adonis-nested-package
npm link

cd ../adonis
npm link adonisjs-nested-set
```

## Example: Category Model

### Migration

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'
import { addNestedSetColumns } from 'adonisjs-nested-set'

export default class extends BaseSchema {
  protected tableName = 'categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      addNestedSetColumns(table)
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### Model

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

### Usage Examples

```typescript
import Category from '#models/category'

// Create root nodes
const electronics = await Category.create({ name: 'Electronics' })
const clothing = await Category.create({ name: 'Clothing' })
await Category.fixTree()

// Create child nodes
const laptops = await Category.create({
  name: 'Laptops',
  parentId: electronics.id,
})
const phones = await Category.create({
  name: 'Phones',
  parentId: electronics.id,
})
await Category.fixTree()

// Get all roots
const roots = await Category.roots().exec()

// Get descendants - all methods work without type assertions!
const electronicsTree = await Category.descendantsAndSelf(electronics).exec()
const tree = electronicsTree.toTree()

// Get ancestors - accepts model instance directly
const ancestors = await Category.ancestorsOf(phones).exec()

// Get ancestors and self
const ancestorsAndSelf = await Category.ancestorsAndSelf(phones).exec()

// Get siblings
const siblings = await Category.siblingsOf(laptops).exec()

// Query constraints
const result = await Category.whereAncestorOf(phones).exec()
const result2 = await Category.whereAncestorOrSelf(phones).exec()
const result3 = await Category.whereDescendantOf(electronics).exec()
const result4 = await Category.whereDescendantOrSelf(electronics).exec()

// Get nodes with depth
const nodesWithDepth = await Category.withDepth().exec()
nodesWithDepth.forEach((node) => {
  console.log(`Node ${node.name} is at depth ${node.$extras.depth}`)
})

// Check node properties - all methods are automatically typed!
const isRoot = laptops.isRoot() // false
const isLeaf = phones.isLeaf() // true (if no children)
const isDescendant = phones.isDescendantOf(electronics) // true
const isAncestor = electronics.isAncestorOf(phones) // true
const isChild = phones.isChildOf(electronics) // true
const isSibling = laptops.isSiblingOf(phones) // true

// Get children
const children = await electronics.children().exec()

// Get parent
const parent = await phones.parent() // electronics

// Get depth
const depth = await phones.getDepth() // 1

// Append node to parent - works with ID or object
const newCategory = new Category()
newCategory.name = 'Tablets'
await newCategory.appendTo(electronics) // or await newCategory.appendTo(electronics.id)

// Make node a root
await newCategory.makeRoot()

// Move node to different parent
await newCategory.appendTo(clothing)

// Check tree consistency
const isBroken = await Category.isBroken()
if (isBroken) {
  const errors = await Category.countErrors()
  console.log('Tree errors:', errors)
  // Returns: { oddness, duplicates, wrong_parent, missing_parent }
  await Category.fixTree()
}

// Convert collections to tree structure
const allCategories = await Category.all()
const fullTree = allCategories.toTree() // Convert all nodes to tree
const flatTree = allCategories.toFlatTree() // Convert to flat tree (children after parent)

// Get subtree for specific root
const electronicsSubtree = allCategories.toTree(electronics.id)
const electronicsFlatSubtree = allCategories.toFlatTree(electronics.id)
```

## Controller Example

```typescript
import { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'

export default class CategoriesController {
  async index({ response }: HttpContext) {
    // Get all categories and convert to tree structure
    // toTree() and toFlatTree() are automatically available on results
    const categories = await Category.all()
    const tree = categories.toTree()
    return response.json(tree)
  }

  async store({ request, response }: HttpContext) {
    const { name, parentId } = request.only(['name', 'parentId'])

    const category = await Category.create({ name, parentId })
    await Category.fixTree()

    return response.json(category)
  }

  async show({ params, response }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    
    // Get descendants and convert to tree
    const descendants = await category.descendants().exec()
    const tree = descendants.toTree()

    // Get ancestors
    const ancestors = await category.ancestors().exec()

    // Get siblings
    const siblings = await category.siblings().exec()

    // Get children
    const children = await category.children().exec()

    return response.json({
      category,
      tree,
      ancestors,
      siblings,
      children,
    })
  }

  async update({ params, request, response }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    const { name, parentId } = request.only(['name', 'parentId'])

    category.name = name
    
    // Move to different parent if parentId changed
    if (parentId !== category.parentId) {
      if (parentId === null) {
        await category.makeRoot()
      } else {
        await category.appendTo(parentId)
      }
    } else {
      await category.save()
    }

    await Category.fixTree()
    return response.json(category)
  }

  async destroy({ params, response }: HttpContext) {
    const category = await Category.findOrFail(params.id)

    // Deleting a node will automatically delete all descendants
    // No need to manually delete children
    await category.delete()
    await Category.fixTree()

    return response.noContent()
  }

  async tree({ response }: HttpContext) {
    // Get tree structure for all categories
    const categories = await Category.all()
    const tree = categories.toTree()
    
    // Or get flat tree (children immediately after parent)
    const flatTree = categories.toFlatTree()
    
    return response.json({ tree, flatTree })
  }

  async subtree({ params, response }: HttpContext) {
    const rootCategory = await Category.findOrFail(params.id)
    
    // Get subtree starting from specific root
    const allCategories = await Category.all()
    const subtree = allCategories.toTree(rootCategory.id)
    const flatSubtree = allCategories.toFlatTree(rootCategory.id)
    
    return response.json({ subtree, flatSubtree })
  }
}
```

## Advanced Examples

### Working with Multiple Roots

```typescript
import Category from '#models/category'

// Create multiple root nodes
const root1 = await Category.create({ name: 'Root 1' })
const root2 = await Category.create({ name: 'Root 2' })
await Category.fixTree()

// Create children for each root
const child1 = await Category.create({ name: 'Child 1', parentId: root1.id })
const child2 = await Category.create({ name: 'Child 2', parentId: root2.id })
await Category.fixTree()

// Get all roots
const roots = await Category.roots().exec()

// Get tree for specific root
const allCategories = await Category.all()
const root1Tree = allCategories.toTree(root1.id)
const root2Tree = allCategories.toTree(root2.id)
```

### Query Builder Chaining

```typescript
import Category from '#models/category'

const node = await Category.find(1)

if (node) {
  // Chain query builder methods
  const result = await Category
    .whereAncestorOf(node)
    .where('name', 'like', '%Electronics%')
    .orderBy('name', 'asc')
    .exec()
  
  // All query results have toTree() and toFlatTree() methods
  const tree = result.toTree()
}
```

### Tree Validation

```typescript
import Category from '#models/category'

// Check if tree is broken
const isBroken = await Category.isBroken()

if (isBroken) {
  // Get detailed error information
  const errors = await Category.countErrors()
  console.log('Oddness:', errors.oddness) // Nodes where lft >= rgt
  console.log('Duplicates:', errors.duplicates) // Duplicate lft/rgt values
  console.log('Wrong parent:', errors.wrong_parent) // Invalid parent relationships
  console.log('Missing parent:', errors.missing_parent) // Parent doesn't exist
  
  // Fix the tree
  await Category.fixTree()
}
```

### Working with Depth

```typescript
import Category from '#models/category'

// Get all nodes with depth information
const nodesWithDepth = await Category.withDepth().exec()

nodesWithDepth.forEach((node) => {
  console.log(`${node.name} is at depth ${node.$extras.depth}`)
})

// Use custom alias for depth
const nodesWithLevel = await Category.withDepth('level').exec()
nodesWithLevel.forEach((node) => {
  console.log(`${node.name} is at level ${node.$extras.level}`)
})

// Get depth for specific node
const node = await Category.find(1)
if (node) {
  const depth = await node.getDepth()
  console.log(`Node depth: ${depth}`)
}
```

### Moving Nodes

```typescript
import Category from '#models/category'

const node = await Category.find(1)
const newParent = await Category.find(2)

if (node && newParent) {
  // Move node to different parent
  await node.appendTo(newParent)
  await Category.fixTree()
  
  // Or make it a root
  await node.makeRoot()
  await Category.fixTree()
}
```

### Deleting Nodes

```typescript
import Category from '#models/category'

const node = await Category.find(1)

if (node) {
  // Delete node and all its descendants automatically
  // No need to manually delete children
  await node.delete()
  await Category.fixTree()
}
```
