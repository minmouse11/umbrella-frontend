import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function UmbrellaStatus({ userId }) {
    const [status, setStatus] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get(`/umbrella/status/${userId}`);
                setStatus(res.data.isRented);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStatus();
    }, [userId]);

    return (
        <div>
            <p>현재 대여 상태: {status ? "대여 중" : "반납 완료"}</p>
        </div>
    );
}