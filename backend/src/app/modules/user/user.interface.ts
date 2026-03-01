export interface ICreateUser {
  name: string;
  email: string;
  phone: string;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}
