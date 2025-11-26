import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State สำหรับเก็บว่า Poll ไหนกำลังเปิดดูคะแนนอยู่ (เก็บเป็น ID)
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/polls');
      setPolls(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError("ไม่สามารถดึงข้อมูลได้");
      setLoading(false);
    }
  };

  // ฟังก์ชันสลับการเปิด/ปิด Dropdown
  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null); // ถ้าเปิดอยู่แล้ว ให้ปิด
    } else {
      setExpandedId(id); // ถ้าปิดอยู่ ให้เปิดตัวนี้
    }
  };

  // ฟังก์ชันลบ Poll (แถมให้ตามปุ่มในรูป)
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // หยุดไม่ให้คลิกแล้วไปเปิด Dropdown
    if (!window.confirm("ยืนยันที่จะลบ Poll นี้?")) return;

    try {
      // (ต้องมี API Delete รองรับที่ Backend: app.delete('/api/polls/:id', ...))
      // await axios.delete(`http://localhost:3000/api/polls/${id}`);
      await axios.delete(`http://localhost:3000/api/polls/${id}`);
      // ลบจากหน้าจอ (Simulate)
      setPolls(polls.filter(poll => poll._id !== id));
      alert("ลบสำเร็จ (Demo UI Only)"); 
    } catch (err) {
        console.error(err);
      alert("ลบไม่สำเร็จ");
    }
  };

  // ฟังก์ชันเช็คสถานะ Open/Closed
  const getStatus = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const isOpen = now < end;
    return {
      text: isOpen ? "Open" : "Closed",
      color: isOpen ? "#10b981" : "#6b7280", // เขียว / เทา
      bgColor: isOpen ? "#d1fae5" : "#f3f4f6" // เขียวอ่อน / เทาอ่อน
    };
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '40px', fontFamily: "'Roboto', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      <h1 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>Dashboard</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {polls.map((poll) => {
          const status = getStatus(poll.endDate);
          const isExpanded = expandedId === poll._id;

          return (
            <div 
              key={poll._id} 
              style={styles.cardContainer}
            >
              {/* --- ส่วนหัว Card (คลิกเพื่อเปิด Dropdown) --- */}
              <div 
                style={styles.cardHeader} 
                onClick={() => toggleExpand(poll._id)}
              >
                {/* ฝั่งซ้าย: ข้อมูล */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  
                  {/* แถวชื่อ + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>
                      {poll.pollTitle}
                    </span>
                    
                    {/* Status Badge */}
                    <div style={{ 
                      backgroundColor: status.bgColor, 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }}></div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: status.color }}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {/* แถววันที่ */}
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                    {status.text === 'Open' 
                      ? `Closes on ${new Date(poll.endDate).toLocaleDateString('en-GB')}`
                      : `Closed on ${new Date(poll.endDate).toLocaleDateString('en-GB')}`
                    }
                  </span>
                </div>

                {/* ฝั่งขวา: ปุ่ม Delete */}
                <button 
                  style={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, poll._id)}
                >
                  delete
                </button>
              </div>

              {/* --- ส่วนเนื้อหา Dropdown (คะแนนโหวต) --- */}
              {isExpanded && (
                <div style={styles.dropdownContent}>
                   <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '0 0 15px 0' }}/>
                   
                   <p style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
                     {poll.description || "รายละเอียดผลโหวต:"}
                   </p>

                   {/* แสดง Progress Bar คะแนน */}
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {Object.entries(poll.options).map(([optionName, score]) => (
                        <div key={optionName}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                            <span>{optionName}</span>
                            <span style={{ fontWeight: 'bold' }}>{score} pts</span>
                          </div>
                          {/* Progress Bar Background */}
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                             {/* Progress Bar Fill (คำนวณ % คร่าวๆ) */}
                             <div style={{ 
                               width: `${Math.min(score * 10, 100)}%`, // สมมติว่าเต็ม 10 คะแนนเพื่อให้เห็นภาพ (ของจริงต้องคำนวณ Total)
                               height: '100%', 
                               backgroundColor: '#7e3af2',
                               borderRadius: '4px'
                             }}></div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

            </div>
          );
        })}

        {polls.length === 0 && <p style={{ textAlign: 'center', color: '#aaa' }}>No polls available</p>}

      </div>
    </div>
  );
};

// --- Styles ---
const styles = {
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: '16px', // มุมโค้งมนเหมือนในรูป
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    overflow: 'hidden', // เพื่อให้ Dropdown ไม่ล้น
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    padding: '20px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '5px 15px',
    fontSize: '13px',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  dropdownContent: {
    backgroundColor: '#fcfcfc',
    padding: '0 25px 25px 25px',
    animation: 'fadeIn 0.3s ease'
  }
};

export default Dashboard;