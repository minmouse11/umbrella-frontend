import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function LoginPage({ setUser }) {
    const [credentials, setCredentials] = useState({ id: "", pw: "" });
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            const response = await axios.post("/users/login", {
                studentId: credentials.id,
                password: credentials.pw,
            });

            // ✅✅✅ 이 부분이 핵심입니다! ✅✅✅
            // 서버가 보내준 데이터({ message, user })에서 user 객체만 추출합니다.
            const userData = response.data.user;

            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            navigate("/");

        } catch (err) {
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
                placeholder="학번"
                value={credentials.id}
                onChange={handleChange}
                required
                autoComplete="username"
            />
            <input
                type="password"
                name="pw"
                placeholder="비밀번호"
                value={credentials.pw}
                onChange={handleChange}
                required
                autoComplete="current-password"
            />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <button type="submit">로그인</button>
        </form>
    );
}