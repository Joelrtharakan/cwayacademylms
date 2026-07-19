import React from "react";

export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div 
        style={{ 
          width: 40, 
          height: 40, 
          border: `4px solid #8A9E8C`, 
          borderTopColor: '#C9973A', 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }} 
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
