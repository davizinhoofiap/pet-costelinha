'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User as UserIcon,
  MapPin,
  Dog,
  Shield,
  ShoppingBag,
  LogOut,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Search,
  Calendar,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { maskCPF, maskPhone, formatCurrency } from '@/lib/masks';
import { validateCPF } from '@/lib/cpf';

interface AddressType {
  id?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface PetType {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  porte?: string;
  idade?: string;
  observacao?: string;
}

interface OrderType {
  id: string;
  total_valor: number | string;
  status: string;
  created_at: string;
  metodo_pagamento: string;
}

export default function UserProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Profile Form States
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [role, setRole] = useState('CLIENTE');
  const [createdAt, setCreatedAt] = useState('');

  // Address Form States
  const [address, setAddress] = useState<AddressType>({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  // Pets & Orders States
  const [pets, setPets] = useState<PetType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);

  // New Pet Modal / Form
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetEspecie, setNewPetEspecie] = useState('Cão');
  const [newPetRaca, setNewPetRaca] = useState('');
  const [newPetPorte, setNewPetPorte] = useState('Médio');
  const [newPetIdade, setNewPetIdade] = useState('');
  const [addingPet, setAddingPet] = useState(false);

  // Notification Toast
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  // 1. Carregar Dados do Usuário via API com token JWT em cookie/header
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const res = await fetch('/api/user/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/?auth=login');
            return;
          }
          throw new Error('Erro ao carregar dados do perfil.');
        }

        const data = await res.json();

        setNome(data.nome || '');
        setEmail(data.email || '');
        setCpf(data.cpf ? maskCPF(data.cpf) : '');
        setTelefone(data.telefone ? maskPhone(data.telefone) : '');
        setFotoUrl(data.foto_url || '');
        setRole(data.role || 'CLIENTE');
        setCreatedAt(data.created_at ? new Date(data.created_at).toLocaleDateString('pt-BR') : '');

        if (data.addresses && data.addresses.length > 0) {
          const mainAddr = data.addresses[0];
          setAddress({
            id: mainAddr.id,
            cep: mainAddr.cep || '',
            logradouro: mainAddr.logradouro || '',
            numero: mainAddr.numero || '',
            complemento: mainAddr.complemento || '',
            bairro: mainAddr.bairro || '',
            cidade: mainAddr.cidade || '',
            estado: mainAddr.estado || '',
          });
        }

        if (data.pets) {
          setPets(data.pets);
        }

        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao conectar ao servidor.', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  // 2. Busca Automática de CEP via API Gratuita do ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = address.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();

        if (data.erro) {
          showToast('CEP não localizado no ViaCEP.', 'error');
          return;
        }

        setAddress((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
        showToast('Endereço localizado via CEP!', 'success');
      } catch (e) {
        showToast('Erro ao consultar CEP automaticamente.', 'error');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // 3. Salvar Perfil e Endereço
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nome,
          telefone,
          cpf,
          endereco: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar alterações.');
      }

      // Atualizar no localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, nome, cpf, telefone };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      showToast('🎉 Perfil e Endereço atualizados com sucesso!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Falha ao salvar dados.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // 4. Cadastrar Novo Pet
  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName) return;

    setAddingPet(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nome: newPetName,
          especie: newPetEspecie,
          raca: newPetRaca,
          porte: newPetPorte,
          idade: newPetIdade,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar pet.');

      setPets((prev) => [data.pet, ...prev]);
      setNewPetName('');
      setNewPetRaca('');
      setNewPetIdade('');
      setShowAddPet(false);
      showToast(`🐶 ${data.pet.nome} cadastrado(a) com sucesso!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar pet.', 'error');
    } finally {
      setAddingPet(false);
    }
  };

  // 5. Remover Pet
  const handleDeletePet = async (petId: string) => {
    if (!confirm('Deseja realmente remover este pet do seu cadastro?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user/pets?id=${petId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Erro ao remover pet.');

      setPets((prev) => prev.filter((p) => p.id !== petId));
      showToast('Pet removido.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Logout com destruição completa do cookie no servidor e no navegador
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-3 font-sans">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin stroke-[2]" />
        <p className="text-xs text-slate-300 font-mono">Carregando seu perfil seguro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Toast Notification */}
      {msg && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 max-w-sm animate-bounce ${
            msg.type === 'success'
              ? 'bg-emerald-900 border-emerald-700 text-emerald-100'
              : 'bg-rose-900 border-rose-700 text-rose-100'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 stroke-[2]" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Voltar à Loja Virtual
          </Link>

          <span className="text-xs font-mono text-orange-400 bg-orange-950/60 border border-orange-800/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Área Exclusiva do Tutor
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner do Perfil */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-5 z-10">
            <div className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-md border-4 border-slate-800 shrink-0 uppercase overflow-hidden">
              {fotoUrl ? (
                <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
              ) : (
                nome.slice(0, 2)
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{nome}</h1>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" /> {email}
              </p>
              {createdAt && (
                <p className="text-[11px] text-slate-500 font-mono">
                  Membro desde: {createdAt}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="z-10 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4 stroke-[1.5]" /> Sair da Conta
          </button>
        </div>

        {/* Formulário Principal: Dados do Tutor & Endereço */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Dados do Tutor */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 bg-orange-600/20 text-orange-400 rounded-xl flex items-center justify-center">
                <UserIcon className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">1. Dados Pessoais do Tutor</h2>
                <p className="text-[11px] text-slate-400">Identificação para pedidos e notas fiscais</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">E-mail Cadastrado (Não Editável)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Endereço de Entrega com ViaCEP */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 bg-orange-600/20 text-orange-400 rounded-xl flex items-center justify-center">
                <MapPin className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">2. Endereço Principal de Entrega</h2>
                <p className="text-[11px] text-slate-400">Com busca automática de CEP via ViaCEP</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">CEP *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="00000-000"
                    maxLength={9}
                    value={address.cep}
                    onChange={(e) => setAddress({ ...address, cep: e.target.value })}
                    onBlur={handleCepBlur}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-white font-mono focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {loadingCep ? (
                      <RefreshCw className="w-4 h-4 text-orange-400 animate-spin stroke-[2]" />
                    ) : (
                      <Search className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Logradouro / Rua *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua Benigno Nogueira Franco"
                    value={address.logradouro}
                    onChange={(e) => setAddress({ ...address, logradouro: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="367"
                    value={address.numero}
                    onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Complemento / Ap.</label>
                  <input
                    type="text"
                    placeholder="Bloco B, Ap 12"
                    value={address.complemento}
                    onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bairro"
                    value={address.bairro}
                    onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="São Paulo"
                    value={address.cidade}
                    onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">UF *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="SP"
                    value={address.estado}
                    onChange={(e) => setAddress({ ...address, estado: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Salvar Alterações de Perfil */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-98"
            >
              {savingProfile ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin stroke-[2]" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2]" /> Salvar Perfil e Endereço
                </>
              )}
            </button>
          </div>
        </form>

        {/* Card 3: Seção Meus Pets */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-600/20 text-orange-400 rounded-xl flex items-center justify-center">
                <Dog className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">3. Meus Pets Cadastrados</h2>
                <p className="text-xs text-slate-400">Cadastre seus bichinhos para ofertas e nutrição personalizada</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddPet(!showAddPet)}
              className="bg-slate-800 hover:bg-slate-700 text-orange-400 font-extrabold px-4 py-2 rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2]" /> {showAddPet ? 'Cancelar' : 'Cadastrar Novo Pet'}
            </button>
          </div>

          {/* Formulário de Adicionar Novo Pet */}
          {showAddPet && (
            <form onSubmit={handleAddPet} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Novo Integrante da Família
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome do Pet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Costelinha, Thor, Belinha"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Espécie *</label>
                  <select
                    value={newPetEspecie}
                    onChange={(e) => setNewPetEspecie(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Cão">Cão (Cachorro)</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave / Pássaro</option>
                    <option value="Outros">Outros Pets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Raça</label>
                  <input
                    type="text"
                    placeholder="Ex: Poodle, SRD, Golden"
                    value={newPetRaca}
                    onChange={(e) => setNewPetRaca(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Porte</label>
                  <select
                    value={newPetPorte}
                    onChange={(e) => setNewPetPorte(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Pequeno">Pequeno (Até 10kg)</option>
                    <option value="Médio">Médio (10kg a 25kg)</option>
                    <option value="Grande">Grande (Acima de 25kg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Idade Aproximada</label>
                  <input
                    type="text"
                    placeholder="Ex: 2 anos e 3 meses"
                    value={newPetIdade}
                    onChange={(e) => setNewPetIdade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addingPet}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                {addingPet ? 'Salvando...' : 'Confirmar Cadastro do Pet'}
              </button>
            </form>
          )}

          {/* Lista de Pets */}
          {pets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <Dog className="w-10 h-10 text-slate-600 mx-auto stroke-[1.5]" />
              <p className="text-xs font-medium">Nenhum pet cadastrado no seu perfil ainda.</p>
              <button
                onClick={() => setShowAddPet(true)}
                className="text-xs font-bold text-orange-400 hover:underline"
              >
                + Cadastrar meu primeiro pet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative group hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-orange-600/20 text-orange-400 rounded-lg flex items-center justify-center font-bold text-xs">
                        🐾
                      </span>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{pet.nome}</h4>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {pet.especie} • {pet.raca || 'SRD'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                      title="Remover Pet"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 font-medium">
                      Porte: {pet.porte || 'Médio'}
                    </span>
                    {pet.idade && (
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 font-medium">
                        Idade: {pet.idade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Histórico de Pedidos Recentes */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 bg-orange-600/20 text-orange-400 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">4. Meus Pedidos Recentes</h2>
              <p className="text-[11px] text-slate-400">Histórico de compras realizadas na loja</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Você ainda não realizou nenhum pedido no site.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-slate-400 text-[10px] uppercase">
                      PEDIDO #{ord.id.slice(0, 8)}
                    </span>
                    <p className="font-bold text-white">{formatCurrency(typeof ord.total_valor === 'string' ? parseFloat(ord.total_valor) : ord.total_valor)}</p>
                    <p className="text-[10px] text-slate-500">{new Date(ord.created_at).toLocaleString('pt-BR')}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase font-mono ${
                        ord.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
