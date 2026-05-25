"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface DesignImage {
  id: string;
  url: string;
  title: string;
}

interface VideoLink {
  id: string;
  url: string;
  title: string;
}

interface PdfLink {
  id: string;
  url: string;
  title: string;
}

export default function CreativePortfolio() {
  const [designs, setDesigns] = useState<DesignImage[]>([]);
  const [videos, setVideos] = useState<VideoLink[]>([]);
  const [pdfs, setPdfs] = useState<PdfLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const qDesigns = query(collection(db, "graphic_designs"), orderBy("createdAt", "desc"));
    const unsubDesigns = onSnapshot(qDesigns, (snapshot) => {
      setDesigns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DesignImage[]);
    });

    const qVideos = query(collection(db, "cinematic_videos"), orderBy("createdAt", "desc"));
    const unsubVideos = onSnapshot(qVideos, (snapshot) => {
      setVideos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as VideoLink[]);
    });

    const qPdfs = query(collection(db, "pdf_designs"), orderBy("createdAt", "desc"));
    const unsubPdfs = onSnapshot(qPdfs, (snapshot) => {
      setPdfs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PdfLink[]);
      setIsLoading(false);
    });

    return () => {
      unsubDesigns();
      unsubVideos();
      unsubPdfs();
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500 selection:text-white pb-24">
      {/* HEADER NAV */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-neutral-400 hover:text-white transition flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Kembali
          </Link>
          <h1 className="text-sm font-bold tracking-widest uppercase text-neutral-300">Creative Media</h1>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Visual <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Storytelling.</span>
        </h2>
        <p className="text-neutral-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          Eksplorasi visual melalui desain grafis yang komunikatif dan video sinematik yang menggugah emosi.
        </p>
      </section>

      {/* SEKSI 1: GRAPHIC DESIGN */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-neutral-100">
          <span className="w-8 h-[2px] bg-emerald-500"></span>
          Graphic Design & Branding
        </h3>
        
        {designs.length === 0 && !isLoading ? (
          <div className="text-center text-neutral-500 py-10 border border-neutral-800 border-dashed rounded-2xl">
            Belum ada karya desain yang diunggah.
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {designs.map((item) => (
              <div key={item.id} className="break-inside-avoid relative group rounded-xl overflow-hidden border border-neutral-800 hover:border-emerald-500/50 transition-colors bg-neutral-900 cursor-pointer">
                <img src={item.url} alt={item.title} className="w-full h-auto block" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white font-medium text-sm">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEKSI 2: CINEMATIC VIDEO & EDITING */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-neutral-100">
          <span className="w-8 h-[2px] bg-blue-500"></span>
          Cinematic Video & Editing
        </h3>
        
        {videos.length === 0 && !isLoading ? (
          <div className="text-center text-neutral-500 py-10 border border-neutral-800 border-dashed rounded-2xl">
            Belum ada tautan video yang ditambahkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((vid, index) => (
              <div 
                key={vid.id} 
                className={`aspect-video w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl relative ${
                  index === 0 ? "md:col-span-2 rounded-3xl" : ""
                }`}
              >
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={vid.url} 
                  title={vid.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEKSI 3: DOKUMEN & CASE STUDIES (PDF) */}
      <section className="max-w-7xl mx-auto px-6">
        <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-neutral-100">
          <span className="w-8 h-[2px] bg-orange-500"></span>
          Documents & Case Studies
        </h3>
        
        {pdfs.length === 0 && !isLoading ? (
          <div className="text-center text-neutral-500 py-10 border border-neutral-800 border-dashed rounded-2xl">
            Belum ada dokumen PDF yang ditambahkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="flex flex-col gap-4">
                <div className="aspect-[4/3] w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
                  <iframe 
                    src={pdf.url} 
                    title={pdf.title}
                    width="100%" 
                    height="100%" 
                    allow="autoplay"
                    className="bg-white"
                  ></iframe>
                </div>
                <div className="flex justify-between items-center px-2">
                  <h4 className="font-bold text-neutral-200 truncate pr-4">{pdf.title}</h4>
                  <a 
                    href={pdf.url.replace('/preview', '/view')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-full transition shrink-0"
                  >
                    Buka Full Screen ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}