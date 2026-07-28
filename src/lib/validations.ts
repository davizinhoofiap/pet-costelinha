import { z } from 'zod';

// regex pra garantir que o CPF veio só com os 11 números sem traço ou ponto
const cpfCleanRegex = /^\d{11}$/;

// aqui a gente valida cada produto que o cliente colocou no carrinho
export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'ID do produto é obrigatório'),
  quantidade: z.number().int().min(1, 'Quantidade deve ser maior ou igual a 1'),
});

// aqui fica o esquema principal de validação do checkout do pedido
export const checkoutSchema = z.object({
  clienteNome: z.string().min(2, 'Nome do cliente deve possuir no mínimo 2 caracteres').max(100),
  clienteEmail: z.string().email('Endereço de e-mail inválido').transform((val) => val.toLowerCase().trim()),
  clienteCpf: z.string().transform((val) => val.replace(/\D/g, '')).refine((val) => cpfCleanRegex.test(val), {
    message: 'CPF deve conter exatamente 11 dígitos numéricos',
  }),
  clienteTelefone: z.string().min(8, 'Telefone inválido').transform((val) => val.replace(/\D/g, '')),
  enderecoEntrega: z.string().min(5, 'Endereço de entrega é obrigatório').max(300),
  metodoPagamento: z.enum(['PIX', 'WHATSAPP']),
  items: z.array(checkoutItemSchema).min(1, 'O carrinho deve conter pelo menos 1 item'),
  turnstileToken: z.string().optional(),
});

// aqui a gente valida a tela de login dos usuários
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Senha é obrigatória'),
  turnstileToken: z.string().optional(),
});

// aqui a gente valida a criação de novos usuários e funcionários no admin
export const userCreateSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().email('E-mail inválido').transform((val) => val.toLowerCase().trim()),
  cpf: z.string().optional().nullable().transform((val) => (val ? val.replace(/\D/g, '') : null)),
  telefone: z.string().optional().nullable().transform((val) => (val ? val.replace(/\D/g, '') : null)),
  senha: z.string().min(8, 'A senha deve conter no mínimo 8 caracteres'),
  role: z.enum(['ADMIN', 'GERENTE', 'ATENDENTE', 'CLIENTE']),
  turnstileToken: z.string().optional(),
});

// aqui a gente valida a alteração de dados do perfil do cliente
export const profileUpdateSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.string().email().transform((val) => val.toLowerCase().trim()).optional(),
  telefone: z.string().transform((val) => val.replace(/\D/g, '')).optional(),
  cpf: z.string().transform((val) => val.replace(/\D/g, '')).optional(),
  endereco: z
    .object({
      cep: z.string().min(8).max(10),
      logradouro: z.string().min(2),
      numero: z.string().min(1),
      complemento: z.string().optional().nullable(),
      bairro: z.string().min(2),
      cidade: z.string().min(2),
      estado: z.string().length(2),
    })
    .optional(),
});
