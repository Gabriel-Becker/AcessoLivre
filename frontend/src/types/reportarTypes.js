
/**
 * @typedef {Object} ReportarData
 * @property {string} tipo - Tipo do alvo (LOCAL, COMENTARIO, AVALIACAO, USUARIO)
 * @property {string|number} targetId - ID do alvo
 * @property {string} motivo - Motivo da denï¿½ncia
 * @property {string} descricao - Descriï¿½ï¿½o detalhada (opcional)
 * @property {string} [comentario] - Comentï¿½rio adicional
 */

/**
 * @typedef {Object} ReportarResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} [data]
 */

/**
 * @typedef {Object} ReportarState
 * @property {boolean} loading
 * @property {boolean} success
 * @property {string|null} error
 */