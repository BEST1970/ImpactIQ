// Standalone CFE crystal icon - pure SVG paths, no PNG artefacts
// Extracted from ProjectPlaybook/Logo/CFE.svg and Sidebar.tsx

interface CrystalIconProps {
  size?: number;
  className?: string;
}

export function CrystalIcon({ size = 44, className }: CrystalIconProps) {
  const h = Math.round(size * (55 / 47.63));
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 47.6299 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M23.812 0L11.9089 6.86985L23.812 13.7456L35.7209 6.86985L23.812 0Z" fill="#6EB550"/>
      <path d="M0 13.7456V27.4912L11.9089 20.6213V6.86987L0 13.7456Z" fill="#94C04C"/>
      <path d="M0 41.2485L11.9089 48.1184V34.3728V34.3669L0 27.4971V41.2485Z" fill="#6F65AA"/>
      <path d="M23.812 27.4971V41.2485L11.9089 34.3728V34.3669L23.812 27.4971Z" fill="#283375"/>
      <path d="M23.812 41.2485L11.9089 48.1184L23.812 55L35.7209 48.1184L23.812 41.2485Z" fill="#4663AA"/>
      <path d="M35.7209 34.3669V34.3728V48.1184L47.6299 41.2485V27.4971L35.7209 34.3669Z" fill="#58B3E6"/>
      <path d="M35.7209 20.6213V34.3669L23.812 27.4971L35.7209 20.6213Z" fill="#008C8A"/>
      <path d="M35.7209 6.86987V20.6213L47.6299 27.4971V13.7456L35.7209 6.86987Z" fill="#7BC5B5"/>
      <path d="M35.7209 34.3728V48.1184L23.812 41.2485L35.7209 34.3728Z" fill="#2455A2"/>
      <path d="M35.7209 6.86987V20.6213L23.812 13.7456L35.7209 6.86987Z" fill="#00A24B"/>
      <path d="M47.6299 27.4971L35.7209 34.3669V20.6213L47.6299 27.4971Z" fill="#00A4A8"/>
      <path d="M35.7209 20.6213L23.812 27.4971V13.7456L35.7209 20.6213Z" fill="#00833D"/>
      <path d="M35.7209 34.3669V34.3728L23.812 41.2485V27.4971L35.7209 34.3669Z" fill="#1A3F81"/>
      <path d="M23.812 13.7456L11.9089 20.6213V6.86987L23.812 13.7456Z" fill="#12A03C"/>
      <path d="M0 27.4971L11.9089 34.3669V20.6213L0 27.4971Z" fill="#466950"/>
      <path d="M23.812 27.4971L11.9089 34.3669V20.6213L23.812 27.4971Z" fill="#2B5B3F"/>
      <path d="M23.812 41.2485L11.9089 48.1184V34.3728L23.812 41.2485Z" fill="#313C90"/>
      <path d="M23.812 13.7456V27.4971L11.9089 20.6213L23.812 13.7456Z" fill="#008337"/>
    </svg>
  );
}
