'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Dog,
  Search,
  User,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Heart,
  ShieldCheck,
  Truck,
  Package,
  Bone,
  Disc,
  Plus,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function Design3DPreviewPage() {
  const threeCanvasRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState(2);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    // Carregar dinamicamente Three.js e GSAP
    let isMounted = true;
    let renderer: any = null;
    let animationFrameId: number;

    const loadScriptsAndInit3D = async () => {
      // Carregar Three.js via script tag dinamico se nao existir
      if (!(window as any).THREE) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Carregar GSAP se nao existir
      if (!(window as any).gsap) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!isMounted || !threeCanvasRef.current || !(window as any).THREE) return;

      const THREE = (window as any).THREE;
      const gsap = (window as any).gsap;

      // Animações GSAP de entrada
      if (gsap) {
        gsap.fromTo(
          '#preview-hero-badge',
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
        );
        gsap.fromTo(
          '#preview-hero-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, delay: 0.4 }
        );
        gsap.fromTo(
          '#preview-hero-actions',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.6 }
        );

        gsap.to('#preview-hero-badge', {
          y: -6,
          repeat: -1,
          yoyo: true,
          duration: 2.5,
          ease: 'sine.inOut',
        });
      }

      // Configuração Three.js
      const container = threeCanvasRef.current;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || 600;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 6;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Limpar canvas anterior se houver
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      // Luzes
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xf97316, 2.5, 50);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      // Objeto 3D TorusKnot
      const torusGeometry = new THREE.TorusKnotGeometry(1.8, 0.4, 120, 16);
      const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0xea580c,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: true,
      });
      const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
      scene.add(torusKnot);

      // Partículas
      const particlesCount = 100;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 16;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xfbbf24,
        size: 0.08,
        transparent: true,
        opacity: 0.8,
      });

      const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particleSystem);

      // Mouse Parallax
      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      };

      window.addEventListener('mousemove', handleMouseMove);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        torusKnot.rotation.x += 0.005;
        torusKnot.rotation.y += 0.008;
        particleSystem.rotation.y -= 0.002;

        torusKnot.rotation.x += mouseY * 0.01;
        torusKnot.rotation.y += mouseX * 0.01;

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || 600;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);
    };

    loadScriptsAndInit3D();

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
      }
    };
  }, []);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500 selection:text-white">
      {/* Banner Superior de Teste de Modo de Visualizacao */}
      <div className="bg-orange-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 stroke-[2]" /> MODO DE TESTE DO NOVO DESIGN 3D INTERATIVO
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition-colors"
          >
            ← Voltar ao Design Atual
          </Link>
        </div>
      </div>

      {/* Header Glassmorphism */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Dog className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-orange-400 transition-colors">
                Pet Costelinha
              </span>
              <span className="text-[9px] font-mono tracking-widest text-orange-400 uppercase font-semibold">
                Versão 3D de Testes
              </span>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Busque por rações, brinquedos, medicamentos..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center gap-2 text-xs font-semibold"
            >
              <User className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Minha Conta</span>
            </Link>

            <button className="relative p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all flex items-center gap-2 px-4 shadow-lg shadow-orange-600/25 active:scale-95 cursor-pointer">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-extrabold hidden sm:inline">Carrinho</span>
              <span
                className={`bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ml-1 shadow-sm transition-transform ${
                  addedAnimation ? 'scale-150' : 'scale-100'
                }`}
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section 3D */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden bg-slate-950 text-white py-20 border-b border-slate-800/80">
        <div ref={threeCanvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-80"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
          <div
            id="preview-hero-badge"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-extrabold tracking-wider uppercase backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Design 3D Interativo (Three.js + GSAP)</span>
          </div>

          <h1 id="preview-hero-title" className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight">
            Cuidado excepcional,<br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              amor incondicional.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Experimente o novo layout com elementos 3D interativos, cards translúcidos glassmorphism e animações fluídas de alta performance.
          </p>

          <div id="preview-hero-actions" className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#catalogo-preview"
              className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Manifesto Cards */}
      <section className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg mb-2">Qualidade Homologada</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Rações super premium e artigos farmacêuticos certificados para o bem-estar do seu pet.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg mb-2">Tele-Entrega Expressa</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Entregas rápidas no conforto do seu lar com embalagens higienizadas e lacradas.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg mb-2">Atendimento Humanizado</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Equipe apaixonada por animais pronta para esclarecer todas as suas dúvidas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Preview */}
      <section id="catalogo-preview" className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-bold">
                [ DEMO DE PRODUTOS ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Catálogo Interativo</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl hover:border-orange-500/50 transition-all group flex flex-col justify-between">
              <div className="w-full h-48 bg-slate-950 rounded-2xl mb-4 flex items-center justify-center border border-slate-800/80 relative">
                <Package className="w-14 h-14 text-orange-400/60 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">PROMO</span>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs">Ração Magnus Cães 10kg</h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-extrabold text-white text-base">R$ 159,90</span>
                  <button
                    onClick={handleAddToCart}
                    className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl hover:border-orange-500/50 transition-all group flex flex-col justify-between">
              <div className="w-full h-48 bg-slate-950 rounded-2xl mb-4 flex items-center justify-center border border-slate-800/80">
                <Bone className="w-14 h-14 text-orange-400/60 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs">Petisco Natural Canino 200g</h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-extrabold text-white text-base">R$ 24,90</span>
                  <button
                    onClick={handleAddToCart}
                    className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl hover:border-orange-500/50 transition-all group flex flex-col justify-between">
              <div className="w-full h-48 bg-slate-950 rounded-2xl mb-4 flex items-center justify-center border border-slate-800/80">
                <Disc className="w-14 h-14 text-orange-400/60 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs">Frisbee de Borracha Resistente</h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-extrabold text-white text-base">R$ 39,90</span>
                  <button
                    onClick={handleAddToCart}
                    className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl hover:border-orange-500/50 transition-all group flex flex-col justify-between">
              <div className="w-full h-48 bg-slate-950 rounded-2xl mb-4 flex items-center justify-center border border-slate-800/80">
                <Sparkles className="w-14 h-14 text-orange-400/60 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs">Shampoo Neutro Pelos Macios</h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-extrabold text-white text-base">R$ 45,00</span>
                  <button
                    onClick={handleAddToCart}
                    className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
