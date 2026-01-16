import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export const registerService = {
  async Register(data: { 
    name: string; 
    email: string; 
    phone: string; 
    password: string;
    securityQuestion: string;
    securityAnswer: string;
  }) {
    // Send user details for registration
    const response = await api.post('api/auth/reg/', data, { withCredentials: true });
    return response.data;
  },
};
