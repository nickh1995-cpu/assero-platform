import styles from './AssetSelection.module.css';

type AssetType = 'real-estate' | 'luxusuhren' | 'fahrzeuge';

interface AssetOption {
  id: AssetType;
  icon: string;
  title: string;
  description: string;
  examples: string[];
}

interface AssetSelectionProps {
  selectedAsset: AssetType | null;
  onSelect: (asset: AssetType) => void;
}

const ASSET_OPTIONS: AssetOption[] = [
  {
    id: 'real-estate',
    icon: '🏢',
    title: 'Immobilien',
    description: 'Wohnungen, Häuser, Gewerbe',
    examples: ['Penthouse', 'Stadthaus', 'Eigentumswohnung'],
  },
  {
    id: 'luxusuhren',
    icon: '⌚',
    title: 'Luxusuhren',
    description: 'Rolex, Patek Philippe, AP',
    examples: ['Daytona', 'Nautilus', 'Royal Oak'],
  },
  {
    id: 'fahrzeuge',
    icon: '🏎️',
    title: 'Fahrzeuge',
    description: 'Sportwagen, Luxuslimousinen',
    examples: ['911 Turbo S', 'S-Class', 'Urus'],
  },
];

export default function AssetSelection({ selectedAsset, onSelect }: AssetSelectionProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Wählen Sie Ihre Asset-Kategorie</h2>
        <p className={styles.subtitle}>
          Professionelle Bewertung für Immobilien, Luxusuhren und Fahrzeuge
        </p>
      </div>

      <div className={styles.grid}>
        {ASSET_OPTIONS.map((asset) => {
          const isSelected = selectedAsset === asset.id;
          
          return (
            <button
              key={asset.id}
              type="button"
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelect(asset.id)}
            >
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{asset.icon}</span>
              </div>
              
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{asset.title}</h3>
                <p className={styles.description}>{asset.description}</p>
                
                <div className={styles.examples}>
                  {asset.examples.map((example) => (
                    <span key={example} className={styles.exampleTag}>
                      {example}
                    </span>
                  ))}
                </div>
              </div>
              
              {isSelected && (
                <div className={styles.checkmark}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

