"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Tambahan import Firebase
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

interface ITProject {
  id: string;
  title: string;
  description: string;
  tags: string[]; 
  githubUrl: string;
  demoUrl: string;
}

interface DesignImage {
  id: string;
  url: string;
  title: string;
}

export default function Home() {
  // State untuk Proyek IT (GitHub)
  const [itProjects, setItProjects] = useState<ITProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [githubError, setGithubError] = useState("");

  // State untuk Karya Desain (Firebase)
  const [featuredDesigns, setFeaturedDesigns] = useState<DesignImage[]>([]);
  const [isDesignsLoading, setIsDesignsLoading] = useState(true);

  // Effect untuk menarik data GitHub
  useEffect(() => {
    const fetchGitHubRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/billyaf/repos?sort=updated&per_page=6');
        
        if (!response.ok) {
          if (response.status === 403) throw new Error("Limit request GitHub tercapai (Max 60/jam). Silakan coba lagi nanti.");
          if (response.status === 404) throw new Error("Username GitHub tidak ditemukan.");
          throw new Error("Gagal mengambil data dari GitHub");
        }
        
        const data = await response.json();
        
        const formattedProjects = data.map((repo: any) => ({
          id: repo.id.toString(),
          title: repo.name.replace(/-/g, ' '), 
          description: repo.description || "Deskripsi proyek sedang dalam tahap pembaruan.",
          tags: repo.topics && repo.topics.length > 0 ? repo.topics : (repo.language ? [repo.language] : []),
          githubUrl: repo.html_url,
          demoUrl: repo.homepage || "", 
        }));

        setItProjects(formattedProjects);
      } catch (error: any) {
        console.error("Error fetching GitHub repos:", error);
        setGithubError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubRepos();
  }, []);

  // Effect terpisah untuk menarik 3 desain terbaru dari Firebase
  useEffect(() => {
    const qDesigns = query(collection(db, "graphic_designs"), orderBy("createdAt", "desc"), limit(3));
    const unsubDesigns = onSnapshot(qDesigns, (snapshot) => {
      setFeaturedDesigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DesignImage[]);
      setIsDesignsLoading(false);
    });

    return () => unsubDesigns();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* 1. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-black tracking-tighter hover:text-blue-600 transition">
            BAF.
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600 items-center">
            <a href="#highlights" className="hover:text-blue-600 transition">Highlights</a>
            <Link href="/creative" className="hover:text-blue-600 transition">Creative Media</Link>
            <a href="#proyek-it" className="hover:text-blue-600 transition">Proyek IT</a>
            <a href="#kontak" className="px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition shadow-md hover:shadow-lg">Mari Berkolaborasi</a>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative w-full overflow-hidden flex flex-col items-center text-center py-24 md:py-32">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-slate-200 rounded-full border-4 border-white shadow-xl mb-8 overflow-hidden group">
            <img 
              src="/profile.jpg" 
              alt="Billy Adrian" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Billy+Adrian&background=0D8ABC&color=fff&size=256' }} 
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-bold mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Available for new projects
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Bridging Creative Vision <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              & Technical Excellence
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
            Menggabungkan kepekaan estetika dari Graphic Design & Video Editing 
            dengan logika sistem yang solid dalam pengembangan Web Modern dan Machine Learning.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
            <Link href="/creative" className="px-8 py-3.5 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition shadow-xl hover:-translate-y-1 duration-300 flex items-center justify-center gap-2">
              Eksplorasi Visual &rarr;
            </Link>
            <a href="#proyek-it" className="px-8 py-3.5 bg-white/80 backdrop-blur-sm border border-slate-300 text-slate-900 rounded-full font-semibold hover:bg-slate-50 transition shadow-sm hover:-translate-y-1 duration-300 flex items-center justify-center">
              Lihat Proyek Sistem
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-3 opacity-70">
            <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold shadow-sm border border-slate-100 text-slate-600 flex items-center gap-2"><span>⚛️</span> React/Next.js</span>
            <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold shadow-sm border border-slate-100 text-slate-600 flex items-center gap-2"><span>🐍</span> Python</span>
            <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold shadow-sm border border-slate-100 text-slate-600 flex items-center gap-2"><span>🧠</span> YOLOv8 / CV</span>
            <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold shadow-sm border border-slate-100 text-slate-600 flex items-center gap-2"><span>🎨</span> Graphic Design</span>
            <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold shadow-sm border border-slate-100 text-slate-600 flex items-center gap-2"><span>🎬</span> Video Editing</span>
          </div>
        </div>
      </section>

      {/* 3. HIGHLIGHTS & INSIGHTS */}
      <section id="highlights" className="bg-slate-900 text-white py-24 scroll-mt-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Milestones & Insights</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Sorotan pencapaian utama yang mendefinisikan perjalanan karir dan riset saya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
                <span className="text-blue-400 text-xl font-black">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Innovillage 2025 Awardee</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Meraih pendanaan kompetitif untuk inovasi <strong>SiagaGizi</strong>, sebuah Sistem Pendukung Keputusan (SPK) proaktif untuk pemantauan pertumbuhan, bersaing dengan 900+ proposal lainnya.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
                <span className="text-purple-400 text-xl font-black">🧠</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Computer Vision Research</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Melakukan studi mendalam dan *benchmark* performa arsitektur deteksi objek modern seperti <strong>YOLOv8, Faster R-CNN, dan DETR</strong> untuk pengenalan produk ritel.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/30">
                <span className="text-emerald-400 text-xl font-black">🎬</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Storyteller</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Terlibat dalam berbagai proyek desain grafis profesional dan produksi video sinematik, menerjemahkan ide kompleks menjadi antarmuka dan media visual yang menggugah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SELECTED VISUAL WORKS (SEKSI BARU) */}
      <section className="py-24 max-w-6xl mx-auto px-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Selected Visual Works</h3>
            <p className="text-slate-500">Sekilas karya desain grafis.</p>
          </div>
          <Link href="/creative" className="text-emerald-600 font-semibold hover:underline flex items-center gap-2">
            Eksplorasi Galeri Visual &rarr;
          </Link>
        </div>

        {isDesignsLoading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : featuredDesigns.length === 0 ? (
          <div className="text-center text-slate-500 py-10 border border-slate-300 border-dashed rounded-2xl">
            Belum ada karya desain yang diunggah.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDesigns.map((item) => (
              <Link href="/creative" key={item.id} className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 aspect-[4/5] bg-slate-100 block cursor-pointer">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <h4 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. PROYEK IT DARI GITHUB */}
      <section id="proyek-it" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-20 border-t border-slate-200/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Engineering Workspace</h3>
            <p className="text-slate-500">Auto-synced latest repositories from GitHub.</p>
          </div>
          <a href="https://github.com/billyaf" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline flex items-center gap-2">
            Lihat semua di GitHub &rarr;
          </a>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : githubError ? (
          <div className="text-center text-red-500 py-10 border border-red-200 bg-red-50 rounded-2xl font-medium">
            {githubError}
          </div>
        ) : itProjects.length === 0 ? (
          <div className="text-center text-slate-500 py-10 border border-slate-300 border-dashed rounded-2xl">
            Repositori publik tidak ditemukan untuk username tersebut.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itProjects.map((project) => (
              <div key={project.id} className="group flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-8 flex flex-col flex-1">
                  <h4 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
                    {project.title}
                  </h4>
                  <p className="text-slate-600 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="flex gap-2 flex-wrap mb-8">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 mt-auto">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
                      Repository <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </a>
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 text-sm font-bold hover:underline flex items-center gap-1">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. FOOTER */}
      <footer id="kontak" className="bg-slate-900 text-white py-20 border-t border-slate-800 scroll-mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-10 text-center md:text-left">
          
          <div>
            <h2 className="text-3xl font-black tracking-tighter mb-4">BAF.</h2>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              Tertarik untuk berkolaborasi? Mari diskusikan proyek visual atau rekayasa perangkat lunak Anda selanjutnya.
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-3">
              <span className="text-slate-500 font-medium">Say hello:</span>
              <a 
                href="mailto:billyadrianf@gmail.com" 
                className="text-xl md:text-2xl font-bold text-white hover:text-blue-400 transition-colors underline underline-offset-8 decoration-blue-500/50 hover:decoration-blue-400"
              >
                billyadrianf@gmail.com
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-slate-500 font-medium mb-2 hidden md:block">Connect with me:</p>
            <div className="flex gap-4">
              <a 
                href="https://linkedin.com/in/billyadrianf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition border border-slate-700"
              >
                LinkedIn
              </a>
              <a 
                href="https://github.com/billyaf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition border border-slate-700"
              >
                GitHub
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; 2026 Billy Adrian Fernanda. All rights reserved.</p>
          <p>Engineered with Next.js & Tailwind CSS.</p>
        </div>
      </footer>
    </main>
  );
}
