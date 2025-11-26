// App.jsx
import React from 'react'
import { BrowserRouter } from 'react-router-dom' // 1. import ตรงนี้
import MainLayout from './layout/MainLayout'

const App = () => {
  return (
    <BrowserRouter> {/* 2. ครอบ MainLayout ไว้ */}
      <MainLayout />
    </BrowserRouter>
  )
}

export default App