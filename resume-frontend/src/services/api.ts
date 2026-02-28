import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:3000/api/v1';
        }
        return 'http://localhost:3000/api/v1';
    }
    return 'https://api.yourdomain.com/api/v1';
};

export const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        // According to our specs, the module trusts x-user-id header
        'x-user-id': 'expo-mobile-demo-user'
    }
});
