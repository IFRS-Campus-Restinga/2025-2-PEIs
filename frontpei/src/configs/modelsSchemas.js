// src/configs/modelsSchemas.js
import { API_ROUTES } from "./apiRoutes"; // ajuste o caminho se necessário

export const modelsSchemas = {
  componenteCurricular: {
    key: "componenteCurricular",
    title: "Componentes Curriculares",
    endpoint: API_ROUTES.COMPONENTECURRICULAR, // string base (ex: "/api/componente-curricular")
    listQuery: "/", // se necessário, ou deixe ""
    // fields usados para renderizar formulário e tabela
    fields: [
      { name: "objetivos", label: "Objetivos", type: "textarea", required: true },
      { name: "conteudo_prog", label: "Conteúdo Programático", type: "textarea", required: true },
      { name: "metodologia", label: "Metodologia", type: "textarea", required: true },

      // select ligado a uma API externa
      {
        name: "disciplinaId",
        label: "Disciplina",
        type: "select",
        required: true,
        source: API_ROUTES.DISCIPLINAS,
        mapLabel: (d) => d.nome,
        mapValue: (d) => d.id,
      },

      {
        name: "periodoLetivoId",
        label: "Período Letivo",
        type: "select",
        required: true,
        source: API_ROUTES.PEIPERIODOLETIVO,
        mapLabel: (p) => `${p.periodo_principal} (${p.data_criacao} - ${p.data_termino})`,
        mapValue: (p) => p.id,
      },
    ],

    // como transformar item da API para o form (edição)
    mapResponseToForm: (item) => ({
      objetivos: item.objetivos ?? "",
      conteudo_prog: item.conteudo_prog ?? "",
      metodologia: item.metodologia ?? "",
      disciplinaId: item.disciplinas ?? "", // note: seu serializer usa "disciplinas"
      periodoLetivoId: item.periodo_letivo ?? "",
    }),

    // payload para enviar a API no POST/PUT
    mapFormToPayload: (form) => ({
      objetivos: form.objetivos,
      conteudo_prog: form.conteudo_prog,
      metodologia: form.metodologia,
      disciplinas: Number(form.disciplinaId),
      periodo_letivo: Number(form.periodoLetivoId),
    }),
  },

  // Exemplo adicional (coordenador)
  coordenador_curso: {
    key: "coordenador_curso",
    title: "Coordenadores de Curso",
    endpoint: API_ROUTES.USUARIO,
    fields: [
      { name: "nome", label: "Nome", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    mapResponseToForm: (item) => ({ nome: item.nome ?? "", email: item.email ?? "" }),
    mapFormToPayload: (form) => ({ nome: form.nome, email: form.email }),
  },

    aluno: {
    key: "aluno",
    title: "Alunos",
    endpoint: API_ROUTES.ALUNO, // se você tiver no apiRoutes
    fields: [
      {
        name: "nome",
        label: "Nome",
        type: "text",
        required: true,
        minLength: 7,
        maxLength: 60,
      },
      {
        name: "matricula",
        label: "Matrícula",
        type: "text",
        required: true,
      },
      {
        name: "email",
        label: "E-mail",
        type: "text",
        required: true,
      },
    ],
    mapResponseToForm: (item) => ({
      nome: item.nome ?? "",
      matricula: item.matricula ?? "",
      email: item.email ?? "",
    }),
    mapFormToPayload: (form) => ({
      nome: form.nome,
      matricula: form.matricula,
      email: form.email,
    }),
  },

  ataDeAcompanhamento: {
    key: "ataDeAcompanhamento",
    title: "Atas de Acompanhamento",
    listQuery: "/",

    // endpoint base do seu DRF
    endpoint: API_ROUTES.ATADEACOMPANHAMENTO,

    fields: [
      {
        name: "dataReuniao",
        label: "Data da Reunião",
        type: "datetime",
        required: true,
      },

      {
        name: "participantes",
        label: "Participantes",
        type: "text",
        required: true,
      },

      {
        name: "descricao",
        label: "Descrição",
        type: "text",
        required: true,
      },

      {
        name: "ator",
        label: "Ator",
        type: "text",
        required: true,
      },

      // SELECT — Relacionamento com período letivo
      {
        name: "peiperiodoletivo",
        label: "Período Letivo",
        type: "select",
        required: true,
        source: API_ROUTES.PEIPERIODOLETIVO,
        mapLabel: (p) => `${p.periodo_principal} (${p.data_criacao} - ${p.data_termino})`,
        mapValue: (p) => p.id,
      },
    ],

    // Transformar objeto vindo da API → form
    mapResponseToForm: (item) => ({
      dataReuniao: item.dataReuniao ?? "",
      participantes: item.participantes ?? "",
      descricao: item.descricao ?? "",
      ator: item.ator ?? "",
      peiperiodoletivo: item.peiperiodoletivo ?? "",
    }),

    // Transformar form → payload enviado pro Django
    mapFormToPayload: (form) => ({
      dataReuniao: form.dataReuniao,
      participantes: form.participantes,
      descricao: form.descricao,
      ator: form.ator,
      peiperiodoletivo: Number(form.peiperiodoletivo),
    }),
  },

  pareceres: {
  key: "pareceres",
  title: "Pareceres",
  endpoint: API_ROUTES.PARECER,
  listQuery: "/",

  fields: [
    {
      name: "componente_curricular",
      label: "Componente Curricular",
      type: "select",
      source: API_ROUTES.COMPONENTECURRICULAR,

      mapLabel: (c) => c.disciplina?.nome || `Componente ${c.id}`,
      mapValue: (c) => c.id,

      displayField: "disciplina.nome", 
      required: true
    },
    {
      name: "professor",
      label: "Professor",
      type: "select",
      source: API_ROUTES.USUARIO,
      mapLabel: (u) => u.nome || u.username || `Usuário ${u.id}`,
      mapValue: (u) => u.id,
      required: true,
    },
    {
      name: "texto",
      label: "Texto do Parecer",
      type: "textarea",
      required: true,
    },
  ],

  // Transformar objeto da API para form de edição
  mapResponseToForm: (item) => ({
    componente_curricular: item.componente_curricular?.id || "", // só ID
    professor: item.professor?.id || "", // só ID
    texto: item.texto || "",
  }),

  // Transformar form → payload enviado pro backend
  mapFormToPayload: (form) => ({
    componente_curricular_id: Number(form.componente_curricular),
    professor_id: Number(form.professor),
    texto: form.texto,
    // data é auto_now_add, não incluímos
  }),
},

};

export default modelsSchemas;
