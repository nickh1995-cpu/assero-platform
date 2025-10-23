import { Header } from "@/components/Header";

export default function PrivacyPage() {
  return (
    <main className="with-header-offset theme-light">
      <Header />
      
      <div className="section padded light">
        <div className="container">
          <div className="legal-content">
            <div className="legal-header">
              <h1 className="legal-title">Datenschutzerklärung</h1>
              <p className="legal-subtitle">Stand: Januar 2025</p>
              <div className="legal-notice">
                <p><strong>Wichtiger Hinweis:</strong> ASSERO befindet sich derzeit in der Ausbauphase. Diese Datenschutzerklärung wird kontinuierlich an die sich entwickelnden Funktionen und Services angepasst. Wir behalten uns vor, diese Erklärung bei der Einführung neuer Features zu erweitern und zu präzisieren.</p>
              </div>
            </div>
            
            <div className="legal-body">
              <section className="legal-section">
                <h2 className="section-heading">1. Verantwortlicher</h2>
                <div className="contact-info">
                  <p><strong>ASSERO</strong></p>
                  <p><strong>Geschäftsführung:</strong> N. Herbig</p>
                  <p>E-Mail: <a href="mailto:datenschutz@assero.de" className="legal-link">datenschutz@assero.de</a></p>
                  <p>Plattform: <a href="https://assero.de" className="legal-link">https://assero.de</a></p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
                <p className="section-text">
                  Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Diese Datenschutzerklärung 
                  informiert Sie über Art, Umfang und Zweck der Verarbeitung von personenbezogenen Daten auf unserer 
                  Plattform ASSERO.
                </p>
                <p className="section-text">
                  <strong>Wichtiger Hinweis zur Plattform-Rolle:</strong> ASSERO fungiert ausschließlich als reine 
                  Vermittlungsplattform und technische Infrastruktur. Wir sind weder Vertragspartner noch Partei 
                  der zwischen Nutzern geschlossenen Transaktionen. Unsere Datenverarbeitung beschränkt sich auf 
                  die technische Bereitstellung der Plattform und die Vermittlung von Kontakten zwischen Nutzern.
                </p>
                <p className="section-text">
                  Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der geltenden Datenschutzgesetze, 
                  insbesondere der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG).
                </p>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">3. Erhobene Datenarten</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">3.1 Automatisch erhobene Daten</h3>
                  <p className="section-text">Beim Besuch unserer Website werden automatisch folgende Daten erhoben:</p>
                  <ul className="legal-list">
                    <li>IP-Adresse des zugreifenden Rechners</li>
                    <li>Datum und Uhrzeit des Zugriffs</li>
                    <li>Name und URL der abgerufenen Datei</li>
                    <li>Übertragene Datenmenge</li>
                    <li>Meldung über erfolgreichen Abruf</li>
                    <li>Browsertyp und -version</li>
                    <li>Betriebssystem</li>
                    <li>Referrer-URL (die zuvor besuchte Seite)</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">3.2 Freiwillig mitgeteilte Daten</h3>
                  <ul className="legal-list">
                    <li>Name und Kontaktdaten (E-Mail, Telefon)</li>
                    <li>Berufliche Informationen</li>
                    <li>Asset-Informationen und Inserate</li>
                    <li>Bewerbungen für den Founders Circle</li>
                    <li>Kommunikationsinhalte</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">4. Zweck und Rechtsgrundlage der Verarbeitung</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">4.1 Bereitstellung der Plattform</h3>
                  <p className="section-text">
                    <strong>Zweck:</strong> Bereitstellung und technische Administration der ASSERO-Plattform<br />
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">4.2 Asset-Listings und Matching</h3>
                  <p className="section-text">
                    <strong>Zweck:</strong> Veröffentlichung von Asset-Inseraten und Vermittlung zwischen Anbietern und Interessenten<br />
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">4.3 Founders Circle Programm</h3>
                  <p className="section-text">
                    <strong>Zweck:</strong> Bewerbungsverfahren und Verwaltung exklusiver Mitgliedschaften<br />
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">4.4 Kommunikation und Support</h3>
                  <p className="section-text">
                    <strong>Zweck:</strong> Beantwortung von Anfragen und technischer Support<br />
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">4.5 Marketing und Werbung</h3>
                  <p className="section-text">
                    <strong>Zweck:</strong> Information über neue Features und Plattform-Updates<br />
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">5. Datenweitergabe</h2>
                <p className="section-text">
                  Wir geben Ihre personenbezogenen Daten nur an Dritte weiter, wenn:
                </p>
                <ul className="legal-list">
                  <li>Sie Ihre ausdrückliche Einwilligung erteilt haben (Art. 6 Abs. 1 lit. a DSGVO)</li>
                  <li>die Weitergabe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist</li>
                  <li>die Weitergabe zur Erfüllung einer rechtlichen Verpflichtung erforderlich ist (Art. 6 Abs. 1 lit. c DSGVO)</li>
                  <li>die Weitergabe zur Wahrung unserer berechtigten Interessen erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO)</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">6. Cookies und Tracking</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">6.1 Technisch notwendige Cookies</h3>
                  <p className="section-text">
                    Wir setzen technisch notwendige Cookies ein, um die Funktionalität unserer Website zu gewährleisten. 
                    Diese können nicht deaktiviert werden.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">6.2 Analyse-Cookies</h3>
                  <p className="section-text">
                    Wir verwenden Analyse-Tools zur Verbesserung unserer Website. Sie können der Verwendung 
                    widersprechen oder Ihre Einwilligung jederzeit widerrufen.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">7. Datensicherheit</h2>
                <p className="section-text">
                  Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten 
                  vor unbefugtem Zugriff, Verlust, Missbrauch oder Veränderung zu schützen:
                </p>
                <ul className="legal-list">
                  <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                  <li>Regelmäßige Sicherheitsupdates und Patches</li>
                  <li>Zugriffsbeschränkungen und Authentifizierung</li>
                  <li>Regelmäßige Backups und Notfallpläne</li>
                  <li>Schulung unserer Mitarbeiter im Datenschutz</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">8. Ihre Rechte</h2>
                <p className="section-text">Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
                
                <div className="subsection">
                  <h3 className="subsection-heading">8.1 Auskunftsrecht (Art. 15 DSGVO)</h3>
                  <p className="section-text">
                    Sie haben das Recht, Auskunft über die von uns verarbeiteten personenbezogenen Daten zu verlangen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">8.2 Recht auf Berichtigung (Art. 16 DSGVO)</h3>
                  <p className="section-text">
                    Sie haben das Recht auf Berichtigung unrichtiger oder Vervollständigung unvollständiger Daten.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">8.3 Recht auf Löschung (Art. 17 DSGVO)</h3>
                  <p className="section-text">
                    Sie haben das Recht auf Löschung Ihrer personenbezogenen Daten unter bestimmten Voraussetzungen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">8.4 Recht auf Einschränkung (Art. 18 DSGVO)</h3>
                  <p className="section-text">
                    Sie haben das Recht auf Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">8.5 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
                  <p className="section-text">
                    Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen Format zu erhalten.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">8.6 Widerspruchsrecht (Art. 21 DSGVO)</h3>
                  <p className="section-text">
                    Sie haben das Recht, der Verarbeitung Ihrer Daten aus Gründen Ihres besonderen 
                    Situations zu widersprechen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">8.7 Beschwerderecht (Art. 77 DSGVO)</h3>
                  <p className="section-text">
                    Sie haben das Recht, sich bei einer Aufsichtsbehörde über die Verarbeitung 
                    Ihrer personenbezogenen Daten zu beschweren.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">9. Speicherdauer</h2>
                <p className="section-text">
                  Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die jeweiligen 
                  Verarbeitungszwecke erforderlich ist:
                </p>
                <ul className="legal-list">
                  <li><strong>Kontodaten:</strong> Bis zur Kündigung des Nutzerkontos</li>
                  <li><strong>Asset-Listings:</strong> Bis zur Löschung durch den Nutzer oder 2 Jahre nach Inaktivität</li>
                  <li><strong>Kommunikationsdaten:</strong> 3 Jahre nach letztem Kontakt</li>
                  <li><strong>Bewerbungsdaten:</strong> 1 Jahr nach Abschluss des Bewerbungsverfahrens</li>
                  <li><strong>Log-Daten:</strong> 7 Tage (anonymisiert)</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">10. Drittanbieter und Dienstleister</h2>
                <p className="section-text">
                  Wir arbeiten mit folgenden Dienstleistern zusammen, die Zugang zu personenbezogenen Daten haben können:
                </p>
                
                <div className="subsection">
                  <h3 className="subsection-heading">10.1 Hosting und Infrastruktur</h3>
                  <p className="section-text">
                    <strong>Anbieter:</strong> Vercel, Supabase<br />
                    <strong>Zweck:</strong> Hosting der Website und Datenbank<br />
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">10.2 E-Mail-Versand</h3>
                  <p className="section-text">
                    <strong>Anbieter:</strong> Resend, SendGrid<br />
                    <strong>Zweck:</strong> Versand von E-Mails und Benachrichtigungen<br />
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">11. Internationale Datenübertragungen</h2>
                <p className="section-text">
                  Einige unserer Dienstleister haben ihren Sitz außerhalb des Europäischen Wirtschaftsraums (EWR). 
                  In diesen Fällen stellen wir sicher, dass angemessene Schutzmaßnahmen getroffen werden, 
                  insbesondere durch Standardvertragsklauseln der Europäischen Kommission.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">12. Änderungen dieser Datenschutzerklärung</h2>
                <p className="section-text">
                  Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren. 
                  Wesentliche Änderungen werden wir Ihnen rechtzeitig mitteilen.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">13. Besondere Kategorien personenbezogener Daten</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">13.1 Finanzdaten</h3>
                  <p className="section-text">
                    Bei der Bewerbung für den Founders Circle und bei Asset-Transaktionen können wir folgende 
                    besondere Kategorien personenbezogener Daten verarbeiten:
                  </p>
                  <ul className="legal-list">
                    <li>Vermögensverhältnisse und Einkommensnachweise</li>
                    <li>Berufliche Qualifikationen und Referenzen</li>
                    <li>Investment-Erfahrung und Risikoprofil</li>
                    <li>Bankverbindungen für Transaktionen</li>
                  </ul>
                  <p className="section-text">
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und 
                    Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung)
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">13.2 Biometrische Daten</h3>
                  <p className="section-text">
                    Für die Authentifizierung von Luxusuhren und Fahrzeugen können biometrische Merkmale 
                    (Fingerabdrücke, Gesichtserkennung) verarbeitet werden, sofern Sie hierzu Ihre 
                    ausdrückliche Einwilligung erteilen.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">14. Automatisierte Entscheidungsfindung</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">14.1 KI-gestützte Bewertungen</h3>
                  <p className="section-text">
                    ASSERO nutzt künstliche Intelligenz für Asset-Bewertungen und Matching-Algorithmen. 
                    Diese automatisierte Verarbeitung erfolgt auf Grundlage von:
                  </p>
                  <ul className="legal-list">
                    <li>Marktdaten und historischen Preisen</li>
                    <li>Asset-spezifischen Merkmalen</li>
                    <li>Nutzerpräferenzen und Verhalten</li>
                    <li>Externen Datenquellen</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">14.2 Ihre Rechte</h3>
                  <p className="section-text">
                    Sie haben das Recht, nicht einer ausschließlich auf automatisierter Verarbeitung 
                    beruhenden Entscheidung unterworfen zu werden, die Ihnen gegenüber rechtliche Wirkung 
                    entfaltet oder Sie in ähnlicher Weise erheblich beeinträchtigt (Art. 22 DSGVO).
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">15. Datenverarbeitung für Marketingzwecke</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">15.1 Direktmarketing</h3>
                  <p className="section-text">
                    Wir verarbeiten Ihre Kontaktdaten für Direktmarketing, sofern Sie hierzu Ihre 
                    Einwilligung erteilt haben oder wir ein berechtigtes Interesse an der Werbung 
                    für ähnliche Produkte haben.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">15.2 Profiling</h3>
                  <p className="section-text">
                    Zur Personalisierung unserer Services erstellen wir Nutzerprofile basierend auf:
                  </p>
                  <ul className="legal-list">
                    <li>Browsing-Verhalten auf der Plattform</li>
                    <li>Suchanfragen und Interessen</li>
                    <li>Asset-Präferenzen und Transaktionshistorie</li>
                    <li>Demografische Informationen</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">15.3 Widerspruchsrecht</h3>
                  <p className="section-text">
                    Sie können der Verarbeitung Ihrer Daten für Marketingzwecke jederzeit widersprechen, 
                    ohne dass hierfür Gründe angegeben werden müssen.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">16. Compliance und Aufsichtsbehörden</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">16.1 Datenschutz-Folgenabschätzung</h3>
                  <p className="section-text">
                    Für Verarbeitungsvorgänge mit hohem Risiko führen wir eine Datenschutz-Folgenabschätzung 
                    durch, um die Risiken für die Rechte und Freiheiten betroffener Personen zu bewerten.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">16.2 Meldepflichten</h3>
                  <p className="section-text">
                    Bei Datenschutzverletzungen informieren wir die zuständige Aufsichtsbehörde innerhalb 
                    von 72 Stunden und betroffene Personen unverzüglich, sofern ein hohes Risiko besteht.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">16.3 Zuständige Aufsichtsbehörde</h3>
                  <p className="section-text">
                    <strong>Landesbeauftragte für Datenschutz und Informationsfreiheit</strong><br />
                    E-Mail: poststelle@datenschutz-bw.de<br />
                    Website: <a href="https://www.baden-wuerttemberg.datenschutz.de" className="legal-link">www.baden-wuerttemberg.datenschutz.de</a>
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">17. Besondere Bestimmungen für Asset-Transaktionen</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">17.1 Due Diligence</h3>
                  <p className="section-text">
                    Für die Durchführung von Asset-Transaktionen verarbeiten wir erweiterte Daten zur 
                    Erfüllung von Compliance-Anforderungen und Geldwäscheprävention:
                  </p>
                  <ul className="legal-list">
                    <li>Identitätsnachweise und Adressverifikation</li>
                    <li>Herkunftsnachweis der Mittel</li>
                    <li>PEP-Status (Politisch exponierte Personen)</li>
                    <li>Sanctions-Liste-Checks</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">17.2 Drittanbieter-Integration</h3>
                  <p className="section-text">
                    Wir integrieren externe Services für Identitätsverifikation, KYC-Prozesse und 
                    Compliance-Checks. Diese Anbieter verarbeiten Ihre Daten gemäß ihren eigenen 
                    Datenschutzerklärungen.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">18. Technische und organisatorische Maßnahmen</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">18.1 Verschlüsselung</h3>
                  <p className="section-text">
                    Alle Datenübertragungen erfolgen über TLS 1.3. Gespeicherte Daten werden mit 
                    AES-256 verschlüsselt. Passwörter werden mit bcrypt gehasht.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">18.2 Zugriffskontrolle</h3>
                  <p className="section-text">
                    Wir implementieren das Prinzip der geringsten Berechtigung, Multi-Faktor-Authentifizierung 
                    und regelmäßige Zugriffsüberprüfungen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">18.3 Monitoring und Logging</h3>
                  <p className="section-text">
                    Alle Zugriffe auf personenbezogene Daten werden protokolliert und überwacht. 
                    Ungewöhnliche Aktivitäten werden automatisch erkannt und gemeldet.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">19. Kontakt</h2>
                <p className="section-text">
                  Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich an:
                </p>
                <div className="contact-info">
                  <p><strong>ASSERO Datenschutz</strong></p>
                  <p>E-Mail: <a href="mailto:datenschutz@assero.de" className="legal-link">datenschutz@assero.de</a></p>
                  <p>Betreff: &quot;Datenschutz-Anfrage&quot;</p>
                </div>
                <div className="support-info">
                  <p><strong>Antwortzeit:</strong> Innerhalb von 30 Tagen</p>
                  <p><strong>Bearbeitungszeit:</strong> Komplexe Anfragen können bis zu 60 Tage dauern</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
