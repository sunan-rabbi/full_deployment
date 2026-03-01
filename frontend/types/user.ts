export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ApiResponse<T> {
  statusCode: number,
  success: boolean,
  message: string,
  data: T
}
