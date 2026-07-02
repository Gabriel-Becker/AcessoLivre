
/**
 * @typedef {Object} ReportarData
 * @property {string} tipo - Tipo do alvo (LOCAL, COMENTARIO, AVALIACAO, USUARIO)
 * @property {string|number} targetId - ID do alvo
 * @property {string} motivo - Motivo da denúncia
 * @property {string} descricao - Descrição detalhada (opcional)
 * @property {string} [comentario] - Comentário adicional
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