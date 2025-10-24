import React, { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";

const UmbrellaControl = ({ studentId }) => {
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [message, setMessage] = useState("");

    // useCallback을 사용하여 함수가 불필요하게 재생성되는 것을 방지합니다.
    const fetchSlots = useCallback(async () => {
        try {
            const res = await axios.get("/umbrella/slots");
            setSlots(res.data);
        } catch (err) {
            console.error("슬롯 정보 로딩 실패:", err);
            setMessage("슬롯 정보를 가져오는데 실패했습니다.");
        }
    }, []);

    // ⭐️ 이제 처음 한 번만 슬롯 정보를 불러옵니다.
    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    // 대여 처리 함수
    const handleRent = async () => {
        if (!selectedSlot) {
            setMessage("대여할 슬롯을 선택해주세요.");
            return;
        }
        // 대여는 '대여 가능' 상태인 슬롯에서만 가능합니다.
        const slotToRent = slots.find(s => s.slotNumber === selectedSlot);
        if (!slotToRent || !slotToRent.isAvailable) {
            setMessage("선택한 슬롯은 현재 대여가 불가능합니다.");
            return;
        }

        try {
            const res = await axios.post("/umbrella/rent", {
                slotNumber: selectedSlot,
                studentId,
            });
            setMessage(res.data.message);
            setSelectedSlot(null); // 선택 초기화
            fetchSlots(); // 성공 후 상태 새로고침
        } catch (err) {
            setMessage(err.response?.data?.message || "대여에 실패했습니다.");
        }
    };

    // ⭐️ 새로 추가된 반납 처리 함수
    const handleReturn = async () => {
        if (!selectedSlot) {
            setMessage("반납할 슬롯을 선택해주세요.");
            return;
        }
        // 반납은 '사용 중' 상태인 슬롯에서만 가능합니다.
        const slotToReturn = slots.find(s => s.slotNumber === selectedSlot);
        if (!slotToReturn || slotToReturn.isAvailable) {
            setMessage("선택한 슬롯은 이미 비어있어 반납할 수 없습니다.");
            return;
        }

        try {
            const res = await axios.post("/umbrella/return", {
                slotNumber: selectedSlot,
                studentId,
            });
            setMessage(res.data.message);
            setSelectedSlot(null); // 선택 초기화
            fetchSlots(); // 성공 후 상태 새로고침
        } catch (err) {
            // "우산이 없습니다" 같은 백엔드의 에러 메시지를 그대로 보여줍니다.
            setMessage(err.response?.data?.message || "반납에 실패했습니다.");
        }
    };

    return (
        <div>
            <h2>우산 대여/반납</h2>
            <p><strong>대여:</strong> '대여 가능' 슬롯을 선택 후 '대여하기' 버튼을 누르세요.</p>
            <p><strong>반납:</strong> '사용 중'인 슬롯을 선택 후 '반납하기' 버튼을 누르세요.</p>

            <div style={{ marginTop: '20px' }}>
                <h3>슬롯 선택</h3>
                {slots.length > 0 ? (
                    slots.map((slot) => (
                        <button
                            key={slot.slotNumber}
                            onClick={() => setSelectedSlot(slot.slotNumber)}
                            style={{
                                margin: "5px",
                                padding: "10px 15px",
                                border: selectedSlot === slot.slotNumber ? "2px solid #007bff" : "1px solid #ccc",
                                backgroundColor: slot.isAvailable ? "#e7f7ff" : "#f0f0f0",
                            }}
                        >
                            {slot.slotNumber}번 {slot.isAvailable ? "✅ 대여 가능" : "❌ 사용 중"}
                        </button>
                    ))
                ) : (
                    <p>슬롯 정보를 불러오는 중...</p>
                )}
            </div>

            <div style={{ marginTop: "20px" }}>
                <button onClick={handleRent} style={{ padding: '10px 20px', fontSize: '16px' }}>
                    대여하기
                </button>
                {/* ⭐️ 반납하기 버튼 추가 */}
                <button onClick={handleReturn} style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#f0ad4e', color: 'white', border: 'none' }}>
                    반납하기
                </button>
            </div>

            {message && <p style={{ marginTop: "15px", color: "#d9534f", fontWeight: "bold" }}>{message}</p>}
        </div>
    );
};

export default UmbrellaControl;