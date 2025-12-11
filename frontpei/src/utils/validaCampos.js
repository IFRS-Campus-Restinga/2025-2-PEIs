export function validaCampos(form, metadata, backendErrors = null, prefix = "", addAlertFn = null) {
  const mensagens = [];

  if (!metadata || !metadata.fields) {
    console.warn("[validaCampos] metadata inválido");
    return mensagens;
  }

  metadata.fields.forEach((f) => {
    if (f.name === "id") return;

    const nome = f.name;
    const label = f.label || f.name.replace(/_/g, " ");
    const fieldKey = prefix + nome;

    const isRequired = f.required === true;

    let valor = form[nome];
    if (valor === undefined || valor === null) valor = "";
    const texto = valor.toString().trim();

    // ====== VALIDAÇÃO PARA "objetivos" ======
    if (nome === "objetivos" && texto !== "") {

      // Somente letras, números e espaço
      const regex = /^[A-Za-z0-9À-ÿ ]+$/;

      if (!regex.test(texto)) {
        const msg = `Não use caracteres especiais. Use apenas letras, números e espaços.`;
        mensagens.push({ fieldName: fieldKey, message: msg });
        addAlertFn?.(msg, "error", { fieldName: fieldKey });
      }

      // Tamanho mínimo
      if (texto.length < 7) {
        const msg = `Certifique-se de que este campo tenha mais de 7 caracteres.`;
        mensagens.push({ fieldName: fieldKey, message: msg });
        addAlertFn?.(msg, "error", { fieldName: fieldKey });
      }
    }

    // ====== OBRIGATÓRIO ======
    if (isRequired && texto === "") {
      const msg = `Preencha o campo: ${label}`;
      mensagens.push({ fieldName: fieldKey, message: msg });
      addAlertFn?.(msg, "error", { fieldName: fieldKey });
    }
  });

  // ====== ERROS DO BACKEND ======
  if (backendErrors && typeof backendErrors === "object") {
    Object.entries(backendErrors).forEach(([field, msgs]) => {
      const fieldKey = prefix + field;

      let lista = [];

      if (Array.isArray(msgs)) {
        lista = msgs;
      } else if (typeof msgs === "string") {
        lista = [msgs];
      } else if (msgs !== null && msgs !== undefined) {
        lista = [JSON.stringify(msgs)];
      }

      lista.forEach((m) => {
        mensagens.push({ fieldName: fieldKey, message: m });
        addAlertFn?.(m, "error", { fieldName: fieldKey });
      });
      });
  }

  return mensagens;
}
