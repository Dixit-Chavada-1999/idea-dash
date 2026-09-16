import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

/**
 * Reuse the same root across a dev HMR update instead of creating a second
 * one on top of it.
 *
 * When Vite can't hot-swap a changed module cleanly (non-component files
 * like `basis/context.ts` or `api/dashboard.ts` are common triggers), it
 * falls back to re-running this file. A bare `createRoot(...).render(...)`
 * then calls `createRoot` on a container React already owns: the old tree is
 * never unmounted, so its DOM survives — frozen mid-fetch — with a second,
 * live tree rendered on top of it. `import.meta.hot.data` survives across
 * updates, so stashing the root there and reusing it keeps this file
 * idempotent no matter how many times HMR re-runs it.
 */
const container = document.getElementById('root')!
const hot = import.meta.hot
const root: Root = (hot?.data.root as Root | undefined) ?? createRoot(container)
if (hot) hot.data.root = root

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
