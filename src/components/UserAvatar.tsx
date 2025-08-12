import React, { useState } from "react";
import Avatar from "react-avatar";

interface UserAvatarProps {
  user: {
    name: string;
    avatar?: string | null;
  } | null;
  size?: number;
  style?: React.CSSProperties;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 32,
  style = {},
}) => {
  const [imageError, setImageError] = useState(false);

  if (!user) {
    return (
      <i
        className="fa-solid fa-user"
        style={{
          fontSize: `${size * 0.6}px`,
          color: "white",
          ...style,
        }}
      />
    );
  }

  // Nếu có avatar và avatar không rỗng và chưa có lỗi load
  if (user.avatar && user.avatar.trim() !== "" && !imageError) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          ...style,
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback sang react-avatar để tạo từ chữ cái đầu
  return (
    <Avatar
      name={user.name || "User"}
      size={`${size}px`}
      round={true}
      color="#ff9800"
      fgColor="white"
      style={{
        border: "2px solid white",
        fontSize: `${size * 0.4}px`,
        fontWeight: "bold",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        ...style,
      }}
      maxInitials={2}
    />
  );
};

export default UserAvatar;
