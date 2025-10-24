import React, { useEffect, useState } from "react";
import axios from "../axios"; // 프로젝트 기준으로 axios.js 위치에 맞게

function UmbrellaSlots() {
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const res = await axios.get("/umbrella/slots"); // baseURL + /umbrella/slots
                setSlots(res.data);
            } catch (err) {
                console.error("슬롯 조회 실패:", err);
                setError(err.message);
            }
        };

        fetchSlots();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>우산 슬롯 현황</h2>
            <ul>
                {slots.map((slot) => (
                    <li key={slot.slotNumber}>
                        슬롯 {slot.slotNumber}: {slot.isAvailable ? "사용 가능" : "대여 중"}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UmbrellaSlots;