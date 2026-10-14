# DBML Studio

Next.js + Node.js project providing a basic parser from **DBML** (Database Markup Language) syntax to **JSON**.

## Structure

```
src/
  app/                    Next.js app router (UI + API routes)
    api/parse-dbml/       POST endpoint: parse DBML input
  lib/dbml/               Core DBML parser module
    tokenizer.ts           Lexer (comments, tokens)
    parser.ts             Recursive-descent parser
    types.ts              TypeScript types for the JSON output
    index.ts              Public exports
scripts/
  test-parse.ts           Example usage of the parser
```

## Usage

### Parser module

```ts
import { parseDBML } from "@/lib/dbml";

const result = parseDBML(`
Table users {
  id integer [pk, increment]
  username varchar(255) [not null, unique]
}
`);
console.log(JSON.stringify(result, null, 2));
```

### Development

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```

### Parse API

`POST /api/parse-dbml` with JSON body `{ "input": "<dbml>" }`.

## Supported (basic)

- `Table` (including schema-qualified and quoted names)
- Columns with types (`varchar(255)`, etc.) and attributes (`pk`, `not null`, `unique`, `increment`, `default`, `note`, `ref`)
- Inline and standalone `Ref`
- `Enum`
- `TableGroup`
- Comments (`//`, `/* */`)

JSON output includes tables, columns, refs, enums, table groups, and parse errors.
