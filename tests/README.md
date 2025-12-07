# Tests

This directory contains unit tests for the nested set package.

## Running Tests

```bash
npm test
```

Or for quick test run:

```bash
npm run quick:test
```

## Test Structure

- **`nested_set_trait.spec.ts`** - Tests for instance methods (isRoot, isLeaf, isDescendantOf, etc.)
- **`query_builder.spec.ts`** - Tests for query builder static methods (roots, ancestorsOf, descendantsOf, etc.)
- **`static_methods.spec.ts`** - Tests for static configuration methods (getLftName, getRgtName, etc.)
- **`tree_builder.spec.ts`** - Tests for tree building functions (toTree, toFlatTree)
- **`migration_helper.spec.ts`** - Tests for migration helper functions

## Test Coverage

The tests cover:

### ✅ Instance Methods (17 tests)

- `isRoot()` - checks if node is root (including edge cases with undefined/null parentId)
- `isLeaf()` - checks if node is leaf
- `isDescendantOf()` - checks descendant relationship
- `isAncestorOf()` - checks ancestor relationship
- `isChildOf()` - checks parent-child relationship
- `isSiblingOf()` - checks sibling relationship (including edge cases)
- Query methods existence: `siblings()`, `ancestors()`, `descendants()`, `children()`

### ✅ Query Builder Methods (12 tests)

- `roots()` - get all root nodes
- `ancestorsOf()` - get ancestors of a node
- `ancestorsAndSelf()` - get ancestors including self
- `descendantsOf()` - get descendants of a node
- `descendantsAndSelf()` - get descendants including self
- `siblingsOf()` - get siblings of a node
- `siblingsAndSelf()` - get siblings including self
- `whereAncestorOf()` - where ancestor constraint
- `whereAncestorOrSelf()` - where ancestor or self constraint
- `whereDescendantOf()` - where descendant constraint
- `whereDescendantOrSelf()` - where descendant or self constraint
- `withDepth()` - get nodes with depth information

> **Note:** These tests verify that methods exist on the model. For actual query logic testing, see integration tests in the AdonisJS application.

### ✅ Static Methods (4 tests)

- `getLftName()` - returns default left column name (`'_lft'`)
- `getRgtName()` - returns default right column name (`'_rgt'`)
- `getParentIdName()` - returns default parent ID column name (`'parentId'`)
- `getScopeAttributes()` - returns empty array by default

### ✅ Tree Building (11 tests)

- `toTree()` - converts flat collection to tree structure
  - Basic tree conversion
  - Empty collection handling
  - Single root node
  - Multiple levels
  - `rootId` parameter for orphaned nodes
  - Parent reference preservation
- `toFlatTree()` - converts to flat tree structure (children immediately after parent)
  - Basic flat tree conversion
  - Empty collection handling
  - `rootId` parameter
- `extendModelWithTreeMethods()` - verifies methods are added to model prototype

### ✅ Migration Helpers (3 tests)

- `addNestedSetColumns()` - adds nested set columns with correct names and indexes
- `addNestedSetColumns()` with custom column names
- `dropNestedSetColumns()` - drops nested set columns and indexes

## Test Helpers

- **`helpers/setup_simple.ts`** - Simple test model setup for unit tests

## Test Statistics

- **Total tests:** 47
- **Test files:** 5
- **Coverage:** ~61% statements, ~80% branches

## Note

These are unit tests that don't require a database connection. They test the logic and structure of the nested set methods using mock objects.

For integration tests with actual database operations we use AdonisJS application (not included), which include:

- Real database operations
- Tree validation (`isBroken`, `countErrors`, `fixTree`)
- Query builder integration tests
- Instance methods integration tests
- Tree building integration tests
