import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

// @performance 移除 HTML 骨架 loading，避免 React hydration 后残留
const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const loadingEl = container.querySelector('#loading');
if (loadingEl) loadingEl.remove();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
