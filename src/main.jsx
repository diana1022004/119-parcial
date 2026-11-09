import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ReportesProvider } from './estado/ReportesContext.jsx'
import './index.css'
import './estilos/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReportesProvider>
        <App />
      </ReportesProvider>
    </BrowserRouter>
  </React.StrictMode>
)
