export class ResendOtpDTO {
  email!: string;
}

export class ResendOtpResponseDTO {
  success: boolean = true;
  message: string = 'Verification code sent to your email.';
  data!: {
    expiresIn: number;
  };
}
