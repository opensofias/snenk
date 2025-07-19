# snenk Style Guide
This document is created primarily to guide code synthesis.

## Philosophy
The codebase follows a minimalist, functional approach with heavy use of modern JavaScript features. Code prioritizes conciseness and expressiveness over verbosity, often using creative syntax patterns.

## Naming Conventions

### Variables & Functions
- Use **camelCase** for all variables, functions, objects and properties
- Prefer short, descriptive names: `seg`, `idx`, `pos`, `acc`
- Use descriptive but concise names: `queueTip`, `deltaVec`, `absDelta`
- Single-letter variables only for screen dimensions: `x`, `y`

### Files
- Use **camelCase** for file names: `main.js`, `keyMap.js`, `vectorOps.js`

## Formatting & Spacing

### Indentation
- Use **tabs** for indentation (not spaces)

### Object Literals
- No spaces around colons in object literals: `face: [1, 0]`
- No trailing commas in arrays: `[1, 0]`
- Spaces after commas in arrays: `[1, 0]` not `[1,0]`

### Function Calls
- Spaces between function name and parentheses: `step (state)`
- Spaces in parameter lists: `(cur, pre)`
- Use destructuring liberally: `({key, repeat: keyRepeat, ctrlKey, shiftKey})`

### Operators
- Spaces around operators, incuding assignments: `x / y`, `pos < arena`, `alive &&=`
- Spaces around array access: `segments [0]`
- Method chaining on same line when short: `queueTip.sclMul (-1)`

## Code Structure

### Function Definitions
- Prefer arrow functions when possible: `const step = state => {`
- Single expression arrows without braces when possible

### Control Flow
- Use ternary operators for simple conditionals:
  ```javascript
  segments = (!alive) ? segments :
      eaten ? [target, ...segments] :
          [target, ...segments].slice(0, -1);
  ```
- Prefer logical operators over if statements: `alive &&= condition`
- Use creative loop patterns: `for ({} of boost)`

### Destructuring
- Heavy use of destructuring in parameters and assignments
- Nested destructuring when appropriate: `{snake: {segments, face, alive}}`
- Rest parameters for flexibility: `(...others)`

## Language Features

### Modern JavaScript
- Use ES6+ features extensively: arrow functions, destructuring, spread operator
- Prefer `const`/`let` over `var`
- Use template literals when needed
- Leverage array methods: `map`, `every`, `some`, `reduce`, `forEach`

### Functional Programming
- Immutable state updates with spread operator: `{...state, apple, win}`
- Pure functions where possible
- Avoid mutations, prefer returning new objects/arrays

### Creative Patterns
- Use assignment in conditionals: `win ||= (alert('woah, nice!') || true)`
- Logical assignment operators: `alive &&=`
- Empty object destructuring for counting: `for ({} of boost)`

## Comments & Documentation
- Minimal comments - code should be self-explanatory
- Use descriptive variable names instead of comments
- Playful language in user-facing text, all lowercase: `"js pls 😇"`, `"woah, nice!"`

## HTML & CSS

### HTML
- Omit quotes around simple attribute values: `lang=en`
- Use semantic structure
- Minimal, functional approach

### CSS
- Use modern units: `100vmin`
- Prefer shorthand properties
- Minimal styling, focus on functionality

## Error Handling
- Use logical operators for validation
- Prefer graceful degradation over explicit error handling
- Simple assertions with logical assignment

## Import/Export
- Use ES6 modules exclusively
- Named exports for utilities: `export const step`
- Default exports for main objects: `export const defaults`
- Import external libraries via CDN in main.js

## Performance Considerations
- Minimal DOM manipulation
- Efficient array operations using built-in methods
- Avoid unnecessary object creation
- Use canvas 2D context for efficient pixel-based rendering