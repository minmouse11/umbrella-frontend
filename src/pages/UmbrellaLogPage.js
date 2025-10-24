import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "./UmbrellaLogPage.css"; // ← 아래 CSS 파일도 함께 추가

export default function UmbrellaLogPage() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 로그인 복원
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

  // 내역 불러오기 (서버 반환 순서 그대로 표시)
  useEffect(() => {
    if (!user) return;

    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data } = await axios.get(`/umbrella/logs/${user.studentId}`);
        if (!alive) return;
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr("내역을 불러오는 데 실패했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user]);

  const fmtDate = (ts) =>
    new Date(ts).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (!user) return <h2 className="ui-guard">로그인 후 이용 가능합니다.</h2>;

  return (
    <main className="ui-container ui-section notranslate">
      <div className="ui-card ui-card--padded">
        <h1 className="ui-card__title">{user.name} 님의 우산/반납 내역</h1>
        <p className="ui-muted">최신순으로 표시됩니다.</p>
      </div>

      {loading && (
        <div className="ui-card ui-card--padded" style={{ marginTop: 12 }}>
          불러오는 중…
        </div>
      )}

      {err && (
        <div className="ui-alert ui-alert--danger" style={{ marginTop: 12 }}>
          {err}
        </div>
      )}

      {!loading && !err && logs.length === 0 && (
        <div className="ui-card ui-card--padded" style={{ marginTop: 12 }}>
          <p className="ui-muted">아직 기록이 없습니다.</p>
        </div>
      )}

      {!loading && !err && logs.length > 0 && (
        <div className="log-grid">
          {logs.map((log, idx) => (
            <div className="log-card" key={log._id || idx}>
              <div
                className={
                  "badge " +
                  (log.action === "rent"
                    ? "rent"
                    : log.action === "return"
                    ? "return"
                    : "other")
                }
              >
                {log.action === "rent"
                  ? "대여"
                  : log.action === "return"
                  ? "반납"
                  : log.action || "기타"}
              </div>

              <div className="kv">
                <div>
                  <span>슬롯 번호</span>
                  <strong>{log.slotNumber ?? "-"}</strong>
                </div>
                <div>
                  <span>일시</span>
                  <strong>{fmtDate(log.createdAt)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
