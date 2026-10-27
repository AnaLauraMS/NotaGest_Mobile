
export function getAuthServiceUrl(): string {
  const envAuth = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
  const envBackend = process.env.NEXT_PUBLIC_BACKEND_URL;

  let base = envAuth ?? envBackend ?? 'https://notagest-0o2r.onrender.com';
  base = base.replace(/\/+$/, '');
  base = base.replace(/(\/api\/users)+$/, '');
  base = base.replace(/\/api$/, '');

  return `${base}/api/users`;
}

interface RegisterData {
    nome: string;
    email: string;
    senha: string;
}

interface LoginResponse {
    error: string;
    token: string;
    message: string;
}

export async function registerUser(nome: string, email: string, senha: string) {
    try {
        const authUrl = getAuthServiceUrl();
        const res = await fetch(`${authUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Erro ao registrar usuário.");
        }

        return data;
    } catch (error: any) {
        console.error("Erro no registerUser:", error);
        throw error;
    }
}

export async function loginUser(email: string, senha: string): Promise<LoginResponse> {
    const authUrl = getAuthServiceUrl();
    const response = await fetch(`${authUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    const data: LoginResponse = await response.json();

    // Lida com falhas de login ou de servidor
    if (!response.ok) {
        throw new Error(data.error || data.message || "Erro desconhecido no login.");
    }

    // Retorna o token e a mensagem de sucesso
    return data;
}

/**
 * @function decodeJwt
 * @description Decodifica o payload de um JWT localmente (sem verificar a assinatura).
 * Útil para extrair o ID do usuário e o email do token no frontend.
 * @param {string} token - O JWT completo.
 * @returns {{ id: string, email: string }} Objeto com o ID e o email do usuário.
 */
export function decodeJwt(token: string): { id: string, email: string } {
    try {
        // Separa o token nas três partes (header.payload.signature)
        const base64Url = token.split('.')[1];
        // Converte a string base64url para base64 padrão
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Decodifica a base64 e o JSON
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar JWT", e);
        // Retorna um objeto vazio em caso de falha
        return { id: '', email: '' };
    }
}

export async function logoutUser(): Promise<void> {
    const authUrl = getAuthServiceUrl();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        try {
            await fetch(`${authUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
        } catch {}
    }
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}