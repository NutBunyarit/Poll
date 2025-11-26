// Contents.jsx
import React from 'react'
import AppRoutes from '../../AppRoutes' // ปรับ path ให้ตรงกับที่เก็บไฟล์ AppRoutes.jsx ของคุณ

const Contents = () => {
  return (
    <section id='contents'>
        {/* เรียกใช้ AppRoutes ตรงนี้ เพื่อให้เนื้อหาเปลี่ยนไปตาม URL */}
        <AppRoutes /> 
    </section>
  )
}

export default Contents