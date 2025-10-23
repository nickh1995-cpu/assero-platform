export default function TestSimplePage() {
  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "100vh" }}>
      <h1 style={{ color: "black", fontSize: "24px", marginBottom: "20px" }}>
        Einfacher Test
      </h1>
      <p style={{ color: "black", marginBottom: "20px" }}>
        Diese Seite sollte korrekt angezeigt werden.
      </p>
      
      <div style={{ 
        backgroundColor: "#f0f0f0", 
        padding: "20px", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h2 style={{ color: "black", marginBottom: "10px" }}>CSS-Test</h2>
        <p style={{ color: "black" }}>
          Wenn du diesen Text sehen kannst, funktioniert das grundlegende Styling.
        </p>
      </div>

      <div style={{ 
        backgroundColor: "#2c5a78", 
        color: "white",
        padding: "20px", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h2 style={{ color: "white", marginBottom: "10px" }}>Brand-Farbe Test</h2>
        <p style={{ color: "white" }}>
          Dies ist die ASSERO Brand-Farbe (#2c5a78).
        </p>
      </div>

      <a 
        href="/register" 
        style={{ 
          display: "inline-block",
          backgroundColor: "#2c5a78",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          marginRight: "10px"
        }}
      >
        Zur Registrierung
      </a>

      <a 
        href="/sign-in" 
        style={{ 
          display: "inline-block",
          backgroundColor: "#f0f0f0",
          color: "black",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          border: "1px solid #ccc"
        }}
      >
        Zur Anmeldung
      </a>
    </div>
  );
}
