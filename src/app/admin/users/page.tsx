'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Users, UserPlus, Edit2, Trash2, X, Check, Lock } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { maskCPF } from '@/lib/masks';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState('GERENTE');
  const [senha, setSenha] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setNome('');
    setEmail('');
    setCpf('');
    setRole('GERENTE');
    setSenha('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (userToEdit: any) => {
    setEditingUser(userToEdit);
    setNome(userToEdit.nome);
    setEmail(userToEdit.email);
    setCpf(userToEdit.cpf ? maskCPF(userToEdit.cpf) : '');
    setRole(userToEdit.role);
    setSenha(''); // Deixar em branco caso não queira alterar a senha
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            nome,
            email,
            cpf,
            role,
            novaSenha: senha,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar colaborador');

        setSuccessMsg(`Informações de ${nome} atualizadas com sucesso!`);
      } else {
        // Criar novo usuário
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, cpf, senha, role }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar colaborador');

        setSuccessMsg(`Novo colaborador ${nome} cadastrado!`);
      }

      setIsModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar dados');
    }
  };

  const handleDeleteUser = async (userToDelete: any) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userToDelete.nome}?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir');

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccessMsg(`Usuário ${userToDelete.nome} removido.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover usuário.');
    }
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">ADMIN</span>;
      case 'GERENTE':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">GERENTE</span>;
      case 'ATENDENTE':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">ATENDENTE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">CLIENTE</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700 stroke-[1.5]" /> Gestão de Equipe & Permissões RBAC
            </h1>
            <p className="text-xs text-slate-500">
              Altere nomes, e-mails, cargos e redefina senhas de qualquer conta cadastrada no sistema.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4 stroke-[1.5]" /> Cadastrar Colaborador
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-4">Colaborador / Usuário</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">CPF</th>
                  <th className="p-4">Nível de Acesso (Cargo)</th>
                  <th className="p-4">Data Cadastro</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-semibold text-slate-900">{u.nome}</span>
                          <span className="text-[10px] text-slate-400 font-normal">ID: #{u.id.slice(0, 6)}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{u.email}</td>
                      <td className="p-4 font-mono text-slate-500">{u.cpf ? maskCPF(u.cpf) : 'N/A'}</td>
                      <td className="p-4">{getRoleBadge(u.role)}</td>
                      <td className="p-4 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar Usuário / Redefinir Senha"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Adicionar / Editar Usuário */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-4 text-slate-900 relative shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingUser ? `Editar Usuário: ${editingUser.nome}` : 'Cadastrar Novo Colaborador'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                  {errorMsg}
                </p>
              )}

              <form onSubmit={handleSaveUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@petcostelinha.com.br"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(maskCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo (Nível RBAC) *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      <option value="ADMIN">ADMIN (Acesso Total)</option>
                      <option value="GERENTE">GERENTE (Estoque/Pedidos)</option>
                      <option value="ATENDENTE">ATENDENTE (Separação)</option>
                      <option value="CLIENTE">CLIENTE (Comprador)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {editingUser ? 'Redefinir Senha (Deixe em branco para manter)' : 'Senha Inicial *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={editingUser ? 'Digite apenas para redefinir' : '••••••••'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    {editingUser ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
