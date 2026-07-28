'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Users, UserPlus, Edit2, Trash2, X, Check, Search, Shield, UserX, Phone } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { maskCPF, maskPhone } from '@/lib/masks';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENTE' | 'EQUIPE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
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
    setTelefone('');
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
    setTelefone(userToEdit.telefone ? maskPhone(userToEdit.telefone) : '');
    setRole(userToEdit.role);
    setSenha('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingUser) {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            nome,
            email,
            cpf,
            telefone,
            role,
            novaSenha: senha,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar dados');

        setSuccessMsg(`Informações de ${nome} atualizadas com sucesso!`);
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, cpf, telefone, senha, role }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar usuário');

        setSuccessMsg(`Novo usuário/colaborador ${nome} cadastrado!`);
      }

      setIsModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar dados');
    }
  };

  // Exclusão Segura de Clientes e Colaboradores (Requisito 5)
  const handleDeleteUser = async (userToDelete: any) => {
    const isCliente = userToDelete.role === 'CLIENTE';
    const confirmMessage = isCliente
      ? `Deseja realmente excluir a conta do cliente ${userToDelete.nome}?\n\nOs pedidos históricos deste cliente continuarão preservados no banco de dados.`
      : `Deseja realmente excluir a conta do colaborador ${userToDelete.nome}?`;

    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir');

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccessMsg(`Conta de ${userToDelete.nome} excluída com sucesso.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover usuário.');
    }
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold">ADMIN</span>;
      case 'GERENTE':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold">GERENTE</span>;
      case 'ATENDENTE':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold">ATENDENTE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold">CLIENTE</span>;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.telefone && u.telefone.includes(searchTerm)) ||
      (u.cpf && u.cpf.includes(searchTerm));

    if (filterRole === 'CLIENTE') return matchesSearch && u.role === 'CLIENTE';
    if (filterRole === 'EQUIPE') return matchesSearch && u.role !== 'CLIENTE';
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-full overflow-x-hidden box-border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700 stroke-[1.5]" /> Gestão de Usuários & Clientes (RBAC)
            </h1>
            <p className="text-xs text-slate-500">
              Gerencie colaboradores e exclua perfis de clientes inativos para manter o banco enxuto.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[1.5]" /> Cadastrar Usuário / Colaborador
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                filterRole === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setFilterRole('CLIENTE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                filterRole === 'CLIENTE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clientes ({users.filter((u) => u.role === 'CLIENTE').length})
            </button>
            <button
              onClick={() => setFilterRole('EQUIPE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                filterRole === 'EQUIPE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Equipe / Admin ({users.filter((u) => u.role !== 'CLIENTE').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por nome, email ou tel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Tabela de Usuários com Responsividade Fluida (Requisito 6) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden max-w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">Usuário / Cliente</th>
                  <th className="p-3.5">E-mail</th>
                  <th className="p-3.5">Telefone</th>
                  <th className="p-3.5">Cargo / Perfil</th>
                  <th className="p-3.5">Data Cadastro</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Nenhum usuário encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-semibold text-slate-900">{u.nome}</span>
                          <span className="text-[10px] text-slate-400 font-normal">ID: #{u.id.slice(0, 6)}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3.5 font-mono text-slate-600">{u.telefone ? maskPhone(u.telefone) : 'N/A'}</td>
                      <td className="p-3.5">{getRoleBadge(u.role)}</td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar Usuário / Redefinir Senha"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Usuário/Cliente"
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
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 box-border">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-5 space-y-3 text-slate-900 relative shadow-xl box-border">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {editingUser ? `Editar Usuário: ${editingUser.nome}` : 'Cadastrar Novo Usuário / Colaborador'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                  {errorMsg}
                </p>
              )}

              <form onSubmit={handleSaveUser} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@petcostelinha.com.br"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(maskCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Telefone / Celular</label>
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Cargo / Nível de Acesso (RBAC) *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="CLIENTE">CLIENTE (Comprador)</option>
                    <option value="GERENTE">GERENTE (Estoque/Pedidos)</option>
                    <option value="ATENDENTE">ATENDENTE (Separação)</option>
                    <option value="ADMIN">ADMIN (Acesso Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    {editingUser ? 'Redefinir Senha (Deixe em branco para manter)' : 'Senha Inicial *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={editingUser ? 'Digite apenas para redefinir' : '••••••••'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
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
