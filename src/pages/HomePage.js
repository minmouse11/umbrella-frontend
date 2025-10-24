import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import BottomNavigation from "../components/BottomNavigation";
import "./HomePage.css";

export default function HomePage({ user, setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    }
  }, [user, setUser]);

  const features = [
    { icon: "📍", title: "편리한 위치", desc: "지하철역·버스정류장 등 근처 설치" },
    { icon: "⏰", title: "24시간 이용", desc: "필요할 때 언제든 대여/반납" },
    { icon: "☂", title: "깨끗한 우산", desc: "매일 세탁·건조한 우산만 제공" },
    { icon: "₩", title: "합리적인 가격", desc: "시간당 500원으로 부담 없이" },
  ];

  const steps = [
    { icon: "🔎", title: "위치 찾기", desc: "가까운 우산 대여소를 찾아보세요" },
    { icon: "📷", title: "QR 스캔", desc: "대여함의 QR 코드를 스캔하세요" },
    { icon: "↩️", title: "사용 후 반납", desc: "가까운 대여소에 반납하세요" },
  ];

  return (
    <div className="home">
      {/* 히어로 배너 */}
      <section className="hero">
        <div className="container">
          <h1 className="hero__title">갑작스러운 비에도<br/>걱정 없어요!</h1>
          <p className="hero__subtitle">언제 어디서나 깨끗한 우산을 렌탈해보세요</p>

          <div className="hero__actions">
            {user ? (
              <button className="btn btn--primary" onClick={() => navigate("/umbrella")}>
                우산 대여하기
              </button>
            ) : (
              <Link className="btn btn--primary" to="/login">로그인하고 시작하기</Link>
            )}
            <span className="hero__price">처음 30분 무료 · 시간당 500원</span>
          </div>
        </div>
      </section>

      {/* 특징 카드 */}
      <section className="section">
        <div className="container grid">
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="section section--howto">
        <div className="container">
          <h2 className="section__title">이용 방법</h2>
          <ul className="howto">
            {steps.map((s, i) => (
              <li className="howto__item" key={i}>
                <div className="howto__icon">{s.icon}</div>
                <div className="howto__txt">
                  <p className="howto__title">{s.title}</p>
                  <p className="howto__desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="actions">
            {user ? (
              <>
                <button className="btn btn--primary" onClick={() => navigate("/umbrella")}>우산 대여하기</button>
                <button className="btn" onClick={() => navigate("/umbrella/logs")}>내 대여/반납 내역 보기</button>
              </>
            ) : (
              <Link className="btn" to="/login">로그인 후 이용 가능합니다</Link>
            )}
          </div>
        </div>
      </section>

      {/* 하단 탭 */}
      <BottomNavigation />
    </div>
  );
}
