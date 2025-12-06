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

applyNestedSet(Category)
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

// Get descendants
const electronicsTree = await Category.descendantsAndSelf(electronics.id).exec()
const tree = electronicsTree.toTree()

// Get ancestors
const ancestors = await Category.ancestorsOf(phones).exec()

// Check node properties
const isRoot = laptops.isRoot() // false
const isLeaf = phones.isLeaf() // true (if no children)
const isDescendant = phones.isDescendantOf(electronics) // true

// Get children
const children = await electronics.children().exec()

// Get parent
const parent = await phones.parent() // electronics

// Append node to parent
const newCategory = new Category()
newCategory.name = 'Tablets'
await newCategory.appendTo(electronics)

// Check tree consistency
const isBroken = await Category.isBroken()
if (isBroken) {
  const errors = await Category.countErrors()
  console.log('Tree errors:', errors)
  await Category.fixTree()
}
```

## Controller Example

```typescript
import { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'

export default class CategoriesController {
  async index({ response }: HttpContext) {
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
    const descendants = await category.descendants().exec()
    const tree = descendants.toTree()

    return response.json({
      category,
      tree,
    })
  }

  async destroy({ params, response }: HttpContext) {
    const category = await Category.findOrFail(params.id)

    // Deleting a node will also delete all descendants
    await category.delete()
    await Category.fixTree()

    return response.noContent()
  }
}
```
