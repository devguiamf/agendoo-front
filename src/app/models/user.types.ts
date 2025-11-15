export enum UserType {
  CLIENTE = 'cliente',
  PRESTADOR = 'prestador',
}

export interface UserOutput {
  id: string;
  name: string;
  email: string;
  type: UserType;
  cpf?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginOutput {
  accessToken: string;
  user: UserOutput;
}

export interface SignupOutput {
  accessToken: string;
  user: UserOutput;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  name: string;
  email: string;
  password: string;
  type: UserType;
  cpf?: string;
  phone?: string;
}


