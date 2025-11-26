import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Vote = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // เก็บ State ว่าแต่ละ Poll เลือกตัวเลือกไหนอยู่: { "poll_id_1": "Option A", "poll_id_2": "Option B" }
  const [selectedOptions, setSelectedOptions] = useState({});

  // --- 1. ดึงข้อมูล Polls มาแสดง ---
  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/polls');
      // กรองเฉพาะ Poll ที่ยังไม่หมดอายุ (Optional: ถ้าต้องการ)
      setPolls(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setLoading(false);
    }
  };

  // --- 2. ฟังก์ชันจัดการเมื่อเลือก Radio Button ---
  const handleOptionChange = (pollId, optionName) => {
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: optionName // บันทึกว่า Poll ID นี้ เลือก Option นี้นะ
    }));
  };

  // --- 3. ฟังก์ชันกดโหวต (POST) ---
  const handleVote = async (pollId) => {
    const optionToVote = selectedOptions[pollId];

    if (!optionToVote) {
      alert("กรุณาเลือกตัวเลือกก่อนโหวตครับ ⚠️");
      return;
    }

    try {
      // ยิง API ไปที่ Backend endpoint: /api/polls/:id/vote
      await axios.post(`http://localhost:3000/api/polls/${pollId}/vote`, {
        selectedOption: optionToVote
      });

      alert("โหวตสำเร็จ! ขอบคุณครับ 🎉");
      
      // (Optional) ล้างค่าที่เลือก หรือ ดึงข้อมูลใหม่เพื่ออัปเดตคะแนน (ถ้าโชว์คะแนนในหน้านี้ด้วย)
      fetchPolls(); 
      
      // ล้าง Selection ของ Poll นั้น
      setSelectedOptions(prev => {
        const newState = { ...prev };
        delete newState[pollId];
        return newState;
      });

    } catch (err) {
      console.error("Vote Error:", err);
      alert("เกิดข้อผิดพลาดในการโหวต หรือหมดเวลาโหวตแล้ว");
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>กำลังโหลดแบบสอบถาม... ⏳</div>;

  return (
    <div style={{ padding: '30px', fontFamily: "'Roboto', sans-serif" }}>
      <h1 style={{ marginBottom: '20px' }}>Voting Page 🗳️</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {polls.map((poll) => (
          <div key={poll._id} style={styles.card}>
            
            {/* Header */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>{poll.pollTitle}</h3>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                {poll.description || "รายละเอียดการโหวต"}
              </p>
              <small style={{ color: '#888' }}>
                หมดเขต: {new Date(poll.endDate).toLocaleDateString('th-TH')}
              </small>
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* วนลูป Key ของ options (ชื่อตัวเลือก) มาสร้าง Radio Button */}
              {Object.keys(poll.options).map((optionName) => (
                <label 
                  key={optionName} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: selectedOptions[poll._id] === optionName ? '#f3f0ff' : 'white',
                    border: selectedOptions[poll._id] === optionName ? '1px solid #7e3af2' : '1px solid #ddd'
                  }}
                >
                  <input
                    type="radio"
                    name={`vote-${poll._id}`} // Group Radio ให้แยกกันแต่ละ Poll
                    value={optionName}
                    checked={selectedOptions[poll._id] === optionName}
                    onChange={() => handleOptionChange(poll._id, optionName)}
                    style={{ marginRight: '10px', accentColor: '#7e3af2' }}
                  />
                  <span style={{ fontWeight: 500 }}>{optionName}</span>
                </label>
              ))}
            </div>

            {/* Action Button */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => handleVote(poll._id)}
                style={{
                  backgroundColor: '#7e3af2',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  opacity: selectedOptions[poll._id] ? 1 : 0.6, // จางลงถ้ายังไม่เลือก
                  pointerEvents: selectedOptions[poll._id] ? 'auto' : 'none' // กดไม่ได้ถ้ายังไม่เลือก
                }}
              >
                ยืนยันการโหวต
              </button>
            </div>

          </div>
        ))}

        {polls.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888' }}>ขณะนี้ไม่มีการเปิดโหวตครับ</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    padding: '25px',
    maxWidth: '600px', // จำกัดความกว้างไม่ให้ยาวเกินไป
    width: '100%'
  }
};

export default Vote;