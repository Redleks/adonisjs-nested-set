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
- **`static_methods.spec.ts`** - Tests for static methods (getLftName, getRgtName, etc.)
- **`tree_builder.spec.ts`** - Tests for tree building functions (toTree, toFlatTree)
- **`migration_helper.spec.ts`** - Tests for migration helper functions

## Test Coverage

The tests cover:

✅ Instance methods:

- `isRoot()`, `isLeaf()`
- `isDescendantOf()`, `isAncestorOf()`
- `isChildOf()`, `isSiblingOf()`

✅ Static methods:

- `getLftName()`, `getRgtName()`, `getParentIdName()`
- `getScopeAttributes()`

✅ Tree building:

- `toTree()` - converts flat collection to tree
- `toFlatTree()` - converts to flat tree structure

✅ Migration helpers:

- `addNestedSetColumns()` - adds nested set columns
- `dropNestedSetColumns()` - drops nested set columns

## Note

These are unit tests that don't require a database connection. For integration tests with actual database operations, you should test the package in a real AdonisJS application.
