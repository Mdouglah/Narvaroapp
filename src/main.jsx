import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import NorvayBar from './NorvayBar.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NorvayBar />
    <App />
  </React.StrictMode>
)
