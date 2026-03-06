export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests mỗi windowMs
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau',
  standardHeaders: true,
  legacyHeaders: false,
};

export const strictRateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5, // Giới hạn cho các endpoint nhạy cảm (login, register)
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
};
