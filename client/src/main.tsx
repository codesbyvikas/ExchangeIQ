import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import { Buffer } from 'buffer';

// Set up global polyfills for Node.js modules
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = { 
  env: {},
  nextTick: (fn: Function) => setTimeout(fn, 0),
  browser: true,
  version: '',
  versions: { node: '' }
};

// Also set on window for compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = (globalThis as any).process;
  (window as any).global = globalThis;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)