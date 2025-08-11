# Auth Debugger Controls

## Cách sử dụng Auth Debugger

Auth Debugger được tích hợp để giúp debug authentication trong quá trình development. Nó chỉ hiển thị trong development mode và có thể được ẩn/hiện theo 2 cách:

## Cách 1: Keyboard Shortcut (Khuyến nghị!)

### Toggle Auth Debugger:

```
Ctrl + Shift + D
```

- Ấn tổ hợp phím này để ẩn/hiện Auth Debugger
- Hoạt động trong mọi tình huống và rất nhanh
- Khi ẩn sẽ ẩn hoàn toàn khỏi UI

## Cách 2: Sử dụng localStorage

Trong Console (F12 → Console), bạn có thể set trực tiếp:

### Ẩn hoàn toàn:

```javascript
localStorage.setItem("authDebugger", "false");
location.reload();
```

### Hiện lại:

```javascript
localStorage.setItem("authDebugger", "true");
location.reload();
```

## Features của Auth Debugger

- **Real-time Auth Status**: Hiển thị trạng thái đăng nhập, user info, loading state
- **Cookie Debugging**: Check và clear auth cookies
- **Manual Reset**: Reset auth state khi cần thiết
- **Persistent State**: Ghi nhớ trạng thái ẩn/hiện qua các lần reload
- **Hoàn toàn ẩn**: Khi tắt sẽ không có gì hiển thị trên UI

## Production Mode

Auth Debugger **KHÔNG** hiển thị trong production mode (`NODE_ENV=production`), chỉ có trong development mode để đảm bảo security.

## Cách bật lại khi đã ẩn

Nếu bạn đã ẩn Auth Debugger và muốn bật lại:

1. **Keyboard**: `Ctrl + Shift + D` (cách nhanh nhất)
2. **Console**: `localStorage.setItem("authDebugger", "true"); location.reload()`

---

Tạo bởi: Auth Cookie Fix System  
Date: August 11, 2025
