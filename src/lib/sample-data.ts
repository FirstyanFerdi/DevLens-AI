import { SamplePreset } from './types';

// Crisp, high-contrast SVG images encoded as data URIs for instant client-side testing

const createSvgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const SVG_ECOMMERCE_FEATURE = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
  <rect width="900" height="500" fill="#F8FAFC" />
  <!-- Navbar -->
  <rect x="0" y="0" width="900" height="70" fill="#FFFFFF" />
  <line x1="0" y1="70" x2="900" y2="70" stroke="#E2E8F0" stroke-width="1" />
  
  <!-- Logo -->
  <circle cx="50" cy="35" r="16" fill="#39C5BB" />
  <text x="75" y="42" font-family="sans-serif" font-size="20" font-weight="bold" fill="#1E293B">MikuShop</text>
  
  <!-- Search Input -->
  <rect x="230" y="16" width="340" height="38" rx="19" fill="#F1F5F9" stroke="#CBD5E1" />
  <text x="250" y="40" font-family="sans-serif" font-size="14" fill="#64748B">Search products, tags, or categories...</text>
  
  <!-- Nav Actions -->
  <rect x="740" y="18" width="120" height="34" rx="17" fill="#39C5BB" />
  <text x="765" y="40" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF">Cart (3)</text>
  
  <!-- Hero Section -->
  <rect x="40" y="100" width="820" height="120" rx="16" fill="#E0F7F6" />
  <text x="70" y="150" font-family="sans-serif" font-size="24" font-weight="bold" fill="#2C3E50">Summer Tech Accessories Sale</text>
  <text x="70" y="180" font-family="sans-serif" font-size="14" fill="#475569">Explore 500+ curated developer mechanical keyboards and gadgets.</text>

  <!-- Product Grid Header -->
  <text x="45" y="260" font-family="sans-serif" font-size="18" font-weight="bold" fill="#1E293B">Popular Collections</text>
  
  <!-- Product Cards -->
  <rect x="40" y="280" width="250" height="180" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
  <rect x="55" y="295" width="220" height="90" rx="8" fill="#F1F5F9" />
  <text x="55" y="415" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1E293B">Miku Mechanical Keyboard</text>
  <text x="55" y="435" font-family="sans-serif" font-size="14" font-weight="bold" fill="#39C5BB">$149.00</text>

  <rect x="320" y="280" width="250" height="180" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
  <rect x="335" y="295" width="220" height="90" rx="8" fill="#F1F5F9" />
  <text x="335" y="415" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1E293B">Deskmat Sound Dampener</text>
  <text x="335" y="435" font-family="sans-serif" font-size="14" font-weight="bold" fill="#39C5BB">$39.00</text>

  <rect x="600" y="280" width="260" height="180" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
  <rect x="615" y="295" width="230" height="90" rx="8" fill="#F1F5F9" />
  <text x="615" y="415" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1E293B">Custom Keycap Artisan Set</text>
  <text x="615" y="435" font-family="sans-serif" font-size="14" font-weight="bold" fill="#39C5BB">$65.00</text>
</svg>
`);

const SVG_ERROR_STACK = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
  <rect width="900" height="500" fill="#0F172A" />
  <!-- Terminal Top Bar -->
  <rect x="0" y="0" width="900" height="36" fill="#1E293B" />
  <circle cx="20" cy="18" r="6" fill="#EF4444" />
  <circle cx="38" cy="18" r="6" fill="#F59E0B" />
  <circle cx="56" cy="18" r="6" fill="#10B981" />
  <text x="400" y="23" font-family="monospace" font-size="12" fill="#94A3B8">zsh — node ./src/server.ts</text>
  
  <!-- Terminal Text -->
  <text x="30" y="75" font-family="monospace" font-size="14" fill="#38BDF8">▲ Next.js 14.2.15 (Turbopack)</text>
  <text x="30" y="105" font-family="monospace" font-size="14" fill="#94A3B8">- Local:        http://localhost:3000</text>
  <text x="30" y="130" font-family="monospace" font-size="14" fill="#94A3B8">- Network:      http://192.168.1.105:3000</text>
  
  <text x="30" y="175" font-family="monospace" font-size="15" font-weight="bold" fill="#EF4444">TypeError: Cannot read properties of undefined (reading 'map')</text>
  <text x="50" y="210" font-family="monospace" font-size="13" fill="#E2E8F0">at ProductGrid (src/components/ProductGrid.tsx:34:18)</text>
  <text x="50" y="235" font-family="monospace" font-size="13" fill="#E2E8F0">at renderWithHooks (node_modules/react-dom/cjs/react-dom-server.node.development.js:5658:16)</text>
  <text x="50" y="260" font-family="monospace" font-size="13" fill="#E2E8F0">at renderIndeterminateComponent (node_modules/react-dom/cjs/react-dom-server.node.development.js:5731:15)</text>
  
  <text x="30" y="310" font-family="monospace" font-size="13" fill="#FACC15">Environment Dump (Leak Detected):</text>
  <text x="30" y="335" font-family="monospace" font-size="13" fill="#F87171">OPENAI_API_KEY=sk-proj-DEMO_MOCK_SECRET_KEY_DEV_TEST_9988776655</text>
  <text x="30" y="360" font-family="monospace" font-size="13" fill="#F87171">DATABASE_URL=postgres://demo_user:mock_password@db.example.internal:5432/sample_db</text>
  <text x="30" y="385" font-family="monospace" font-size="13" fill="#94A3B8">NODE_ENV=production</text>
  
  <text x="30" y="440" font-family="monospace" font-size="13" fill="#475569">> [Fast Refresh] rebuilding due to crash...</text>
</svg>
`);

const SVG_CODE_REFACTOR = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
  <rect width="900" height="500" fill="#181824" />
  <!-- IDE Tab Bar -->
  <rect x="0" y="0" width="900" height="38" fill="#1F1F2E" />
  <rect x="20" y="6" width="160" height="32" rx="6" fill="#181824" />
  <text x="40" y="26" font-family="monospace" font-size="13" fill="#39C5BB">calculateCart.js</text>
  
  <!-- Code Lines -->
  <g font-family="monospace" font-size="14">
    <text x="30" y="70" fill="#6B7280">1</text>
    <text x="60" y="70" fill="#FF7B72">function</text>
    <text x="135" y="70" fill="#D2A8FF">processCartOrders</text>
    <text x="280" y="70" fill="#E6EDF3">(orders, discountCode) {</text>

    <text x="30" y="100" fill="#6B7280">2</text>
    <text x="80" y="100" fill="#FF7B72">var</text>
    <text x="115" y="100" fill="#79C0FF">total</text>
    <text x="165" y="100" fill="#E6EDF3">= 0;</text>

    <text x="30" y="130" fill="#6B7280">3</text>
    <text x="80" y="130" fill="#FF7B72">for</text>
    <text x="115" y="130" fill="#E6EDF3">(var i = 0; i &lt; orders.length; i++) {</text>

    <text x="30" y="160" fill="#6B7280">4</text>
    <text x="110" y="160" fill="#79C0FF">total</text>
    <text x="160" y="160" fill="#E6EDF3">+= orders[i].price * orders[i].qty;</text>

    <text x="30" y="190" fill="#6B7280">5</text>
    <text x="80" y="190" fill="#E6EDF3">}</text>

    <text x="30" y="220" fill="#6B7280">6</text>
    <text x="80" y="220" fill="#FF7B72">if</text>
    <text x="105" y="220" fill="#E6EDF3">(discountCode == "SUMMER20") {</text>

    <text x="30" y="250" fill="#6B7280">7</text>
    <text x="110" y="250" fill="#79C0FF">total</text>
    <text x="160" y="250" fill="#E6EDF3">= total * 0.8;</text>

    <text x="30" y="280" fill="#6B7280">8</text>
    <text x="80" y="280" fill="#E6EDF3">}</text>

    <text x="30" y="310" fill="#6B7280">9</text>
    <text x="80" y="310" fill="#FF7B72">return</text>
    <text x="140" y="310" fill="#E6EDF3">{ finalTotal: total, status: "SUCCESS" };</text>

    <text x="30" y="340" fill="#6B7280">10</text>
    <text x="60" y="340" fill="#E6EDF3">}</text>
  </g>
</svg>
`);

const SVG_WIREFRAME = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
  <rect width="900" height="500" fill="#FFFFFF" />
  <!-- Wireframe Blueprint Grid -->
  <line x1="0" y1="60" x2="900" y2="60" stroke="#000000" stroke-width="2" stroke-dasharray="4" />
  <rect x="30" y="15" width="120" height="30" fill="none" stroke="#000000" stroke-width="2" />
  <text x="45" y="35" font-family="monospace" font-size="12" fill="#000000">[LOGO]</text>
  
  <rect x="680" y="15" width="80" height="30" fill="none" stroke="#000000" stroke-width="2" />
  <text x="695" y="35" font-family="monospace" font-size="12" fill="#000000">[NAV 1]</text>
  <rect x="780" y="15" width="80" height="30" fill="none" stroke="#000000" stroke-width="2" />
  <text x="795" y="35" font-family="monospace" font-size="12" fill="#000000">[NAV 2]</text>

  <!-- Left Sidebar -->
  <rect x="30" y="80" width="200" height="380" fill="none" stroke="#000000" stroke-width="2" stroke-dasharray="2" />
  <text x="50" y="110" font-family="monospace" font-size="12" fill="#000000">[SIDEBAR MENU]</text>

  <!-- Main Content Cards -->
  <rect x="250" y="80" width="610" height="150" fill="none" stroke="#000000" stroke-width="2" />
  <text x="450" y="160" font-family="monospace" font-size="14" fill="#000000">[HERO BANNER]</text>

  <rect x="250" y="250" width="190" height="210" fill="none" stroke="#000000" stroke-width="2" />
  <text x="290" y="360" font-family="monospace" font-size="12" fill="#000000">[CARD A]</text>

  <rect x="460" y="250" width="190" height="210" fill="none" stroke="#000000" stroke-width="2" />
  <text x="500" y="360" font-family="monospace" font-size="12" fill="#000000">[CARD B]</text>

  <rect x="670" y="250" width="190" height="210" fill="none" stroke="#000000" stroke-width="2" />
  <text x="710" y="360" font-family="monospace" font-size="12" fill="#000000">[CARD C]</text>
</svg>
`);

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'feature-dropdown',
    title: 'UI Feature Request',
    subtitle: 'E-Commerce Filter Dropdown',
    intent: 'add-feature',
    userInstruction: 'Tambahkan dropdown filter kategori di area yang ditandai kotak.',
    imageSrc: SVG_ECOMMERCE_FEATURE,
    initialAnnotations: [
      {
        id: 'box-1',
        type: 'box',
        x: 585,
        y: 16,
        width: 140,
        height: 38,
        label: 'Filter Area',
        color: '#39C5BB',
        strokeWidth: 2,
      },
    ],
  },
  {
    id: 'error-stacktrace',
    title: 'Bug & Crash Log',
    subtitle: 'Next.js TypeError & Leak',
    intent: 'fix-bug',
    userInstruction: 'Identifikasi penyebab crash TypeError dan perbaiki kode dengan defensive null checking.',
    imageSrc: SVG_ERROR_STACK,
    initialAnnotations: [
      {
        id: 'box-err',
        type: 'box',
        x: 25,
        y: 160,
        width: 600,
        height: 120,
        label: 'Error Stack',
        color: '#FF6B9D',
        strokeWidth: 2,
      },
    ],
  },
  {
    id: 'code-refactor',
    title: 'Code Refactoring',
    subtitle: 'Legacy Cart Function to TypeScript',
    intent: 'refactor-code',
    userInstruction: 'Refactor fungsi ini ke TypeScript ketat dengan interface terdefinisi dan immutable calculation.',
    imageSrc: SVG_CODE_REFACTOR,
    initialAnnotations: [
      {
        id: 'box-code',
        type: 'box',
        x: 50,
        y: 50,
        width: 650,
        height: 310,
        label: 'Target Function',
        color: '#39C5BB',
        strokeWidth: 2,
      },
    ],
  },
  {
    id: 'spatial-wireframe',
    title: 'Spatial Wireframe',
    subtitle: 'Dashboard 32x32 Grid',
    intent: 'spatial-wireframe',
    userInstruction: 'Konversi wireframe ini menjadi layout responsif Tailwind CSS (Sidebar + Hero + 3 Cards).',
    imageSrc: SVG_WIREFRAME,
    initialAnnotations: [
      {
        id: 'pin-1',
        type: 'pin',
        x: 130,
        y: 270,
        width: 32,
        height: 32,
        label: '1',
        color: '#39C5BB',
      },
      {
        id: 'pin-2',
        type: 'pin',
        x: 550,
        y: 150,
        width: 32,
        height: 32,
        label: '2',
        color: '#FF6B9D',
      },
    ],
  },
];
