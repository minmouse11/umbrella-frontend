import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        // 🔹 현재는 user 정보를 localStorage에서 관리
        localStorage.removeItem("user");
        setUser(null);
        alert("로그아웃 되었습니다.");
        navigate("/");
    };

    return (
        <nav
            style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                padding: "10px",
                background: "#f5f5f5",
            }}
        >
            <Link to="/">홈</Link>

            {user ? (
                <>
                    {/* 🔹 user.name 혹은 user.studentId 등 표시 */}
                    <span>안녕하세요, {user.name || user.studentId}님</span>
                    <Link to="/umbrella">우산 대여</Link>
                    <Link to="/umbrella/logs">내 대여내역</Link>
                    <button onClick={handleLogout}>로그아웃</button>
                </>
            ) : (
                <>
                    <Link to="/login">로그인</Link>
                    <Link to="/register">회원가입</Link>
                </>
            )}
        </nav>
    );
}
