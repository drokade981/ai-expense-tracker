# AI Expense Tracker

A small TypeScript expense-tracking assistant built with LangChain, LangGraph, Google Gemini, and SQLite. The assistant can add expenses, fetch expenses for a date range, and generate grouped expense summaries from a local SQLite database.

## Features

- Tracks expenses in a local `expenses.db` SQLite database.
- Uses a LangGraph agent loop with model and tool nodes.
- Provides tools for:
  - Adding an expense.
  - Fetching expenses by date range.
  - Generating grouped expense totals for chart-style output.
- Loads Google API configuration from `.env`.

## Tech Stack

- Node.js
- TypeScript
- LangChain
- LangGraph
- Google Gemini via `@langchain/google`
- SQLite via Node's built-in `node:sqlite`
- Zod for tool schemas

## Project Structure

```text
.
+-- db.ts              # SQLite database initialization
+-- index.ts           # LangGraph agent setup and example invocation
+-- tools.ts           # LangChain tools for expense operations
+-- expenses.db        # Local SQLite database
+-- package.json       # Project metadata and dependencies
`-- package-lock.json  # Locked dependency versions
```

## Prerequisites

- Node.js 24 or newer is recommended.
- A Google API key that can access the configured Gemini model.

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

The current code reads `GOOGLE_API_KEY` from the environment when creating the `ChatGoogle` model.

## Running the Project

Run the TypeScript entry file directly with Node:

```bash
node index.ts
```

The current `main()` function sends this sample prompt to the agent:

```text
can you visualize how much I have spend this year group by week
```

You can edit the prompt in `index.ts` to test other requests, such as:

```text
Add lunch expense for 250
```

```text
Show my expenses from 2026-01-01 to 2026-12-31
```

## Database

The database is initialized in `db.ts`. If the `expenses` table does not exist, it is created automatically:

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL
);
```

Expenses are stored with the current date in `YYYY-MM-DD` format.

## Available Tools

### `add_expense`

Adds an expense to the database.

Inputs:

- `title`: expense title
- `amount`: amount spent

### `get_expenses`

Fetches expenses between two dates.

Inputs:

- `from`: start date in `YYYY-MM-DD` format
- `to`: end date in `YYYY-MM-DD` format

### `generate_expense_chart`

Returns grouped expense totals for chart-style visualization.

Inputs:

- `from`: start date in `YYYY-MM-DD` format
- `to`: end date in `YYYY-MM-DD` format
- `groupBy`: one of `month`, `week`, or `date`

## Notes

- `npm test` is currently a placeholder and does not run tests.
- The repository currently has no `start` script, so use `node index.ts`.

