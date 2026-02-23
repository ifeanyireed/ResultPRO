export class VerifyEmailDTO {
  email!: string;
  otp!: string;
}

export class VerifyEmailResponseDTO {
  success: boolean = true;
  message: string = 'Email verified successfully.';
  data!: {
    schoolId: string;
    status: string;
    nextStep: string;
  };
}
