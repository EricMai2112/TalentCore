const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCH01xXFgXaM1zdMGRMKuPdlSG4pKZ7c14';

export const firebaseAuthService = {
  sendVerificationCode: async (
    rawPhoneNumber: string,
  ): Promise<{ success: boolean; sessionInfo?: string; message?: string }> => {
    try {
      const clean = rawPhoneNumber.replace(/\D/g, '');
      const formatted = clean.startsWith('84')
        ? `+${clean}`
        : clean.startsWith('0')
        ? `+84${clean.slice(1)}`
        : `+84${clean}`;

      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: formatted,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data?.error?.message || 'Không thể gửi mã SMS xác thực Firebase',
        };
      }

      return {
        success: true,
        sessionInfo: data.sessionInfo,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Lỗi kết nối Firebase',
      };
    }
  },

  verifyCode: async (
    sessionInfo: string,
    code: string,
  ): Promise<{ success: boolean; idToken?: string; message?: string }> => {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionInfo,
            code: code.trim(),
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error?.message;
        if (errorMsg === 'INVALID_CODE') {
          return {
            success: false,
            message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại tin nhắn SMS.',
          };
        }
        if (errorMsg === 'SESSION_EXPIRED' || errorMsg === 'EXPIRED_OOB_REQ_CODE') {
          return {
            success: false,
            message: 'Mã OTP đã hết hạn. Vui lòng bấm gửi lại mã SMS.',
          };
        }
        return {
          success: false,
          message: errorMsg || 'Xác thực OTP Firebase thất bại',
        };
      }

      return {
        success: true,
        idToken: data.idToken,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Lỗi xác thực Firebase',
      };
    }
  },
};
