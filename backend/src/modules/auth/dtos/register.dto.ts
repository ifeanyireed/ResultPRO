export class RegisterDTO {
  schoolName!: string;
  email!: string;
  phone!: string;
  fullAddress!: string;
  state!: string;
  lga!: string;
  password!: string;
}

export class RegisterResponseDTO {
  success: boolean = true;
  message: string = 'Registration successful. Please verify your email.';
  data!: {
    schoolId: string;
    email: string;
    verificationSent: boolean;
    expiresIn: number;
  };
}
