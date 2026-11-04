import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 테마별 색 (src/data/themes.ts 에서 자동으로 만들어져요)
import 'virtual:themes.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
