# fork todo

A todo app where tasks can be forked as tangents — capture cross-context thoughts without leaving your current focus.

## Stack

React + Vite + TypeScript. localStorage for persistence.

## Setup

```sh
npm install
npm run dev
```

## Fork concept

Any task can be forked into a tangent — a related task that lives independently from its parent. The parent doesn't need the fork completed, and the fork doesn't block the parent. It's just a breadcrumb trail for when an idea strikes while you're in the middle of something else.

Tasks are organized into four contexts: **work**, **personal**, **club**, **gym**.

## Views

- **Dashboard** — 4-column grid of root tasks by context
- **Focus** — inspect a task, see its ancestry, fork tangents
- **Tree** — visual fork hierarchy
- **Inbox** — search/filter all tasks across contexts and statuses
