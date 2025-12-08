import { getAlertManager } from "../context/AlertContext";

const alertManager = getAlertManager();

/**
 * Valida campos obrigatórios de um formulário, podendo ignorar campos opcionais.
 *
 * @param {Object} form - estado atual do formulário
 * @param {HTMLElement} formElement - elemento <form>
 * @param {Object} [backendErrors] - erros vindos do backend
 * @param {Array<string>} [camposOpcionais] - lista de campos que NÃO devem ser validados
 * @returns {Array<{ fieldName: string, message: string }>}
 */
export function validaCampos(
  form,
  formElement,
  backendErrors = null,
  camposOpcionais = []
) {
  const mensagens = [];

  if (!formElement) return mensagens;

  const inputs = formElement.querySelectorAll("[name]");

  inputs.forEach((input) => {
    const nome = input.getAttribute("name");

    // 🔥 PULA validação se o campo estiver na lista de opcionais
    if (camposOpcionais.includes(nome)) return;

    const label =
      input.previousElementSibling?.innerText.replace(/:$/, "") || nome;

    const valor =
      form[nome] !== undefined && form[nome] !== null
        ? form[nome].toString().trim()
        : "";

    if (valor === "" || valor.length === 0) {
      const msg = `Preencha o campo: ${label}`;
      mensagens.push({ fieldName: nome, message: msg });
      alertManager?.addAlert(msg, "error", { fieldName: nome });
    }
  });

  if (backendErrors && typeof backendErrors === "object") {
    Object.entries(backendErrors).forEach(([field, msgs]) => {
      if (Array.isArray(msgs) && msgs.length > 0) {
        const msg = msgs.join(", ");
        mensagens.push({ fieldName: field, message: msg });
        alertManager?.addAlert(msg, "error", { fieldName: field });
      }
    });
  }

  return mensagens;
}
