'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Users, UserPlus, Edit2, Trash2, X, Check, Search, Shield, UserX, Phone, AlertTriangle } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { maskCPF, maskPhone } from '@/lib/masks';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENTE' | 'EQUIPE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de Seleção em Lote (Bulk Select)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Modal State (Delete Confirmation)
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        setSelectedUserIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  // Funções de Seleção em Massa (Bulk Selection)
  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      setIsDeleting(true);
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
        setSuccessMsg(`${selectedUserIds.length} usuário(s) excluído(s) permanentemente!`);
        setSelectedUserIds([]);
        setIsBulkDeleteModalOpen(false);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert('Erro ao excluir os usuários selecionados.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
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
          body: JSON.stringify({
            nome,
            email,
            cpf,
            telefone,
            senha,
            role,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');

        setSuccessMsg(`Usuário ${nome} criado com sucesso!`);
      }

      setIsModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar usuário');
    }
  };

  const handleDeleteUser = (u: any) => {
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir');

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSelectedUserIds((prev) => prev.filter((id) => id !== userToDelete.id));
      setSuccessMsg(`Conta de ${userToDelete.nome} excluída com sucesso.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
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

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-full overflow-x-hidden box-border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700 stroke-[1.5]" /> Gestão de Usuários & Permissões
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

        {/* Filtros, Busca e Controle de Seleção em Lote */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Botão de Selecionar Todos / Excluir Selecionados Compacto */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isAllSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => {}}
                className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 cursor-pointer pointer-events-none"
              />
              <span>Selecionar Todos ({filteredUsers.length})</span>
            </button>

            {selectedUserIds.length > 0 && (
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                Excluir Selecionados ({selectedUserIds.length})
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                filterRole === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setFilterRole('CLIENTE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                filterRole === 'CLIENTE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clientes ({users.filter((u) => u.role === 'CLIENTE').length})
            </button>
            <button
              onClick={() => setFilterRole('EQUIPE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
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

        {/* Tabela de Usuários com Seleção em Lote */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden max-w-full">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left text-xs min-w-[650px] border-collapse table-auto">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                      title="Selecionar Todos os Usuários"
                    />
                  </th>
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
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Nenhum usuário encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <tr 
                        key={u.id} 
                        className={`transition-colors ${
                          isSelected ? 'bg-slate-100/90 hover:bg-slate-100' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="p-3.5 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectUser(u.id, e as any)}
                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                          />
                        </td>

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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO EM MASSA DE USUÁRIOS */}
        {isBulkDeleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  Excluir {selectedUserIds.length} {selectedUserIds.length === 1 ? 'Usuário Selecionado' : 'Usuários Selecionados'}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tem certeza que deseja apagar <strong>{selectedUserIds.length} {selectedUserIds.length === 1 ? 'usuário selecionado' : 'usuários selecionados'}</strong> do sistema? Os pedidos antigos associados serão anonimizados nos termos da LGPD.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmBulkDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Adicionar / Editar Usuário */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative my-6">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <h2 className="text-sm font-bold">
                  {editingUser ? `Editar Usuário: ${editingUser.nome}` : 'Cadastrar Colaborador / Usuário'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@petcostelinha.com.br"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Telefone</label>
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Cargo / Nível de Acesso *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="GERENTE">GERENTE (Gerencia produtos e estoque)</option>
                    <option value="ATENDENTE">ATENDENTE (Gerencia expedição de pedidos)</option>
                    <option value="ADMIN">ADMINISTRADOR (Acesso total)</option>
                    <option value="CLIENTE">CLIENTE (Perfil de comprador)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    {editingUser ? 'Redefinir Senha (Deixe em branco para manter a atual)' : 'Senha de Acesso *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmação de Exclusão Individual */}
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  Excluir Conta de {userToDelete.nome}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tem certeza que deseja apagar a conta de <strong>{userToDelete.email}</strong>? Caso o usuário possua pedidos no histórico, os dados pessoais serão anonimizados nos termos da LGPD.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
