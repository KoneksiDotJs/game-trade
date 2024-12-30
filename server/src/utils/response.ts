export const sendSuccess = (data: any, message = "Success") => ({
  success: true,
  message,
  data,
});

export const sendError = (message: string) => ({
  success: false,
  message,
});
