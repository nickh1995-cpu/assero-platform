import { Header } from "@/components/Header";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="with-header-offset theme-light">
      <Header />
      
      <div className="section padded light">
        <div className="container">
          <div className="legal-content">
            <div className="legal-header">
              <h1 className="legal-title">Allgemeine Geschäftsbedingungen</h1>
              <p className="legal-subtitle">Stand: Januar 2025</p>
              <div className="legal-notice">
                <p><strong>Wichtiger Hinweis:</strong> ASSERO befindet sich derzeit in der Ausbauphase. Diese Allgemeinen Geschäftsbedingungen werden kontinuierlich an die sich entwickelnden Funktionen und Services angepasst. Wir behalten uns vor, diese Bedingungen bei der Einführung neuer Features zu erweitern und zu präzisieren. Nutzer werden über wesentliche Änderungen mindestens 30 Tage im Voraus informiert.</p>
              </div>
            </div>
            
            <div className="legal-body">
              <section className="legal-section">
                <h2 className="section-heading">1. Geltungsbereich</h2>
                <p className="section-text">
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Nutzer der ASSERO Plattform 
                  und insbesondere für Teilnehmer des Founders Circle Programms. Mit der Nutzung unserer 
                  Dienste akzeptieren Sie diese Bedingungen vollständig.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">2. Anbieter und Kontakt</h2>
                <div className="contact-info">
                  <p><strong>ASSERO</strong></p>
                  <p><strong>Geschäftsführung:</strong> N. Herbig</p>
                  <p>E-Mail: <a href="mailto:kontakt@assero.de" className="legal-link">kontakt@assero.de</a></p>
                  <p>Plattform: <a href="https://assero.de" className="legal-link">https://assero.de</a></p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">3. Beschreibung der Dienste</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">3.1 ASSERO Plattform</h3>
                  <p className="section-text">
                    ASSERO ist Europas erste Multi-Asset-Plattform für Premium-Asset-Listings in den Kategorien:
                  </p>
                  <ul className="legal-list">
                    <li>Immobilien (Real Estate)</li>
                    <li>Luxusuhren (Watches)</li>
                    <li>Fahrzeuge (Vehicles)</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">3.2 Founders Circle Programm</h3>
                  <p className="section-text">
                    Ein exklusives Programm für 50-100 handverlesene Nutzer mit erweiterten Funktionen 
                    und Prioritätszugang zu neuen Features.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">4. Nutzungsbedingungen</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">4.1 Allgemeine Verpflichtungen</h3>
                  <ul className="legal-list">
                    <li>Einhaltung aller geltenden Gesetze und Vorschriften</li>
                    <li>Wahrheitstreue bei allen Angaben und Bewerbungen</li>
                    <li>Respektvoller Umgang mit anderen Nutzern</li>
                    <li>Keine missbräuchliche Nutzung der Plattform</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">4.2 Bewerbung für den Founders Circle</h3>
                  <ul className="legal-list">
                    <li>Vollständige und wahrheitsgemäße Angaben</li>
                    <li>Nachweis der beruflichen Qualifikation</li>
                    <li>Klare Darstellung der Motivation und Ziele</li>
                    <li>Einverständnis mit der Datenverarbeitung</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">5. Bewerbungsprozess</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">5.1 Bewerbungsverfahren</h3>
                  <ol className="legal-ordered-list">
                    <li>Online-Bewerbung über das Formular</li>
                    <li>Überprüfung der Angaben durch unser Team</li>
                    <li>Persönliches Gespräch bei positiver Vorauswahl</li>
                    <li>Finale Entscheidung und Benachrichtigung</li>
                  </ol>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">5.2 Auswahlkriterien</h3>
                  <ul className="legal-list">
                    <li>Berufliche Qualifikation und Erfahrung</li>
                    <li>Motivation und Ziele</li>
                    <li>Potenzial für aktive Plattform-Nutzung</li>
                    <li>Übereinstimmung mit der Plattform-Philosophie</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">6. Founders Circle Vorteile</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">6.1 Exklusive Features</h3>
                  <ul className="legal-list">
                    <li>Unbegrenzte Asset-Listings</li>
                    <li>Priority Support und persönliche Betreuung</li>
                    <li>Early Access zu neuen Features</li>
                    <li>Exklusive Networking-Events</li>
                    <li>Direkter Kontakt zum ASSERO-Team</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">6.2 Verpflichtungen der Mitglieder</h3>
                  <ul className="legal-list">
                    <li>Aktive Nutzung der Plattform</li>
                    <li>Feedback zu neuen Features</li>
                    <li>Einhaltung der Community-Richtlinien</li>
                    <li>Vertraulichkeit bezüglich exklusiver Informationen</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">7. Datenschutz und Vertraulichkeit</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">7.1 Datenschutz</h3>
                  <p className="section-text">
                    Die Verarbeitung Ihrer personenbezogenen Daten erfolgt gemäß unserer 
                    <Link href="/privacy" className="legal-link"> Datenschutzerklärung</Link> und den 
                    geltenden Datenschutzgesetzen (DSGVO).
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">7.2 Vertraulichkeit</h3>
                  <ul className="legal-list">
                    <li>Vertraulichkeit aller Plattform-Informationen</li>
                    <li>Keine Weitergabe an Dritte ohne Zustimmung</li>
                    <li>Verpflichtung zur Geheimhaltung exklusiver Features</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">8. Haftung und Gewährleistung</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">8.1 Haftungsbeschränkung</h3>
                  <p className="section-text">
                    Wir haften nur für Vorsatz und grobe Fahrlässigkeit. Die Haftung für leichte 
                    Fahrlässigkeit ist auf den vorhersehbaren Schaden begrenzt.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">8.2 Gewährleistungsausschluss</h3>
                  <ul className="legal-list">
                    <li>Keine Gewähr für ununterbrochene Verfügbarkeit</li>
                    <li>Keine Garantie für bestimmte Ergebnisse</li>
                    <li>Änderungen der Plattform vorbehalten</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">9. Geistiges Eigentum</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">9.1 Plattform-Inhalte</h3>
                  <p className="section-text">
                    Alle Inhalte der Plattform sind geistiges Eigentum von ASSERO und dürfen ohne 
                    ausdrückliche Zustimmung nicht kopiert oder weiterverwendet werden.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">9.2 Nutzer-Inhalte</h3>
                  <p className="section-text">
                    Nutzer behalten die Rechte an ihren eingestellten Inhalten, gewähren uns aber 
                    ein Nutzungsrecht für die Plattform-Bereitstellung.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">10. Kündigung und Ausschluss</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">10.1 Kündigung durch den Nutzer</h3>
                  <p className="section-text">
                    Sie können Ihre Mitgliedschaft jederzeit mit einer Frist von 30 Tagen zum 
                    Monatsende kündigen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">10.2 Ausschluss durch ASSERO</h3>
                  <p className="section-text">
                    Wir können Nutzer bei Verstößen gegen diese AGB oder bei missbräuchlichem 
                    Verhalten sofort von der Plattform ausschließen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">10.3 Folgen der Kündigung/Ausschlusses</h3>
                  <ul className="legal-list">
                    <li>Verlust aller exklusiven Vorteile</li>
                    <li>Löschung der persönlichen Daten (gemäß Datenschutzerklärung)</li>
                    <li>Keine Rückerstattung bereits geleisteter Zahlungen</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">11. Änderungen der AGB</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">11.1 Änderungsvorbehalt</h3>
                  <p className="section-text">
                    Wir behalten uns vor, diese AGB bei Änderungen der Dienste oder rechtlichen 
                    Anforderungen anzupassen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">11.2 Benachrichtigung</h3>
                  <p className="section-text">
                    Änderungen werden mindestens 30 Tage vor Inkrafttreten auf der Plattform 
                    veröffentlicht und per E-Mail angekündigt.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">11.3 Widerspruchsrecht</h3>
                  <p className="section-text">
                    Sie können Änderungen innerhalb von 14 Tagen widersprechen. Bei Widerspruch 
                    endet die Mitgliedschaft zum nächsten Monatsende.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">12. Streitbeilegung</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">12.1 Verhandlungsversuch</h3>
                  <p className="section-text">
                    Bei Streitigkeiten bemühen wir uns um eine einvernehmliche Lösung durch 
                    direkte Verhandlungen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">12.2 Gerichtsstand</h3>
                  <p className="section-text">
                    Gerichtsstand ist der Sitz von ASSERO. Es gilt deutsches Recht unter 
                    Ausschluss des UN-Kaufrechts.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">12.3 Online-Streitbeilegung</h3>
                  <p className="section-text">
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{" "}
                    <a 
                      href="https://ec.europa.eu/consumers/odr/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="legal-link"
                    >
                      https://ec.europa.eu/consumers/odr/
                    </a>
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">13. Schlussbestimmungen</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">13.1 Teilunwirksamkeit</h3>
                  <p className="section-text">
                    Sollten einzelne Bestimmungen unwirksam sein, bleibt der Rest der AGB wirksam.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">13.2 Salvatorische Klausel</h3>
                  <p className="section-text">
                    Unwirksame Bestimmungen werden durch wirksame Bestimmungen ersetzt, die dem 
                    wirtschaftlichen Zweck am nächsten kommen.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">13.3 Schriftform</h3>
                  <p className="section-text">
                    Änderungen dieser AGB bedürfen der Schriftform. Dies gilt auch für den 
                    Verzicht auf das Schriftformerfordernis.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">14. Kontakt und Support</h2>
                <p className="section-text">
                  Bei Fragen zu diesen AGB oder bei Problemen kontaktieren Sie uns:
                </p>
                <div className="contact-info">
                  <p><strong>ASSERO</strong></p>
                  <p>E-Mail: <a href="mailto:kontakt@assero.de" className="legal-link">kontakt@assero.de</a></p>
                  <p>Betreff: &quot;AGB-Anfrage&quot;</p>
                </div>
                <div className="support-info">
                  <p><strong>Support-Zeiten:</strong> Mo-Fr 9:00-18:00 Uhr</p>
                  <p><strong>Antwortzeit:</strong> Innerhalb von 24 Stunden</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">15. Asset-Transaktionen und Finanzdienstleistungen</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">15.1 Reine Vermittlungsplattform - Keine Vertragspartnerschaft</h3>
                  <p className="section-text">
                    <strong>ASSERO fungiert ausschließlich als reine Vermittlungsplattform und technische Infrastruktur.</strong> 
                    Wir sind weder Vertragspartner noch Partei der zwischen Nutzern geschlossenen Kauf-, Verkaufs- oder 
                    sonstigen Transaktionsverträge. ASSERO tritt lediglich als neutraler Intermediär auf, der die 
                    technischen Voraussetzungen für die Kontaktaufnahme zwischen Anbietern und Interessenten schafft.
                  </p>
                  <p className="section-text">
                    <strong>Rechtliche Distanzierung:</strong> ASSERO übernimmt keinerlei rechtliche Verantwortung für 
                    die zwischen Nutzern vereinbarten Transaktionen, deren Durchführung, Erfüllung oder etwaige 
                    Mängel. Wir sind rechtlich vollständig aus dem Transaktionsprozess herausgehalten und können 
                    für Umstände, die außerhalb unserer technischen Plattformleistung liegen, nicht haftbar gemacht werden.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">15.2 Umfassender Haftungsausschluss für Transaktionen</h3>
                  <p className="section-text">
                    ASSERO schließt jegliche Haftung für folgende Bereiche aus:
                  </p>
                  <ul className="legal-list">
                    <li><strong>Asset-Beschreibungen:</strong> Keine Gewähr für Richtigkeit, Vollständigkeit oder Aktualität von Nutzerangaben</li>
                    <li><strong>Asset-Authentizität:</strong> Keine Verifikation oder Gewährleistung der Echtheit von Assets</li>
                    <li><strong>Transaktionsabwicklung:</strong> Keine Verantwortung für Zahlungsabwicklung, Lieferung oder Übergabe</li>
                    <li><strong>Rechtsgeschäfte:</strong> Keine Haftung für die rechtliche Wirksamkeit oder Durchsetzbarkeit von Verträgen</li>
                    <li><strong>Mängel und Schäden:</strong> Keine Haftung für versteckte Mängel, Transportschäden oder Wertminderungen</li>
                    <li><strong>Steuerliche Aspekte:</strong> Keine Beratung oder Haftung für steuerliche Konsequenzen</li>
                    <li><strong>Compliance-Verstöße:</strong> Keine Verantwortung für Verstöße gegen nationale oder internationale Gesetze</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">15.3 Nutzer-Verantwortlichkeiten</h3>
                  <p className="section-text">
                    Nutzer sind ausschließlich selbst verantwortlich für:
                  </p>
                  <ul className="legal-list">
                    <li>Eigenständige Due-Diligence-Prüfungen vor jeder Transaktion</li>
                    <li>Professionelle Bewertungen und Authentifizierung von Assets</li>
                    <li>Rechtliche Beratung bezüglich Transaktionsstrukturen</li>
                    <li>Compliance mit allen geltenden Gesetzen und Vorschriften</li>
                    <li>Angemessene Versicherung und Risikomanagement</li>
                    <li>Steuerliche Beratung und Meldepflichten</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">15.4 Zahlungsabwicklung</h3>
                  <p className="section-text">
                    Zahlungen erfolgen über sichere Drittanbieter. ASSERO erhebt keine Transaktionsgebühren 
                    in der aktuellen Ausbauphase, behält sich aber vor, zukünftig angemessene Gebühren 
                    für Premium-Services zu erheben.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">15.5 Compliance und Regulierung</h3>
                  <p className="section-text">
                    Alle Transaktionen müssen den geltenden Gesetzen entsprechen, insbesondere:
                  </p>
                  <ul className="legal-list">
                    <li>Geldwäschegesetz (GwG)</li>
                    <li>Kreditwesengesetz (KWG)</li>
                    <li>Wertpapierhandelsgesetz (WpHG)</li>
                    <li>EU-Verordnungen zu Finanzdienstleistungen</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">16. Rechtliche Absicherung als Reiner Vermittler</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">16.1 Neutraler Intermediär-Status</h3>
                  <p className="section-text">
                    <strong>ASSERO ist ausschließlich als neutraler technischer Intermediär tätig.</strong> 
                    Wir fungieren weder als Makler, Handelsvertreter, Kommissionär noch als sonstiger 
                    Vertragspartner in Transaktionen. Unsere Rolle beschränkt sich auf die Bereitstellung 
                    einer technischen Plattform zur Kontaktaufnahme zwischen Nutzern.
                  </p>
                  <p className="section-text">
                    <strong>Keine Geschäftsbesorgung:</strong> ASSERO übernimmt keine Geschäftsbesorgung 
                    im Sinne des § 675 BGB. Wir führen keine Verhandlungen, schließen keine Verträge 
                    ab und übernehmen keine Verpflichtungen im Namen von Nutzern.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">16.2 Ausschluss von Makler- und Handelsvertreterrecht</h3>
                  <p className="section-text">
                    ASSERO ist weder Makler im Sinne des § 652 BGB noch Handelsvertreter im Sinne des 
                    § 84 HGB. Wir erfüllen keine der für diese Rechtsverhältnisse charakteristischen 
                    Pflichten und haben keinen Anspruch auf Provisionen oder sonstige Vergütungen 
                    aus Transaktionen zwischen Nutzern.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">16.3 Technische Dienstleistung ohne Rechtsberatung</h3>
                  <p className="section-text">
                    Unsere Leistungen beschränken sich auf die technische Bereitstellung der Plattform. 
                    Wir erteilen keine Rechtsberatung, keine Anlageberatung und keine sonstigen 
                    beratenden Leistungen. Nutzer sind verpflichtet, sich bei Bedarf professionelle 
                    Beratung einzuholen.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">17. Haftung für Drittanbieter-Services</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">17.1 Externe Services</h3>
                  <p className="section-text">
                    ASSERO integriert Services von Drittanbietern für:
                  </p>
                  <ul className="legal-list">
                    <li>Asset-Bewertungen und Authentifizierung</li>
                    <li>Zahlungsabwicklung</li>
                    <li>Identitätsverifikation</li>
                    <li>Versicherungsdienstleistungen</li>
                    <li>Logistik und Transport</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">17.2 Haftungsausschluss</h3>
                  <p className="section-text">
                    Wir haften nicht für Schäden, die durch Drittanbieter-Services entstehen. 
                    Nutzer sind verpflichtet, die AGB der jeweiligen Drittanbieter zu beachten.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">18. Versicherung und Risikomanagement</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">18.1 Nutzer-Verantwortung</h3>
                  <p className="section-text">
                    Nutzer sind selbst verantwortlich für:
                  </p>
                  <ul className="legal-list">
                    <li>Angemessene Versicherung ihrer Assets</li>
                    <li>Risikobewertung vor Transaktionen</li>
                    <li>Einhaltung von Transport- und Lagerbestimmungen</li>
                    <li>Steuerliche Verpflichtungen</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">18.2 Plattform-Versicherung</h3>
                  <p className="section-text">
                    ASSERO verfügt über eine Betriebshaftpflichtversicherung. Details zu 
                    Versicherungsschutz und Deckungssummen können auf Anfrage mitgeteilt werden.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">19. Geistiges Eigentum und Lizenzierung</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">19.1 Plattform-IP</h3>
                  <p className="section-text">
                    Alle Rechte an der ASSERO-Plattform, einschließlich Software, Design, 
                    Marken und Know-how, liegen bei ASSERO oder unseren Lizenzgebern.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">19.2 Nutzer-Lizenzen</h3>
                  <p className="section-text">
                    Nutzer erhalten eine begrenzte, nicht-exklusive Lizenz zur Nutzung der 
                    Plattform für ihre eigenen geschäftlichen Zwecke. Die Lizenz endet mit 
                    der Beendigung des Nutzungsvertrags.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">19.3 Asset-Bilder und Beschreibungen</h3>
                  <p className="section-text">
                    Nutzer gewähren ASSERO das Recht, hochgeladene Bilder und Beschreibungen 
                    für Marketing- und Plattform-Zwecke zu verwenden. Dieses Recht endet mit 
                    der Löschung des Assets.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">20. Datenschutz und Vertraulichkeit</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">20.1 Datenschutz-Compliance</h3>
                  <p className="section-text">
                    Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer 
                    <Link href="/privacy" className="legal-link"> Datenschutzerklärung</Link> 
                    und den geltenden Datenschutzgesetzen (DSGVO, BDSG).
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">20.2 Geschäftsgeheimnisse</h3>
                  <p className="section-text">
                    Nutzer verpflichten sich, alle als vertraulich markierten Informationen 
                    geheim zu halten, insbesondere:
                  </p>
                  <ul className="legal-list">
                    <li>Technische Details der Plattform</li>
                    <li>Geschäftsstrategien und -pläne</li>
                    <li>Nutzerdaten anderer Teilnehmer</li>
                    <li>Preisinformationen und Marktdaten</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">21. Force Majeure und höhere Gewalt</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">21.1 Definition</h3>
                  <p className="section-text">
                    Höhere Gewalt umfasst alle Umstände, die außerhalb unserer Kontrolle liegen 
                    und die Erfüllung unserer Verpflichtungen unmöglich machen, insbesondere:
                  </p>
                  <ul className="legal-list">
                    <li>Naturkatastrophen und extreme Wetterereignisse</li>
                    <li>Kriege, Terroranschläge und politische Unruhen</li>
                    <li>Pandemien und Gesundheitskrisen</li>
                    <li>Cyberangriffe und technische Ausfälle</li>
                    <li>Änderungen der Gesetzgebung</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">21.2 Rechtsfolgen</h3>
                  <p className="section-text">
                    Bei Eintritt höherer Gewalt sind wir von der Erfüllung unserer Verpflichtungen 
                    befreit, soweit die Umstände dies rechtfertigen. Wir werden angemessene 
                    Anstrengungen unternehmen, um die Auswirkungen zu minimieren.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-heading">22. Anhang: Community-Richtlinien</h2>
                
                <div className="subsection">
                  <h3 className="subsection-heading">22.1 Verhaltensregeln</h3>
                  <ul className="legal-list">
                    <li>Respektvoller und professioneller Umgang</li>
                    <li>Keine diskriminierenden oder beleidigenden Äußerungen</li>
                    <li>Wahrung der Vertraulichkeit</li>
                    <li>Konstruktive Beiträge zur Community</li>
                    <li>Ehrlichkeit bei Asset-Beschreibungen</li>
                    <li>Pünktlichkeit bei Terminen und Transaktionen</li>
                  </ul>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">22.2 Sanktionen</h3>
                  <p className="section-text">
                    Verstöße gegen die Community-Richtlinien können zu Verwarnungen, temporären 
                    Sperren oder dem Ausschluss führen. Bei schwerwiegenden Verstößen erfolgt 
                    der sofortige Ausschluss.
                  </p>
                </div>

                <div className="subsection">
                  <h3 className="subsection-heading">22.3 Beschwerdeverfahren</h3>
                  <p className="section-text">
                    Nutzer können sich über Verstöße anderer Nutzer beschweren. Wir prüfen 
                    alle Beschwerden sorgfältig und treffen angemessene Maßnahmen.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
