export const generateRoomUserId = (userId: number) => {
  return `userId-${userId}`;
};

export const generateRoomProductId = (productId: number) => {
  return `productId-${productId}`;
};

export const generateRoomPaymentId = (paymentId: number) => {
  return `paymentId-${paymentId}`;
};

export const getSocketConfig = () => ({
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
  timeout: 20000,
});
