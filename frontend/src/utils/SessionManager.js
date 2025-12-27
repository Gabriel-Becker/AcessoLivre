// Gerencia eventos de sessão (ex.: logout forçado em 401)
let logoutHandler = null;

export function setLogoutHandler(handler) {
  logoutHandler = typeof handler === 'function' ? handler : null;
}

export async function triggerLogout() {
  if (typeof logoutHandler === 'function') {
    try {
      await logoutHandler();
    } catch (e) {
      console.error('Erro ao executar logout automático:', e);
    }
  }
}

export default { setLogoutHandler, triggerLogout };
