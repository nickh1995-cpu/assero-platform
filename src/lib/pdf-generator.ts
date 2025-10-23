import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ValuationData {
  asset_type: string;
  form_data: any;
  estimated_value: number;
  value_min: number;
  value_max: number;
  title?: string;
  created_at?: string;
}

export function generateValuationPDF(data: ValuationData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ASSERO Colors
  const inkColor: [number, number, number] = [16, 34, 49]; // #102231
  const blueColor: [number, number, number] = [44, 90, 120]; // #2c5a78
  const goldColor: [number, number, number] = [199, 167, 112]; // #c7a770

  // ===== PAGE 1: HEADER & VALUATION =====
  
  // Header Background
  doc.setFillColor(...blueColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo/Title
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSERO', 20, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Asset Valuation Report', 20, 32);

  // Date
  doc.setFontSize(9);
  const date = data.created_at 
    ? new Date(data.created_at).toLocaleDateString('de-DE')
    : new Date().toLocaleDateString('de-DE');
  doc.text(date, pageWidth - 20, 25, { align: 'right' });

  // Title
  doc.setTextColor(...inkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const title = data.title || 'Asset-Bewertung';
  doc.text(title, 20, 55);

  // Asset Type Badge
  const assetTypeLabel = getAssetTypeLabel(data.asset_type);
  doc.setFillColor(...goldColor);
  doc.roundedRect(20, 62, 40, 8, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(assetTypeLabel, 40, 67.5, { align: 'center' });

  // Main Valuation Box
  doc.setDrawColor(...blueColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 80, pageWidth - 40, 45, 3, 3);

  // Valuation Label
  doc.setFontSize(11);
  doc.setTextColor(...blueColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Geschätzter Marktwert', pageWidth / 2, 92, { align: 'center' });

  // Estimated Value (Large)
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...inkColor);
  const formattedValue = formatCurrency(data.estimated_value);
  doc.text(formattedValue, pageWidth / 2, 108, { align: 'center' });

  // Value Range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  const rangeText = `Bewertungsspanne: ${formatCurrency(data.value_min)} - ${formatCurrency(data.value_max)}`;
  doc.text(rangeText, pageWidth / 2, 118, { align: 'center' });

  // Asset Details Table
  const details = extractAssetDetails(data.asset_type, data.form_data);
  
  autoTable(doc, {
    startY: 135,
    head: [['Merkmal', 'Wert']],
    body: details,
    theme: 'striped',
    headStyles: {
      fillColor: blueColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    bodyStyles: {
      fontSize: 10,
      textColor: inkColor
    },
    alternateRowStyles: {
      fillColor: [244, 247, 250]
    },
    margin: { left: 20, right: 20 }
  });

  // ===== PAGE 2: METHODOLOGY & DISCLAIMER =====
  doc.addPage();

  // Section: Bewertungsmethodik
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blueColor);
  doc.text('Bewertungsmethodik', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...inkColor);
  const methodologyText = getMethodologyText(data.asset_type);
  const methodologySplit = doc.splitTextToSize(methodologyText, pageWidth - 40);
  doc.text(methodologySplit, 20, 35);

  // Section: Marktfaktoren
  let currentY = 35 + (methodologySplit.length * 5) + 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blueColor);
  doc.text('Berücksichtigte Marktfaktoren', 20, currentY);

  currentY += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...inkColor);

  const factors = [
    '✓ Aktuelle Marktpreise und Transaktionsdaten',
    '✓ Asset-spezifische Eigenschaften und Zustand',
    '✓ Geografische Lage und regionale Markttrends',
    '✓ Angebots- und Nachfragesituation',
    '✓ Saisonale Schwankungen und Marktzyklen',
    '✓ Vergleichbare Assets (Comparable Sales Method)'
  ];

  factors.forEach((factor, index) => {
    doc.text(factor, 25, currentY + (index * 7));
  });

  currentY += (factors.length * 7) + 15;

  // Section: Disclaimer
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 25;
  }

  doc.setFillColor(255, 243, 205);
  doc.roundedRect(20, currentY, pageWidth - 40, 45, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...inkColor);
  doc.text('⚠️ Wichtiger Hinweis', 25, currentY + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const disclaimerText = `Diese Bewertung wurde algorithmisch erstellt und basiert auf aktuellen Marktdaten, vergleichbaren Assets und den von Ihnen angegebenen Informationen. Sie dient ausschließlich zu Informationszwecken und stellt keine verbindliche Wertermittlung dar. Für rechtlich bindende Bewertungen konsultieren Sie bitte einen zertifizierten Gutachter oder Sachverständigen. ASSERO übernimmt keine Haftung für Entscheidungen, die auf Basis dieser Bewertung getroffen werden.`;
  const disclaimerSplit = doc.splitTextToSize(disclaimerText, pageWidth - 50);
  doc.text(disclaimerSplit, 25, currentY + 18);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('© ASSERO - Asset Valuation Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('www.assero.com', pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc;
}

// Helper Functions

function getAssetTypeLabel(type: string): string {
  switch (type) {
    case 'real-estate': return 'IMMOBILIE';
    case 'luxusuhren': return 'LUXUSUHR';
    case 'fahrzeuge': return 'FAHRZEUG';
    default: return 'ASSET';
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

function extractAssetDetails(assetType: string, formData: any): string[][] {
  const details: string[][] = [];

  if (assetType === 'real-estate') {
    if (formData.locationAddress) details.push(['Standort', formData.locationAddress]);
    if (formData.propertyType) details.push(['Immobilientyp', getPropertyTypeLabel(formData.propertyType)]);
    if (formData.areaSqm) details.push(['Wohnfläche', `${formData.areaSqm} m²`]);
    if (formData.rooms) details.push(['Zimmer', formData.rooms.toString()]);
    if (formData.buildYear) details.push(['Baujahr', formData.buildYear.toString()]);
    if (formData.condition) details.push(['Zustand', getConditionLabel(formData.condition)]);
    if (formData.floor) details.push(['Etage', formData.floor]);
    if (formData.energyRating) details.push(['Energieausweis', formData.energyRating]);
    
    // Ausstattung
    const features = [];
    if (formData.hasBalcony) features.push('Balkon');
    if (formData.hasGarage) features.push('Garage');
    if (formData.hasKitchen) features.push('Einbauküche');
    if (formData.hasElevator) features.push('Aufzug');
    if (formData.hasGarden) features.push('Garten');
    if (features.length > 0) {
      details.push(['Ausstattung', features.join(', ')]);
    }
  }

  if (assetType === 'luxusuhren') {
    if (formData.watchBrand) details.push(['Marke', formData.watchBrand]);
    if (formData.watchModel) details.push(['Modell', formData.watchModel]);
    if (formData.watchReference) details.push(['Referenznummer', formData.watchReference]);
    if (formData.watchYear) details.push(['Herstellungsjahr', formData.watchYear.toString()]);
    if (formData.watchCondition) details.push(['Zustand', getWatchConditionLabel(formData.watchCondition)]);
    
    const provenance = [];
    if (formData.hasBox) provenance.push('Original-Box');
    if (formData.hasPapers) provenance.push('Papiere');
    if (formData.hasServiceHistory) provenance.push('Service-Historie');
    if (provenance.length > 0) {
      details.push(['Provenienz', provenance.join(', ')]);
    }
    
    if (formData.isLimitedEdition) details.push(['Limited Edition', 'Ja']);
    if (formData.isUnpolished) details.push(['Unpoliert', 'Ja']);
  }

  if (assetType === 'fahrzeuge') {
    if (formData.vehicleBrand) details.push(['Marke', formData.vehicleBrand]);
    if (formData.vehicleModel) details.push(['Modell', formData.vehicleModel]);
    if (formData.vehicleType) details.push(['Fahrzeugtyp', getVehicleTypeLabel(formData.vehicleType)]);
    if (formData.vehicleYear) details.push(['Herstellungsjahr', formData.vehicleYear.toString()]);
    if (formData.firstRegistration) details.push(['Erstzulassung', formData.firstRegistration.toString()]);
    if (formData.mileageKm) details.push(['Laufleistung', `${formData.mileageKm.toLocaleString('de-DE')} km`]);
    if (formData.vehicleColor) details.push(['Farbe', formData.vehicleColor]);
    if (formData.vehicleCondition) details.push(['Zustand', getVehicleConditionLabel(formData.vehicleCondition)]);
    if (formData.previousOwners !== undefined) details.push(['Vorbesitzer', formData.previousOwners.toString()]);
    
    const history = [];
    if (formData.isAccidentFree) history.push('Unfallfrei');
    if (formData.hasServiceBook) history.push('Scheckheftgepflegt');
    if (formData.hasWarranty) history.push('Garantie');
    if (history.length > 0) {
      details.push(['Historie', history.join(', ')]);
    }
  }

  return details;
}

function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'wohnung': 'Wohnung',
    'haus': 'Haus',
    'penthouse': 'Penthouse',
    'reihenhaus': 'Reihenhaus',
    'doppelhaushaelfte': 'Doppelhaushälfte'
  };
  return labels[type] || type;
}

function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    'new': 'Neubau',
    'saniert': 'Saniert',
    'renovated': 'Renoviert',
    'good': 'Gut',
    'needs_renovation': 'Renovierungsbedürftig'
  };
  return labels[condition] || condition;
}

function getWatchConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    'mint': 'Neuwertig',
    'very_good': 'Sehr gut',
    'good': 'Gut',
    'fair': 'Ausreichend'
  };
  return labels[condition] || condition;
}

function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'sportwagen': 'Sportwagen',
    'coupe': 'Coupé',
    'cabrio': 'Cabriolet',
    'suv': 'SUV',
    'limousine': 'Limousine',
    'kombi': 'Kombi'
  };
  return labels[type] || type;
}

function getVehicleConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    'excellent': 'Neuwertig',
    'good': 'Gut',
    'used': 'Gebraucht'
  };
  return labels[condition] || condition;
}

function getMethodologyText(assetType: string): string {
  switch (assetType) {
    case 'real-estate':
      return 'Die Immobilienbewertung erfolgt anhand der Vergleichswertmethode, bei der ähnliche Objekte in vergleichbarer Lage herangezogen werden. Berücksichtigt werden Faktoren wie Wohnfläche, Zimmeranzahl, Baujahr, Zustand, Lage sowie Ausstattungsmerkmale. Zusätzlich fließen aktuelle Marktdaten und regionale Preisentwicklungen in die Bewertung ein.';
    
    case 'luxusuhren':
      return 'Die Bewertung von Luxusuhren basiert auf einer Kombination aus Markenwert, Modellbeliebtheit, Zustand, Alter und Verfügbarkeit. Besonderer Fokus liegt auf der Vollständigkeit der Dokumentation (Box, Papiere, Service-Historie) sowie Seltenheitsfaktoren wie limitierte Editionen. Marktpreise werden kontinuierlich aus internationalen Handelsplattformen und Auktionshäusern aktualisiert.';
    
    case 'fahrzeuge':
      return 'Die Fahrzeugbewertung erfolgt unter Berücksichtigung von Marke, Modell, Baujahr, Laufleistung, Zustand und Ausstattung. Ein besonderes Augenmerk liegt auf der Fahrzeughistorie (Unfallfreiheit, Scheckheft, Vorbesitzer) sowie regionalen Preisunterschieden. Die Bewertung basiert auf aktuellen Marktdaten aus Gebrauchtwagenportalen und Händlerpreisen.';
    
    default:
      return 'Die Bewertung erfolgt anhand von Marktdaten, Asset-Spezifikationen und aktuellen Trends.';
  }
}

