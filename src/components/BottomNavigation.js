import React from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/", label: "홈", icon: "🏠" },
  { to: "/umbrella", label: "위치", icon: "📍" },
  { to: "/umbrella", label: "대여", icon: "☂" },
  { to: "/me", label: "마이", icon: "👤" },
];

export default function BottomNavigation() {
  const { pathname } = useLocation();
  return (
    <nav className="bottomnav">
      {items.map((it) => {
        const active = pathname === it.to;
        return (
          <Link key={it.to} to={it.to} className={`bottomnav__item ${active ? "is-active" : ""}`}>
            <span className="bottomnav__icon">{it.icon}</span>
            <span className="bottomnav__label">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
