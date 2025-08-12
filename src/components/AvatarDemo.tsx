import React from "react";
import UserAvatar from "./UserAvatar";

const AvatarDemo: React.FC = () => {
  // Test cases
  const testUsers = [
    null, // No user
    { name: "John Doe", avatar: null }, // No avatar
    { name: "Jane Smith", avatar: "" }, // Empty avatar
    { name: "Bob Wilson", avatar: "https://invalid-url.jpg" }, // Invalid avatar
    { name: "Alice Johnson", avatar: "https://picsum.photos/100/100?random=1" }, // Valid avatar
    { name: "Charlie Brown", avatar: "https://i.pravatar.cc/150?img=8" }, // Valid avatar 2
  ];

  return (
    <div style={{ padding: "20px", background: "#000", minHeight: "100vh" }}>
      <h2 style={{ color: "white", marginBottom: "20px" }}>Avatar Demo</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {testUsers.map((user, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <UserAvatar user={user} size={48} />
            <p style={{ color: "white", marginTop: "8px", fontSize: "12px" }}>
              {user ? user.name : "No User"}
            </p>
            <p style={{ color: "#999", fontSize: "10px" }}>
              {user?.avatar ? "With Avatar" : "No Avatar"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarDemo;
