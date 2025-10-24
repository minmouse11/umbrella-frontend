import React, { useState } from "react";
import axios from "../api/axios"; // axios 기본 설정 파일

export default function RegisterForm() {
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [department, setDepartment] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/users/register", {
                studentId,
                password,
                department,
                name,
                phone,
            });
            alert("회원가입 성공!");
            // 필요하면 회원가입 후 페이지 이동 가능
        } catch (err) {
            alert(err.response?.data?.message || "회원가입 실패");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="학번" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="학과" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="전화번호" />
            <button type="submit">회원가입</button>
        </form>
    );
}