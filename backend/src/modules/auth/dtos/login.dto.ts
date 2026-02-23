export class LoginDTO {
  email!: string;
  password!: string;
}

export class LoginResponseDTO {
  success: boolean = true;
  data!: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      schoolId: string;
      email: string;
      fullName?: string;
      role: string;
    };
    school: {
      id: string;
      name: string;
      onboardingStatus: string;
      status: string;
    };
  };
}
