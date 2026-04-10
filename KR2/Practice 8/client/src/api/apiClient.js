import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/tokenStorage";

const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = "Bearer " + accessToken;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
                    return Promise.reject(error);
        }

        if (error.response.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._isRetry) {
            clearTokens();
            return Promise.reject(error);
        }

        if (originalRequest.url.includes("/api/refresh")) {
            clearTokens();
            return Promise.reject(error);
        }

        originalRequest._isRetry = true;
        
        if (error.response.status === 401) {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                clearTokens();
                return Promise.reject(error);
            }

            try {
                const response = await axios.post("http://localhost:3000/api/auth/refresh", { refreshToken: refreshToken });
                setTokens(response.data.accessToken, response.data.refreshToken);
                return api(originalRequest);
            } catch (error) {
                clearTokens();
                return Promise.reject(error);
            }
        }
    }      
);

export default api;