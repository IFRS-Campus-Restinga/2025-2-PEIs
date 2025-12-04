// src/components/BuscaAutoComplete.js ou similar
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../configs/apiRoutes'; // Assumindo que API_ROUTES.ALUNO existe

// Hook simples de Debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// --- Componente Autocomplete ---
const BuscaAutoComplete = ({ onSelectAluno, initialValue = "", disabled = false, clearFieldAlert }) => {
  const [searchText, setSearchText] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 300); // 300ms de atraso
  
  function getAuthHeaders() {
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    return token ? { Authorization: `token ${token}` } : {};
  }

  const DBALUNO = axios.create({
      baseURL: API_ROUTES.ALUNO,
      headers: getAuthHeaders()
    });

  [DBALUNO].forEach(api => {
    api.interceptors.request.use(config => {
      config.headers = getAuthHeaders();
      return config;
    });
  });

  // Dispara a busca quando o texto debounced muda (e tem 3+ caracteres)
  useEffect(() => {
    const minLength = 3;
    
    if (debouncedSearchText.length >= minLength) {
      fetchSuggestions(debouncedSearchText);
    } else {
      setSuggestions([]); // Limpa se for menor que o mínimo
    }
    
    // Se o campo for totalmente limpo, também limpa os alertas
    if (debouncedSearchText.length === 0) {
        clearFieldAlert('aluno_id');
    }

  }, [debouncedSearchText]);

  // Função de busca no backend Django
  const fetchSuggestions = async (query) => {
    setIsLoading(true);
    try {
      // Usaremos o endpoint padrão do AlunoViewSet, mas com o parâmetro 'search'
      const resp = await DBALUNO.get(`/?search=${query}`);
      // Assumindo que o AlunoViewSet retorna um objeto com 'results' (padrão DRF) ou o array direto
      const data = resp.data;
      setSuggestions(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erro na busca de alunos:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (aluno) => {
    // 1. Preenche o input com o nome do aluno
    setSearchText(aluno.nome);
    
    // 2. Notifica o componente pai (CreatePeiCentral) do aluno_id
    onSelectAluno(aluno.id);
    
    // 3. Limpa a lista de sugestões
    setSuggestions([]);
    
    // 4. Limpa o alerta do campo (caso tenha erro de validação)
    clearFieldAlert('aluno_id');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Se o usuário está digitando (e não selecionou), o ID deve ser limpo no Form principal
    if (value.length === 0) {
        onSelectAluno(""); 
    }
  };
  
  // Condicional para mostrar a lista (suggestions.length > 0 e não está disabled)
  const showSuggestions = suggestions.length > 0 && !disabled;

  return (
    <div>
     
      <textarea
        rows={1} 
        value={searchText}
        onChange={handleChange}
        placeholder="Digite ao menos 3+ letras/números para buscar o aluno..."
        className="border px-2 py-1 rounded w-full resize-none" // Adicionei 'resize-none' para evitar que o usuário mude o tamanho
        disabled={disabled}
      />
      
      {/* Indicador de Carregamento (opcional, mas recomendado) */}
      {isLoading && <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Carregando...</p>}
      
      {/* Lista de Sugestões Clicáveis */}
      {showSuggestions && (
        <ul style={{
          position: 'absolute',
          zIndex: 10,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          maxHeight: '200px',
          overflowY: 'auto',
          width: '100%',
          listStyleType: 'none',
          padding: 0,
          margin: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {suggestions.map((aluno) => (
            <li
              key={aluno.id}
              onClick={() => handleSelect(aluno)}
              style={{
                padding: '8px 10px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <strong>{aluno.nome ?? `#${aluno.id}`}</strong> - {aluno.matricula}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuscaAutoComplete;
