import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./UmbrellaPage.css";

const RENTAL_KEY = "currentRental"; // { slotNumber, rentedAt }

export default function UmbrellaPage() {
  const [user, setUser] = useState(null);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [slotNumber, setSlotNumber] = useState("");
  const [error, setError] = useState(null);

  // 대여 상태(타이머용)
  const [rental, setRental] = useState(null); // { slotNumber, rentedAt }
  const [sec, setSec] = useState(0);
  const [cost, setCost] = useState(0);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  /* ─────────────────────────────────────────
   * 1) 로그인 복원
   * ───────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  /* ─────────────────────────────────────────
   * 2) 대여 상태 복원 (로컬 → 실패 시 서버 로그)
   * ───────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    // 2-1) localStorage 우선 복원
    const savedRental = localStorage.getItem(RENTAL_KEY);
    if (savedRental) {
      try {
        const r = JSON.parse(savedRental);
        if (r?.slotNumber && r?.rentedAt) {
          setRental(r);
          return; // 로컬 복원 성공 시 서버 조회 생략
        }
      } catch {
        localStorage.removeItem(RENTAL_KEY);
      }
    }

    // 2-2) 서버 로그로 상태 추정 (최신순 반환 가정)
    (async () => {
      try {
        const { data } = await api.get(`/umbrella/logs/${user.studentId}`);
        const logs = Array.isArray(data) ? data : [];

        // 최신 로그가 'rent'이고 그 이후 'return'이 없다면 대여 중으로 간주
        if (logs.length > 0) {
          const lastRent = logs.find((l) => l.action === "rent");
          if (lastRent) {
            const returnedAfter = logs.find(
              (l) =>
                l.action === "return" &&
                l.slotNumber === lastRent.slotNumber &&
                new Date(l.createdAt).getTime() > new Date(lastRent.createdAt).getTime()
            );
            if (!returnedAfter) {
              const r = {
                slotNumber: lastRent.slotNumber,
                rentedAt: lastRent.createdAt,
              };
              setRental(r);
              localStorage.setItem(RENTAL_KEY, JSON.stringify(r));
            }
          }
        }
      } catch (e) {
        // 조용히 패스 (UX 유지)
      }
    })();
  }, [user]);

  /* ─────────────────────────────────────────
   * 3) 슬롯 목록 (서버 순서 그대로)
   * ───────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoadingSlots(true);
        const { data } = await api.get("/umbrella/slots");
        setSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("슬롯 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, []);

  /* ─────────────────────────────────────────
   * 4) 타이머
   * ───────────────────────────────────────── */
  useEffect(() => {
    if (!rental) return;

    const start = new Date(rental.rentedAt).getTime();

    const tick = () => {
      const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setSec(s);

      if (s <= 1800) {
        setCost(0);
      } else {
        const extraMin = Math.ceil((s - 1800) / 60);
        const extraHour = Math.ceil(extraMin / 60);
        setCost(extraHour * 500);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [rental]);

  // rental 변경 시 로컬에도 동기화
  useEffect(() => {
    if (rental) localStorage.setItem(RENTAL_KEY, JSON.stringify(rental));
  }, [rental]);

  /* ─────────────────────────────────────────
   * 5) 액션
   * ───────────────────────────────────────── */
  const startRental = async () => {
    if (!slotNumber) return setError("슬롯 번호를 입력하세요.");
    if (!user) return setError("로그인 후 이용 가능합니다.");

    try {
      setError(null);
      const body = { slotNumber: Number(slotNumber), studentId: user.studentId };
      await api.post("/umbrella/rent", body);

      const started = {
        slotNumber: Number(slotNumber),
        rentedAt: new Date().toISOString(),
      };
      setRental(started);
      localStorage.setItem(RENTAL_KEY, JSON.stringify(started));
    } catch (e) {
      setError("대여 시작에 실패했습니다.");
    }
  };

  // 데모용 반납 (실서비스는 IoT 자동 반납)
 const handleReturn = async () => {
  if (!rental || !user) return;

  try {
    setError(null);
    await api.post("/umbrella/return", {
      slotNumber: Number(rental.slotNumber),
      studentId: user.studentId,
    });

    // UI 상태 초기화
    setRental(null);
    setSec(0);
    setCost(0);
    localStorage.removeItem("currentRental");

    // 슬롯 목록 갱신
    try {
      const { data } = await api.get("/umbrella/slots");
      setSlots(Array.isArray(data) ? data : []);
    } catch (_) {}
  } catch (e) {
    setError("반납 처리에 실패했습니다.");
  }
};

  /* ─────────────────────────────────────────
   * 6) 유틸
   * ───────────────────────────────────────── */
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  if (!user) return <h2 className="ui-guard">로그인 후 이용 가능합니다.</h2>;

  return (
    <main className="ui-container ui-section">
      {/* 헤더 카드 */}
      <div className="ui-card ui-card--padded">
        <h1 className="ui-card__title">우산/반납</h1>
        <p className="ui-muted">{user.name} 님, 우산을 쓰거나 반납하세요.</p>
      </div>

      {/* 에러 */}
      {error && <div className="ui-alert ui-alert--danger">{error}</div>}

      {/* 대여 전 UI */}
      {!rental && (
        <div className="ui-card ui-card--padded" style={{ marginTop: 12 }}>
          <h2 className="ui-card__title">사용 가능</h2>

          {loadingSlots ? (
            <div className="ui-muted" style={{ padding: 8 }}>
              슬롯 정보를 불러오는 중…
            </div>
          ) : (
            <>
              {/* 슬롯 카드 그리드: 서버 순서 그대로 */}
              <div className="slot-grid">
                {slots.map((s) => (
                  <button
                    key={`${s.slotNumber}-${s.isAvailable ? "ok" : "busy"}`}
                    className={`slot-chip ${s.isAvailable ? "ok" : "busy"} ${
                      Number(slotNumber) === Number(s.slotNumber) ? "selected" : ""
                    }`}
                    onClick={() => s.isAvailable && setSlotNumber(s.slotNumber)}
                    disabled={!s.isAvailable}
                    title={s.isAvailable ? "대여 가능" : "대여 중"}
                  >
                    <span className="slot-no">{s.slotNumber}번</span>
                    <span className="slot-state">{s.isAvailable ? "이용 가능" : "대여 중"}</span>
                  </button>
                ))}
              </div>

              {/* 선택/대여 영역 */}
              <div className="ui-hstack" style={{ marginTop: 14 }}>
                <input
                  type="number"
                  className="ui-input"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  placeholder="선택 가능 번호: 예) 3"
                  min="1"
                />
                <button
                  className="ui-btn ui-btn--primary"
                  onClick={startRental}
                  disabled={!slotNumber}
                  title={!slotNumber ? "슬롯 번호를 입력하세요." : "대여 시작"}
                >
                  대여 시작
                </button>
              </div>

              <div className="ui-right mt-10">
                <button className="ui-btn" onClick={() => navigate("/umbrella/logs")}>
                  내 대여/반납 내역 보기
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 대여 중 UI */}
      {rental && (
        <div className="ui-card ui-card--padded" style={{ marginTop: 12 }}>
          <div className="rent-hero">
            <div className="timer">{fmt(sec)}</div>
            <div className="meta">
              <div>
                슬롯 <strong>{rental.slotNumber}</strong>번
              </div>
              <div>
                이용시간: <strong>{fmt(sec)}</strong>
              </div>
              <div>
                요금: <strong>₩{cost.toLocaleString()}</strong>
              </div>
              <div className="ui-muted sm">
                {sec <= 1800 ? `무료 30분 남은 시간: ${1800 - sec}초` : "무료 시간 종료"}
              </div>
            </div>
          </div>

          {/* 반납 안내 카드 */}
          <div className="ui-card ui-card--padded" style={{ marginTop: 12 }}>
            <h3 className="ui-card__title">반납 안내</h3>
            <ol className="ui-muted" style={{ lineHeight: 1.8, marginBottom: 10 }}>
              <li>가까운 대여소의 빈 슬롯에 우산을 꽂아주세요.</li>
              <li>우산이 감지되면 자동으로 반납 처리됩니다.</li>
              <li>네트워크 지연 시 최대 5초 내 반영됩니다.</li>
            </ol>

            <div className="ui-hstack">
              <button className="ui-btn ui-btn--danger" onClick={handleReturn}>
                반납 처리 (테스트)
              </button>
              <button className="ui-btn" onClick={() => navigate("/umbrella/logs")}>
                내역 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
