"use client";

import React, { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase"; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// --- Definisi Tipe Data ---
interface DesignImage {
  id: string;
  url: string;
  title: string;
  filename: string;
  createdAt: number;
}

interface VideoLink {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

interface PdfLink {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State: Graphic Design
  const [images, setImages] = useState<DesignImage[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // State: Cinematic Video
  const [videos, setVideos] = useState<VideoLink[]>([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  // State: PDF Documents
  const [pdfs, setPdfs] = useState<PdfLink[]>([]);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isSubmittingPdf, setIsSubmittingPdf] = useState(false);

  // --- Efek Samping: Cek Auth & Tarik Data Realtime ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const qDesigns = query(collection(db, "graphic_designs"), orderBy("createdAt", "desc"));
    const unsubDesigns = onSnapshot(qDesigns, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DesignImage[]);
    });

    const qVideos = query(collection(db, "cinematic_videos"), orderBy("createdAt", "desc"));
    const unsubVideos = onSnapshot(qVideos, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VideoLink[]);
    });

    const qPdfs = query(collection(db, "pdf_designs"), orderBy("createdAt", "desc"));
    const unsubPdfs = onSnapshot(qPdfs, (snapshot) => {
      setPdfs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PdfLink[]);
    });

    return () => {
      unsubscribeAuth();
      unsubDesigns();
      unsubVideos();
      unsubPdfs();
    };
  }, []);

  // --- Fungsi: Autentikasi ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert("Login gagal: " + error.message);
    }
  };

  // --- Fungsi: Graphic Design ---
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return alert("Pilih file dan isi judul!");
    setIsUploading(true);
    try {
      const uniqueFilename = `${Date.now()}_${uploadFile.name}`;
      const storageRef = ref(storage, `graphic_designs/${uniqueFilename}`);
      await uploadBytes(storageRef, uploadFile);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "graphic_designs"), {
        url: downloadURL,
        title: uploadTitle,
        filename: uniqueFilename,
        createdAt: Date.now(),
      });
      setUploadFile(null);
      setUploadTitle("");
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: string, filename: string) => {
    if (!confirm("Hapus karya visual ini?")) return;
    try {
      await deleteObject(ref(storage, `graphic_designs/${filename}`));
      await deleteDoc(doc(db, "graphic_designs", id));
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  // --- Fungsi: Cinematic Video ---
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl) return alert("Isi judul dan URL!");
    
    let finalUrl = videoUrl;
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/gi;
    const match = ytRegex.exec(videoUrl);

    if (match && match[1]) {
      finalUrl = `https://www.youtube.com/embed/${match[1]}`;
    }

    setIsSubmittingVideo(true);
    try {
      await addDoc(collection(db, "cinematic_videos"), {
        title: videoTitle,
        url: finalUrl,
        createdAt: Date.now(),
      });
      setVideoTitle("");
      setVideoUrl("");
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Hapus tautan video ini?")) return;
    try {
      await deleteDoc(doc(db, "cinematic_videos", id));
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  // --- Fungsi: PDF Documents ---
  const handleAddPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfTitle || !pdfUrl) return alert("Isi judul dan link PDF!");
    
    let finalUrl = pdfUrl;
    const driveRegex = /\/file\/d\/([^\/]+)/;
    const match = driveRegex.exec(pdfUrl);
    
    if (match && match[1]) {
      finalUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
    } else {
      return alert("Link Google Drive tidak valid! Pastikan Anda menyalin link Share dari Google Drive.");
    }

    setIsSubmittingPdf(true);
    try {
      await addDoc(collection(db, "pdf_designs"), {
        title: pdfTitle,
        url: finalUrl,
        createdAt: Date.now(),
      });
      setPdfTitle("");
      setPdfUrl("");
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setIsSubmittingPdf(false);
    }
  };

  const handleDeletePdf = async (id: string) => {
    if (!confirm("Hapus dokumen PDF ini?")) return;
    try {
      await deleteDoc(doc(db, "pdf_designs", id));
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  // --- UI: Halaman Login ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 mb-6 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition">Login</button>
        </form>
      </div>
    );
  }

  // --- UI: Dasbor Utama ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={() => signOut(auth)} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* KOLOM 1: GRAPHIC DESIGN */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500"></span> Graphic Design</h2>
            <form onSubmit={handleUploadImage} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">
              <input type="text" placeholder="Judul Karya Visual" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" required />
              <input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" required />
              <button type="submit" disabled={isUploading} className="bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-emerald-300">
                {isUploading ? "Mengunggah..." : "Upload Gambar"}
              </button>
            </form>
            <div className="grid grid-cols-2 gap-4">
              {images.map((img) => (
                <div key={img.id} className="bg-white p-2 rounded-xl border border-slate-200 relative group">
                  <img src={img.url} alt={img.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                  <p className="text-xs font-semibold truncate px-1">{img.title}</p>
                  <button onClick={() => handleDeleteImage(img.id, img.filename)} className="absolute top-3 right-3 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM 2: CINEMATIC VIDEO */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-500"></span> Cinematic Video</h2>
            <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">
              <input type="text" placeholder="Judul Video" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="text" placeholder="URL YouTube / Vimeo" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              <button type="submit" disabled={isSubmittingVideo} className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300">
                {isSubmittingVideo ? "Menyimpan..." : "Simpan Tautan Video"}
              </button>
            </form>
            <div className="flex flex-col gap-4">
              {videos.map((vid) => (
                <div key={vid.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start gap-4">
                  <div className="w-24 aspect-video bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    <iframe src={vid.url} className="w-full h-full pointer-events-none" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{vid.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{vid.url}</p>
                  </div>
                  <button onClick={() => handleDeleteVideo(vid.id)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-2 py-1 rounded shrink-0">Hapus</button>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM 3: PDF DOCUMENTS */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-orange-500"></span> PDF Documents</h2>
            <form onSubmit={handleAddPdf} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">
              <input type="text" placeholder="Judul Dokumen (Misal: Brand Guideline)" value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" required />
              <input type="url" placeholder="Share Link Google Drive" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" required />
              <button type="submit" disabled={isSubmittingPdf} className="bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 disabled:bg-orange-300">
                {isSubmittingPdf ? "Menyimpan..." : "Simpan Link PDF"}
              </button>
            </form>
            <div className="flex flex-col gap-4">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start gap-4">
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{pdf.title}</h4>
                    <a href={pdf.url.replace('/preview', '/view')} target="_blank" className="text-[10px] text-orange-500 hover:underline mt-1 block truncate">Buka di Tab Baru ↗</a>
                  </div>
                  <button onClick={() => handleDeletePdf(pdf.id)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-2 py-1 rounded shrink-0">Hapus</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}