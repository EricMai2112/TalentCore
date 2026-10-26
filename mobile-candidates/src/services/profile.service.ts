import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import { CandidateProfile } from '../types/profile.types';

const TOKEN_KEY = '@talentcore_candidate_token';

export const profileService = {
  listProfiles: async (): Promise<CandidateProfile[]> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profiles`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải danh sách hồ sơ');
    }
    return data.data || data;
  },

  getProfileById: async (profileId: string): Promise<CandidateProfile> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profiles/${profileId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy thông tin hồ sơ');
    }
    return data.data || data;
  },

  createProfile: async (
    profileName: string,
    cloneFromCandidateId?: string,
  ): Promise<CandidateProfile> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        profileName,
        ...(cloneFromCandidateId ? { cloneFromCandidateId } : {}),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Tạo hồ sơ thất bại');
    }
    return data.data || data;
  },

  updateProfileById: async (
    profileId: string,
    payload: Partial<CandidateProfile>,
  ): Promise<CandidateProfile> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profiles/${profileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Cập nhật hồ sơ thất bại');
    }
    return data.data || data;
  },

  setDefault: async (profileId: string): Promise<void> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profiles/${profileId}/set-default`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Không thể đặt hồ sơ mặc định');
    }
  },

  deleteProfile: async (profileId: string): Promise<void> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profiles/${profileId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Xóa hồ sơ thất bại');
    }
  },

  getMyProfile: async (): Promise<CandidateProfile> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profile`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy thông tin hồ sơ');
    }
    return data.data || data;
  },

  updateProfile: async (payload: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Cập nhật hồ sơ thất bại');
    }
    return data.data || data;
  },

  parseCvWithAi: async (fileUri: string, fileName: string, mimeType?: string, rawFile?: any): Promise<any> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const formData = new FormData();

    if (rawFile && typeof rawFile === 'object' && ('size' in rawFile || 'arrayBuffer' in rawFile)) {
      formData.append('cv', rawFile, fileName);
    } else {
      try {
        const fileResponse = await fetch(fileUri);
        const blob = await fileResponse.blob();
        formData.append('cv', blob, fileName);
      } catch {
        formData.append('cv', {
          uri: fileUri,
          name: fileName,
          type: mimeType || 'application/pdf',
        } as any);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/candidates/parse-cv`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Phân tích CV thất bại');
      }
      return data.data || data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Thời gian phân tích CV quá lâu, vui lòng thử lại.');
      }
      throw error;
    }
  },
};
