import axios from "axios";

// 환경 변수에서 API 서버 주소 가져오기 (Vite → CRA 순서로 우선 적용)
const API =
  import.meta?.env?.VITE_API_URL || // Vite 환경
  process.env.REACT_APP_API_URL ||  // CRA 환경
  "http://localhost:5000";          // 기본값 (백엔드 개발 서버)

const api = axios.create({
  baseURL: `${API}/api`, // "/api" 포함 주의
  withCredentials: false, // 쿠키 인증이 필요하면 true
  headers: {
    "Content-Type": "application/json", // JSON 형식 명시
  },
});

export default api;
