import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // 1. 우리가 만든 axios 인스턴스를 가져옵니다.

export default function LoginPage({ setUser }) {
    // 2. 아이디와 비밀번호를 하나의 객체로 관리하면 더 깔끔합니다.
    const [credentials, setCredentials] = useState({ id: "", pw: "" });
    const [errorMessage, setErrorMessage] = useState(""); // 3. 에러 메시지를 표시할 상태
    const navigate = useNavigate();

    // input 값이 바뀔 때마다 credentials 상태를 업데이트하는 함수
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    // 4. async/await를 사용해 비동기 로그인 요청을 처리합니다.
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // 로그인 시도 시 이전 에러 메시지를 초기화합니다.

        try {
            // 5. 백엔드에 로그인 요청을 보냅니다. (백엔드 user 라우터에 /login 경로가 필요합니다)
            const response = await axios.post("/users/login", {
                studentId: credentials.id, // 백엔드 모델에 맞는 필드 이름 사용 (studentId)
                password: credentials.pw,
            });

            // 6. 로그인 성공 시 서버로부터 받은 사용자 정보를 저장합니다.
            const userData = response.data;
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData); // App.js의 user 상태를 업데이트합니다.

            navigate("/"); // 로그인 성공 후 홈으로 이동

        } catch (err) {
            // 7. 로그인 실패 시 서버가 보내준 에러 메시지를 표시합니다.
            console.error("Login failed:", err);
            setErrorMessage(err.response?.data?.message || "로그인에 실패했습니다.");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>로그인</h2>
            <input
                type="text"
                name="id"
                placeholder="학번" // 사용자가 알기 쉽게 '아이디' -> '학번'
                value={credentials.id}
                onChange={handleChange}
                required
                autoComplete="username" // 8. 콘솔 경고 해결
            />
            <input
                type="password"
                name="pw"
                placeholder="비밀번호"
                value={credentials.pw}
                onChange={handleChange}
                required
                autoComplete="current-password" // 8. 콘솔 경고 해결
            />
            {/* 에러 메시지가 있을 경우에만 화면에 표시 */}
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <button type="submit">로그인</button>
        </form>
    );
}