import React from "react";

export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card">
      <div className="card__icon">{icon}</div>
      <h3 className="card__title">{title}</h3>
      <p className="card__desc">{desc}</p>
    </div>
  );
}
