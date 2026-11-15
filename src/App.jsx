import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, RotateCcw, ZoomIn, ZoomOut, Move, Image as ImageIcon, CheckCircle2 } from "lucide-react";

const CANVAS_SIZE = 1080; // Resolusi HD 1:1 untuk Instagram & WhatsApp
const TEMPLATE_SRC = "/twibbon-milad-114.png"; // File PNG transparan di folder public/
const BG_IMAGE_SRC = "/bg-milad.webp"; // File gambar background halaman di folder public/

export default function App() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [userImg, setUserImg] = useState(null);
  const [templateImg, setTemplateImg] = useState(null);

  // State transformasi foto
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Load gambar template twibbon saat komponen dimuat
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = TEMPLATE_SRC;
    img.onload = () => {
      setTemplateImg(img);
    };
  }, []);

  // Fungsi utama menggambar ke Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Bersihkan canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Background dasar putih di dalam area foto
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Gambar foto pengguna di layer bawah
    if (userImg) {
      ctx.save();
      // Pindahkan titik pusat ke tengah area lingkaran (sebelah kanan) + offset drag
      const centerX = 730 + position.x;
      const centerY = 550 + position.y;

      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);

      // Hitung rasio agar foto proporsional memenuhi area lingkaran (~750px)
      const targetSize = 750;
      const ratio = Math.max(targetSize / userImg.width, targetSize / userImg.height);
      const drawWidth = userImg.width * ratio;
      const drawHeight = userImg.height * ratio;

      ctx.drawImage(userImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }

    // 2. Gambar template Twibbon di layer paling atas
    if (templateImg) {
      ctx.drawImage(templateImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }, [userImg, templateImg, scale, position]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handler upload file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImg(img);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsDownloaded(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Konversi koordinat layar ke koordinat internal canvas (1080x1080)
  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleFactor = CANVAS_SIZE / rect.width;
    return {
      x: (clientX - rect.left) * scaleFactor,
      y: (clientY - rect.top) * scaleFactor,
    };
  };

  // Mouse & Touch Handlers untuk Drag
  const handlePointerDown = (e) => {
    if (!userImg) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const coords = getCanvasCoordinates(clientX, clientY);

    setIsDragging(true);
    setDragStart({
      x: coords.x - position.x,
      y: coords.y - position.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !userImg) return;
    if (e.cancelable) e.preventDefault(); // Mencegah layar HP ikut scroll saat menggeser foto

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const coords = getCanvasCoordinates(clientX, clientY);

    setPosition({
      x: coords.x - dragStart.x,
      y: coords.y - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Reset posisi & zoom
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Download hasil HD PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = `Twibbon-Milad-114-Muhammadiyah-PKU-Sruweng.png`;
    link.href = dataUrl;
    link.click();

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat text-slate-800 flex flex-col font-sans relative" style={{ backgroundImage: `url('${BG_IMAGE_SRC}')` }}>
      {/* Overlay lembut agar konten/kartu tetap menonjol & mudah dibaca */}
      <div className="min-h-screen bg-slate-900/40 backdrop-blur-[1px] flex flex-col">
        {/* Header / Navbar */}
        <header className="bg-gradient-to-r from-[#1E2D7D]/95 via-[#008E6B]/95 to-[#006B50]/95 text-white shadow-md border-b-4 border-[#D4AF37]">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Twibbon Milad ke-114 Muhammadiyah</h1>
              <p className="text-xs sm:text-sm text-emerald-100">RS PKU Muhammadiyah Sruweng</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Preview Canvas */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/50">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    className={`w-full h-full object-contain touch-none ${userImg ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer"}`}
                    onClick={() => !userImg && fileInputRef.current?.click()}
                  />

                  {/* Overlay petunjuk jika belum ada foto */}
                  {!userImg && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[1px] text-white p-6 text-center cursor-pointer transition hover:bg-slate-900/50"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#008E6B] border-2 border-[#D4AF37] flex items-center justify-center mb-3 shadow-lg">
                        <ImageIcon className="w-7 h-7 text-white" />
                      </div>
                      <p className="font-semibold text-base sm:text-lg drop-shadow">Klik di sini untuk memilih foto Anda</p>
                      <p className="text-xs text-slate-200 mt-1">Mendukung format JPG, PNG, atau WEBP</p>
                    </div>
                  )}
                </div>

                {userImg && (
                  <p className="text-xs text-center text-slate-600 mt-2.5 flex items-center justify-center gap-1.5 font-medium">
                    <Move className="w-3.5 h-3.5 text-[#008E6B]" />
                    Geser foto langsung pada layar untuk menyesuaikan posisi
                  </p>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Panel Kontrol */}
            <div className="lg:col-span-5 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/50 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#1E2D7D] border-b border-slate-200/80 pb-2">Sesuaikan Foto Anda</h2>
              </div>

              {/* Input File Hidden */}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              {/* Tombol Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-[#1E2D7D] hover:bg-[#162261] text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                {userImg ? "Ganti Foto Lain" : "Pilih Foto dari Galeri"}
              </button>

              {/* Kontrol Zoom & Reset */}
              <div className={`space-y-4 transition-opacity ${!userImg ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Perbesar / Perkecil (Zoom)</span>
                    <span className="text-[#008E6B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{Math.round(scale * 100)}%</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setScale((prev) => Math.max(0.3, +(prev - 0.1).toFixed(2)))}
                      className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>

                    <input type="range" min="0.3" max="2.5" step="0.02" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-[#008E6B] cursor-pointer" />

                    <button
                      type="button"
                      onClick={() => setScale((prev) => Math.min(2.5, +(prev + 0.1).toFixed(2)))}
                      className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tombol Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Posisi & Ukuran
                </button>
              </div>

              <hr className="border-slate-200/80" />

              {/* Tombol Download */}
              <button
                type="button"
                disabled={!userImg}
                onClick={handleDownload}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                  userImg ? "bg-gradient-to-r from-[#008E6B] to-[#007356] hover:from-[#00785a] hover:to-[#005c45] text-white border-b-2 border-[#D4AF37] cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isDownloaded ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                    Berhasil Diunduh Matur Nuwon!
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 text-[#D4AF37]" />
                    Donlot Twibbon
                  </>
                )}
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/90 backdrop-blur-sm border-t border-slate-200/80 py-4 text-center text-sm text-slate-600">
          &copy; {new Date().getFullYear()}{" "}
          <a href="https://brewocode.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
            brewocode.com
          </a>{" "}
          | RS PKU Muhammadiyah Sruweng • Milad ke-114 Muhammadiyah
        </footer>
      </div>
    </div>
  );
}
