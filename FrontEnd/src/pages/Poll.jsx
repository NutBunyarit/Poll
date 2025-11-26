import React from 'react';
import axios from 'axios'; // 1. นำเข้า axios
import '../style/Poll.css' 

const Poll = () => {

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // ดึงข้อมูลจากฟอร์ม
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    console.log("กำลังส่งข้อมูล...", data);

    try {
      // 2. ใช้ Axios ยิงไปที่ Backend
      const response = await axios.post('http://localhost:3000/api/polls', data);

      // Axios จะเช็ค status 200-299 ให้เอง ถ้าผ่านจะลงมาทำตรงนี้
      alert('บันทึกข้อมูลสำเร็จ! ✅');
      console.log('Server response:', response.data);
      
      event.target.reset(); // ล้างฟอร์ม

    } catch (error) {
      // 3. จัดการ Error (Axios จะเก็บรายละเอียดไว้ใน error.response)
      console.error('Error:', error);
      
      if (error.response) {
        // Server ตอบกลับมาแต่เป็น Error (เช่น 400, 500)
        alert(`เกิดข้อผิดพลาด: ${error.response.data.error || 'Server Error'}`);
      } else if (error.request) {
        // ส่ง Request ไปแล้วแต่ Server ไม่ตอบ (Server ดับ/เน็ตหลุด)
        alert('ไม่สามารถเชื่อมต่อ Server ได้ ⚠️');
      } else {
        // Error อื่นๆ
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>หน้า Poll</h1>
      <p>สร้างแบบสอบถามที่นี่</p>
      
      <div className="poll-container" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Create a Poll</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          
          {/* 1. Poll Title */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Poll Title:</label>
            <input 
              type="text" 
              name="pollTitle" /* ตรงกับ Backend */ 
              required 
              placeholder="หัวข้อแบบสอบถาม"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
            />
          </div>

          {/* 2. Description (Optional ตาม Model) */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
            <textarea 
              name="description" 
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
            />
          </div>

          {/* 3. Option A & Option B (Backend บังคับต้องมี) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Option A:</label>
                <input 
                  type="text" 
                  name="optionA" /* ตรงกับ Backend */
                  required 
                  placeholder="ตัวเลือกที่ 1"
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
                />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Option B:</label>
                <input 
                  type="text" 
                  name="optionB" /* ตรงกับ Backend */
                  required 
                  placeholder="ตัวเลือกที่ 2"
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
                />
            </div>
          </div>

          {/* 4. Start Date & End Date */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
                <input 
                  type="date" 
                  name="startDate" /* ตรงกับ Backend */
                  required 
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
                />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
                <input 
                  type="date" 
                  name="endDate" /* ตรงกับ Backend */
                  required 
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
                />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
                marginTop: '10px', 
                padding: '12px', 
                backgroundColor: '#7e3af2', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
            }}
          >
            Create Poll
          </button>

        </form>
      </div>
    </div>
  );
}

export default Poll;