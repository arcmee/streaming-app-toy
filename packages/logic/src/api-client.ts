import axios from 'axios';

// It's a good practice to use environment variables for the base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors for handling auth tokens here later
