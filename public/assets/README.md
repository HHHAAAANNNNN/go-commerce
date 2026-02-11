# Assets Directory

Folder ini digunakan untuk menyimpan semua aset gambar untuk aplikasi Go-Commerce.

## Struktur Folder

```
assets/
├── products/
│   ├── phones/          # Gambar produk ponsel
│   └── laptops/         # Gambar produk laptop
└── categories/          # Gambar kategori/banner
```

## Cara Menggunakan

### 1. Meletakkan Gambar Produk

**Ponsel:**
- Simpan gambar di: `public/assets/products/phones/`
- Format: `[product-name].jpg` atau `.png`
- Contoh: `iphone-15-pro-max.jpg`

**Laptop:**
- Simpan gambar di: `public/assets/products/laptops/`
- Format: `[product-name].jpg` atau `.png`
- Contoh: `macbook-pro-m3.jpg`

### 2. Mengakses Gambar di Kode

Di Next.js, gambar di folder `public/` bisa diakses langsung:

```tsx
import Image from 'next/image'

// Cara 1: Menggunakan Next.js Image component (recommended)
<Image 
  src="/assets/products/phones/iphone-15-pro-max.jpg"
  alt="iPhone 15 Pro Max"
  width={300}
  height={300}
  className="..."
/>

// Cara 2: HTML img tag biasa
<img 
  src="/assets/products/laptops/macbook-pro-m3.jpg" 
  alt="MacBook Pro M3" 
/>
```

### 3. Rekomendasi Format & Ukuran

**Product Cards:**
- Format: WebP (terbaik), JPG, atau PNG
- Ukuran: 800x800px (square)
- Max file size: < 200KB (optimized)

**Category Banners:**
- Format: WebP atau JPG
- Ukuran: 1920x600px (landscape)
- Max file size: < 300KB

**Thumbnails:**
- Format: WebP atau JPG
- Ukuran: 400x400px
- Max file size: < 100KB

### 4. Tools untuk Optimasi Gambar

- [TinyPNG](https://tinypng.com/) - Compress PNG/JPG
- [Squoosh](https://squoosh.app/) - Convert to WebP
- [ImageOptim](https://imageoptim.com/) - Batch optimization

### 5. Naming Convention

Gunakan format berikut untuk konsistensi:
```
[brand]-[model]-[variant].jpg

Contoh:
- apple-iphone-15-pro-max.jpg
- samsung-galaxy-s24-ultra.jpg
- dell-xps-15-2024.jpg
```

Lowercase, gunakan dash (-) sebagai separator, no spaces.

## Notes

- Jangan commit gambar ukuran besar (>1MB) ke repository
- Gunakan `.gitignore` jika file size besar
- Untuk production, consider menggunakan CDN (Cloudinary, Vercel Image Optimization, dll)
