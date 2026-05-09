import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
    throw new Error('VITE_API_URL is not set');
};

export const api = axios.create({
    baseURL: baseUrl ?? '',
    headers: {
        'Content-Type': 'application/json',
    }
})