export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse{
   name:string,
   email:string,
   role:string,
   id:string

}