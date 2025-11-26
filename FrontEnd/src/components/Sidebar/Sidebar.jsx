import React from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom"; 

const Sidebar = () => {
  // ลบ useState ออก เพราะ NavLink จะเช็ค active ให้เองอัตโนมัติครับ

  const menuItems = [
    {
      path: "/dashboard", // เปลี่ยน id เป็น path เพื่อระบุลิงค์ปลายทาง
      label: "Dashboard",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      path: "/poll",
      label: "Poll",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      path: "/vote",
      label: "Voting",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <section id="side">
      {/* --- ส่วนที่ 1: User Profile Card --- */}
      <div className="user-card">
        <div className="avatar-wrapper">
          <img src="https://placehold.co/100x100" alt="Gavano" />
        </div>
        <div className="user-info">
          <h4 className="user-name">Gavano</h4>
          <p className="user-role">HR Manager</p>
        </div>
        <div className="menu-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </div>
      </div>

      {/* --- ส่วนที่ 2: Menu Items (แก้ไขใหม่) --- */}
      <div className="side-menu-container">
        {menuItems.map((item) => (
          // ใช้ NavLink แทน div เพื่อให้ Link กับ URL
          <NavLink
            key={item.label}
            to={item.path}
            style={{ textDecoration: 'none' }} 
            // NavLink จะส่งค่า isActive มาให้ เราใช้เช็คเพื่อเปลี่ยน Class CSS
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            {/* ฟังก์ชัน Render Prop เพื่อเช็ค isActive สำหรับแสดงขีดสีม่วง */}
            {({ isActive }) => (
              <>
                {isActive && <div className="active-indicator"></div>}
                <div className="nav-icon">{item.icon}</div>
                <div className="nav-text">{item.label}</div>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </section>
  );
};

export default Sidebar;