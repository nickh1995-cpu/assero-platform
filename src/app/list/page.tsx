import Link from "next/link";

export default function ListEntry() {
  return (
    <main className="section padded light">
      <div className="container">
        <h1 className="section-title">Asset listen</h1>
        <p className="lead">Geführter Ablauf, um ein neues Asset als Draft zu erstellen.</p>
        <div className="feature-grid">
          <div className="feature">
            <h3>Immobilie</h3>
            <p>Wohn/Commercial – Lage, Flächen, Zustand, Ertrag.</p>
          </div>
          <div className="feature">
            <h3>Fahrzeug</h3>
            <p>Marke/Modell, Baujahr, km, Zustand, Historie.</p>
          </div>
          <div className="feature">
            <h3>Luxusuhr</h3>
            <p>Marke/Referenz, Zustand, Papiere/Box.</p>
          </div>
        </div>
        <p className="mt-6">
          <Link className="slide-cta" href="/sign-in">Anmelden, um zu starten →</Link>
        </p>
      </div>
    </main>
  );
}


