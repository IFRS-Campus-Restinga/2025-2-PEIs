<h1>Sistema PEI - Documentação</h1>

<h2>Como iniciar</h2>

<p>Os seguintes passos devem ser executados para realização do download do sistema e colocá-lo no ar, seja para fins de teste ou avaliação (como para os professores)
ou mesmo para continuar o desenvolvimento a partir da branch main.</p>

<h3>1. Download das plataformas:</h3>

<p>É necessário estar usando Windows, faça o download do arquivo ZIP abaixo. <i>"Mas eu tenho um MacBook/Linux, não uso Windows."</i>
Para fazer uso completo da automação criada para desenvolvimento, vai ser necessário estar usando Windows. Use uma máquina do campus ou uma VM, a delimitação de sistema operacional
foi criada justamente para a uniformidade do ambiente e baseada no uso pessoal da equipe de desenvolvimento e das máquinas do campus. Segue o link de download:</p>

<p>Atualizado:
<a href="https://drive.google.com/file/d/1Vo7cUiN5Pftxs0ZVdKJrlYCkegWFXIA1">https://drive.google.com/file/d/1Vo7cUiN5Pftxs0ZVdKJrlYCkegWFXIA1</a></p>

<p>Basta criar uma pasta qualquer e descompactar o conteúdo do ZIP, logo após ele é dispensável. Usaremos como exemplo uma pasta chamada "dev2" criada na área de trabalho. O ZIP vai
lhe fornecer todo o ambiente Python, Node e Git que é dependência para nosso projeto. Não é necessária nenhuma instalação e nenhuma alteração será feita na sua instalação de Windows,
realmente é só deixar as pastas dentro da sua pasta geral "dev2".</p> <i>"Eu já tenho essas três plataformas instaladas, posso usar as que já possuo?"</i> Até pode, mas isso vai te obrigar
a realizar alguns comandos manualmente. Por exemplo, toda vez que você baixar o conteúdo do repositório do github, você precisaria gerar manualmente o token do superuser do Django
(mais sobre isso depois). Também precisa ter certeza que seu python possui todas as bibliotecas que estamos usando, pois diferente do node, o python salva elas dentro da plataforma e
não na pasta do projeto. Enfim, só há vantagens em usar essas plataformas comuns e apenas mais transtorno em tentar seguir isolado delas. Basta criar o seu diretório (como "dev2")
e descompactar lá dentro. Simples assim.</p>

<h3>2. Download do projeto atual:</h3>
<p>Abra a sua pasta "dev2" no vscode e abra um terminal de powershell. Considerando que o terminal sempre abre na pasta do projeto, use o seguinte comando para fazer o download:</p>

```powershell
.\git\bin\git.exe clone https://github.com/IFRS-Campus-Restinga/2025-2-PEIs.git
```

<p><b>OBS:</b> Considere <b>!!! SEMPRE !!!</b> todos os comandos como sendo executados em um terminal powershell do vscode estando parado na pasta geral do projeto (aqui chamada "dev2")!</p>

<p>O comando acima usa nosso git portátil para baixar o conteúdo da branch main. É bem possível que você precise autenticar no github para continuar, melhor é já deixar o navegador logado.
Perceba também que o git tenta evitar sobrescrita de arquivos criando uma nova pasta "2025-2-PEIs" com todo conteúdo que veio do repositório lá dentro. Você pode entrar na pasta, recortar
tudo e colar na mesma pasta "dev2" onde você descompactou as plataformas, depois apague a pasta "2025-2-PEIs" que estará vazia. O seu diretório "dev2" estará correto se contiver a seguinte
lista de arquivos e pastas:</p>

<ul><li>.git - pasta de metadados do github, é oculta, importante ter certeza que veio junto</li>
<li>backpei - pasta do projeto django do backend</li>
<li>frontpei - pasta do projeto react do frontend</li>
<li>git - pasta de toda a plataforma git</li>
<li>node - pasta da plataforma node onde roda o frontend</li>
<li>python - pasta do python que contém inclusive nossos middlewares</li>
<li>.gitignore - arquivo com a lista de coisas que não devem ir para o repositório</li>
<li>LICENSE - arquivo genérico dizendo qual o tipo de licença do nosso código</li>
<li>limpeza.sh - script bash opcional que limpa arquivos desnecessários</li>
<li>README.md - documentação do projeto, é isso que você está lendo aqui</li>
<li>sobeDjango.py - script de inicialização do projeto django</li>
<li>sobeReact.py - script de inicialização do projeto react</li></ul>

<h3>3. Inicializar os webservers:</h3>
<p>Você deve utilizar dois terminais powershell no vscode para prender os processos dos webservers em cada um deles. Em um terminal você vai subir o REST do django, com o script sobeDjango.py
e no outro você vai subir o frontend com o script sobeReact.py. Assim sendo, no primeiro terminal, considerando que ele está na pasta "dev2", utilize esse comando:</p>

```powershell
.\python\python.exe .\sobeDjango.py
```

<p>Pode responder que sim para as perguntas de refazer o migrate e apagar o banco. Toda vez que você modificar models significativamente, é bom rodar esse script de novo zerando as migrações
e apagando o banco. Já no seu segundo terminal nós iremos levantar o react. Considerando que ele estará na pasta "dev2", rode esse comando:</p>

```powershell
.\python\python.exe .\sobeReact.py
```

<p>Caso você já tenha a pasta node_modules no projeto (não vai ter quando vier do github), o script vai perguntar se quer apagar ela e baixar os pacotes de novo. Então pronto, você pode
acessar <b>http://localhost:5173</b> no seu navegador para usar o sistema.</p>

<p><b>ATENÇÃO:</b> Sempre que você quiser apagar tudo que fez e começar limpo de novo a partir do repositório, você pode apagar tudo da pasta "dev2" e manter apenas as pastas "git", "node" e
"python" que haviam vindo do ZIP "plataformas.zip". Então faça o git clone novamente a partir do ponto 2 desse tutorial.</p>

<h2>Usando o Github:</h2>

<p>Se você não criou sua branch, <a href="https://github.com/IFRS-Campus-Restinga/2025-2-PEIs/branches">clique nesse link</a> e vá em "New branch" no canto superior direito, criando uma branch
com seu nome a partir da main.</p> Sempre que você faz o git clone, ele faz o download de todas as branchs mas você trabalha na default, que é a main. Você pode sair usando sua própria branch
com o seguinte comando:</p>

```powershell
.\git\bin\git.exe clone -b MinhaBranch https://github.com/IFRS-Campus-Restinga/2025-2-PEIs.git
```

<p>Você pode ver a branch que está usando com o comando abaixo. Apenas lembre que o comando deve ser dado onde está a pasta oculta .git, então a cada clone a prática recomendada para nosso projeto
é mover todo o conteúdo da pasta "2025-2-PEIs" que é criada pelo clone para o mesmo local onde estão suas pastas das plataformas "git", "node", e "python". Depois apague a pasta vazia. Segue
o comando que vê sua branch atual:</p>

```powershell
.\git\bin\git.exe branch -a
```

<p>Você pode trocar muito facilmente de branch com o seguinte comando:</p>

```powershell
.\git\bin\git.exe checkout main
```

<p>No exemplo acima, supondo que você estava na sua branch, você volta para a main. Os próprios arquivos exibidos pelo vscode vão mudar e você sempre pode confirmar onde está com o "branch -a".</p>
<p><b>Agora importante:</b> Você sempre vai commitar <b>!!! NA SUA PRÓPRIA BRANCH !!!</b> sempre, pra isso SEMPRE garanta que você está nela com o branch -a e você pode salvar seu progresso
com os seguintes comandos:</p>

```powershell
.\git\bin\git.exe checkout MinhaBranch <== te liga
.\git\bin\git.exe branch -a <== confirme que está na sua
.\git\bin\git.exe add .
.\git\bin\git.exe commit -m "escreva brevemente o que fez"
.\git\bin\git.exe push origin MinhaBranch
```

<p>Pode conferir pelo site do github que tudo deu certo. Para atualizar a main, ou nós usaremos pull requests que precisam de aprovação de todo o time, ou vamos fazer inserções pontuais. Em qualquer
dos casos nós sempre faremos todos juntos em aula.</p>

<p>É bem provável que ao final de cada sprint, com o progresso de todos salvo na main, além de apagar os arquivos do seu computador você também queira resetar sua branch para ficar igual ao main.
É possível simplesmente apagar ela na interface web e criar de novo. Ou então pode ser dado os seguintes comandos, desde que com muita cautela. Comece apagando seu conteúdo local, então execute:</p>

```powershell
.\git\bin\git.exe clone https://github.com/IFRS-Campus-Restinga/2025-2-PEIs.git
.\git\bin\git.exe checkout MinhaBranch <== pelo amor de deus
.\git\bin\git.exe branch -a <== confirme mil vezes que é a sua
.\git\bin\git.exe reset --hard main
.\git\bin\git.exe push --force origin MinhaBranch
```

<p>Confira que ficou certinho no site e pode apagar todo seu conteúdo local (procure preservar as plataformas, para não precisar fazer o download de novo).</p>

<h2>Segurança na comunicação</h2>

<p>O essencial da pilha de tecnologia está em que o lado do backend em Django é responsável basicamente apenas pela persistência de dados, entregando uma interface REST para a comunicação. O frontend React apenas lê e insere dados através dessa API, mas não tem nenhum tipo de persistência própria. Sendo o frontend uma casca vazia, todo o foco da segurança se baseia em proteger os dados do Django contra leitura indevida e principalmente gravação.</p>

<p>Sendo o login terceirizado para o Google, optou-se por não vincular a usuários as permissões de acesso, todo o REST é fechado para uma credencial única do superuser do Django. Essa credencial é criada nova toda vez no script sobeDjango.py, através das seguintes linhas:</p>

```python
# agora precisamos criar novamente a conta de administrador
senhaAdmin = "PEIDev2IFRS"
User.objects.create_superuser(username="administrador", password=senhaAdmin, email="")
print(f"Conta \"administrador\" criada com senha \"{senhaAdmin}\".")
# tambem gerar novamente o token do administrador
user = User.objects.get(username="administrador")
token, created = Token.objects.get_or_create(user=user)
print(f"Token do administrador: {token.key}")
# esse token controla nosso acesso ao rest, salvando na pasta do projeto
arquivoToken = os.path.join(baseDir, "backpei", "token.txt")
with open(arquivoToken, "w") as f:
f.write(token.key)
```

<p>Traduzindo o código, a conta que está sendo criada se chama "administrador", ela é a conta de superuser do Django e senha padrão está definida para "PEIDev2IFRS". Essa credencial está gerando um token que é, por padrão, salvo no banco de dados mas também estamos o escrevendo em um arquivo chamado "token.txt" na pasta raíz do projeto (ao lado do manage.py). Essa é a única conta sendo criada no Django e só a ela está liberado o REST, através da apresentação do token (que carrega, em si, toda a identidade e senha do usuário, como um cartão de acesso total).</p>

<p>Poderia se pensar, então, que basta o frontend apresentar o token para poder usar o REST. Em tese, sim, seria até suficiente para desenvolvimento. Mas já colocamos uma camada a mais. O problema de apresentar o token no frontend é que ele está visível para quem souber procurar, basta investigar nas ferramentas de desenvolvedor do navegador como a comunicação de baixo nível ocorre. Uma vez que o hacker tivesse o token, nada o impediria de acessar completamente nosso REST diretamente, ignorando totalmente nossa interface do frontend e regras que ela poderia estar impondo.</p>

<p>Se não podemos apresentá-lo do frontend, o que fazer? O token ainda é necessário pois ele é a credencial do único usuário autorizado a acessar o REST. Pois a solução adotada foi de injetar o token do próprio backend no cabeçalho de comunicação, sem jamais passá-lo pelo navegador do usuário ou qualquer camada onde poderia estar exposto. Porém, isso só acontece se a comunicação vier de uma única fonte possível, o localhost:5173 ou, em outras palavras, apenas do nosso próprio frontend. Na prática, opera como uma relação de confiança entre os dois webservers. Se a comunicação com o REST vier de localhost:5173, o token é injetado e libera o acesso aos dados. Essa mecânica inicia ao ser inserida essa linha em cada view expondo dados:</p>

```python
permission_classes = [BackendTokenPermission]
```

<p>A permission chamada BackendTokenPermission, por sua vez, possui o seguinte código e faz referências a configurações de segurança que estão no settings.py, veja:</p>

```python
from django.conf import settings
from rest_framework.permissions import BasePermission

class BackendTokenPermission(BasePermission):
    def has_permission(self, request, view):
        token_recebido = request.headers.get("X-BACKEND-TOKEN")
        origin = request.headers.get("Origin")
        referer = request.headers.get("Referer")

        origem_permitida = origin in settings.CORS_ALLOWED_ORIGINS or (
            referer and any(r in referer for r in settings.CORS_ALLOWED_ORIGINS)
        )

        return token_recebido == settings.API_TOKEN and origem_permitida
```

<p>Perceba ao menos duas configurações do settings.py são citadas diretamente, o CORS_ALLOWED_ORIGINS e API_TOKEN. O CORS é um pacote chamado "django-cors-headers" que precisa ser instalado com o pip, passando ser, portanto, uma dependência do nosso projeto. Mas vamos então revisar todas as linhas relevantes do settings.py:</p>

```python
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
INSTALLED_APPS = [..., "corsheaders", ...]
MIDDLEWARE = [...
    'corsheaders.middleware.CorsMiddleware',
    # middleware customizado do app services para o token
    'services.middleware.AddBackendTokenHeaderMiddleware', ...]
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
# configuracao dos hosts permitidos do cors
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
# adiciona nosso token do usuario administrador
# ele le o arquivo token.txt que criamos no sobeDjango
TOKEN_FILE = BASE_DIR / "token.txt"
with open(TOKEN_FILE) as f:
    API_TOKEN = f.read().strip()
```

<p>Perceba que também existe referêcia a um middleware customizado nosso, que é o responsável por injetar o token. Ele faz parte do app "services" e possui o seguinte código:</p>

```python
from django.conf import settings
class AddBackendTokenHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        origin = request.META.get("HTTP_ORIGIN", "")
        # apenas injeta o token se a requisição veio do react (localhost:5173)
        if origin == "http://localhost:5173":
            request.META['HTTP_X_BACKEND_TOKEN'] = settings.API_TOKEN
        return self.get_response(request)
```

<p>Agora que todas as linhas relevantes estão identificadas, vamos às considerações relacionadas a funcionamento e implicações:</p>

<ul>
<li>A interface do REST só está liberada através do uso do token do superuser do Django, criado no sobeDjango.py</li>
<li>Esse token transita apenas no backend e é lido de "token.txt" no diretório raíz do projeto do backend</li>
<li>Para produção, se for decidido rotacionar esse token, além do registro no banco de dados é necesário escrevê-lo em "token.txt"</li>
<li>A liberação do REST através do token só ocorre se a comunicação requisitando vier de localhost:5173 em um tipo de relação de confiança</li>
<li>Ou seja, Django e React precisam estar na mesma máquina. Se alguém pudesse comprometer o React, toda a máquina já estaria comprometida igualmente</li>
<li>Em implementação Docker, se cada ponta rodar em um container isolado, será necessário rever essa mecânica ou apontar a nova identidade de origem no código</li>
<li>Em qualquer implementação onde as duas pontas fiquem separadas, recomenda-se a utilização de HTTPS para proteger a comunicação em produção</li>
<li>Se for utilizada uma base image única para ambos os serviços em Docker, com a mesma arquitetura o REST estaria ainda mais protegido ao expor apenas o React</li>
<li>Considerando a implementação Docker em container único, toda a comunicação entre as pontas ficaria isolada interna no container</li>
</ul>

<h2>Usuários e Login</h2>

<p>Toda a autenticação de usuário é basicamente "terceirizada" para o Google. Isso significa que não guardamos nomes de usuários, senhas, nem nenhum tipo de credencial de acesso. O motivo da escolha pelo Google se deu não apenas por ser demanda de PO, mas também por ser a melhor credencial utilizada no campus, que é cliente do Google e já o usa para o e-mail institucional.</p>

<p>Para configurá-lo é preciso, primeiro, criar com o Google o serviço de autenticação. Você precisa de uma conta do Google com a qual vai assinar serviços do Google Cloud (sim, é pago, mas tem três meses de passe livre). A assinatura que fizemos vai durar até o fim da disciplina, mas para produção será necessário trocar o Client ID para algo definitivo, mostraremos onde no código logo mais.</p>

<p>A configuração na ponta do Google se dá pelo link <a href="https://console.cloud.google.com">https://console.cloud.google.com</a>, então no menu esquerdo ir em "APIs e Serviços" e depois  "Credenciais". Nós criamos uma credencial de OAuth 2.0 chamada "ifrspei", nela são configuradas as origens e redirecionamentos desejados que, no nosso caso, ficaram como "localhost:5173" em ambos os casos. Ou seja, é algo que é processado e resolvido apenas no frontend React, não há qualquer relação com o backend Django da forma como foi implementado. Uma vez configurado o serviço no Google, você recebe uma Client ID que será necessária no código e é essa identidade que precisará ser trocada no futuro para produção.</p>

<p>No React, dois novos pacote passam a ser depedências e instalados com o NPM. O pacote "<i>@react-oauth/google</i>" que de fato é responsável pela autenticação, bem como também o "<i>jwt-decode</i>" que é necessário para "abrir" a credencial do Google e extrair as informações sobre o usuário. A implementação que fizemos no código se deu logo no nível do App.jsx, importando as seguintes bibliotecas:</p>

```javascript
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
```

<p>Logo em seguida, no trecho de funções JavaScript do App.jsx, precisamos primeiro criar os estados necessários para o login:</p>

```javascript
// ------------------------------------------------------------
// estados para login google
const [usuario, setUsuario] = useState(null)
const [logado, setLogado] = useState(false)
```

<p>Então temos também a declaração de duas funções, uma para o login de sucesso, outra para erro:</p>

```javascript
// ------------------------------------------------------------
// callback de sucesso no login
const sucessoLoginGoogle = (credentialResponse) => {
  try {
    const dados = jwtDecode(credentialResponse.credential)
    setUsuario({ email: dados.email, nome: dados.name })
    setLogado(true)
  } catch (erro) {
    console.error('Erro ao decodificar token do Google:', erro)
    setUsuario(null)
    setLogado(false) } }

// ------------------------------------------------------------
// callback de erro no login
const erroLoginGoogle = () => {
  console.error('Falha no login com o Google')
  setUsuario(null)
  setLogado(false) }
```

<p>Então no trecho de HTML do "return", teremos o seguinte código. Perceba que é aqui, logo na primeira linha, que especificamos o Client ID do Google que deve ser trocado futuramente para produção. Perceba, também, que o estado "logado" (um booleano) é usado para mostrar ou uma saudação, ou renderizar o botão de login do Google:</p>

```jsx
<GoogleOAuthProvider clientId="1050578287576-b870ajrmae9eioc0k2mumod0digo54fd.apps.googleusercontent.com">
  { logado ? (
    <div>
      <div>Olá, {usuario.nome} ({usuario.email}).<br />
      <button onClick={() => { setUsuario(null); setLogado(false); }}>Logout</button></div>
    </div>
  ) : (  
    <div>
      <p>Você precisa fazer login para acessar o sistema.</p>
      <GoogleLogin
        onSuccess={sucessoLoginGoogle}
        onError={erroLoginGoogle}
      />
    </div>
  ) }
</GoogleOAuthProvider>
```

<p>O código foi obviamente muito reduzido para apenas mostrar os trechos essenciais e não poluir demais a documentação. A experiência de uso mostrou que, embora funcional, a implementação de apenas um estado "logado" para controle de login estava demasiadamente volátil. Bastava atualizar a página para resetar o estado para falso ou então salvar qualquer arquivo de código, recarregando o webserver. Decidimos que era necessário criar algum tipo de mecanismo de persistência de login, que foi implementado salvando as informações de login no navegador do usuário. Ou seja, enquanto o usuário não limpar seus dados de navegação do browser, ele permenecerá logado no sistema, por hora sem nenhum tipo de expiração. O código necessário foi o seguinte. Primeiro, verificar ao carregar a página se os dados de login já estão salvos no navegador:</p>

```javascript
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario")
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo))
      setLogado(true)
    }
  }, [])
```

<p>Adicionar duas linhas para salvar os dados do login na função de sucesso, deixando ela assim:</p>

```javascript
const sucessoLoginGoogle = (credentialResponse) => {
    try {
      const dados = jwtDecode(credentialResponse.credential)
      const userData = { email: dados.email, nome: dados.name }

      setUsuario(userData)
      setLogado(true)

      // Salva no localStorage
      localStorage.setItem("usuario", JSON.stringify(userData))
      localStorage.setItem("token", credentialResponse.credential) // Salva o token JWT para uso momentaneo nos logs
```

<p>E, claro, uma função de logout para que não apenas sejam resetados os estados, como apagados os dados referentes no navegador:</p>

```javascript
  const logout = () => {
    setUsuario(null)
    setLogado(false)
    localStorage.removeItem("usuario") // limpa persistência
    localStorage.removeItem("token") // limpa o token também
  }
```

<p>Da forma como está, nossa implementação do login do Google aceita qualquer conta e em praticamente nada dialoga com o restante do sistema. Passaremos agora a documentar como que, a partir das credenciais da conta Google, o usuário é validado como uma conta legítima da instituição e como ele recebe permissão para, de fato, acessar o sistema.</p>

<h2>Cadastro de Usuário do Sistema</h2>

<p>...</p>

<h2>API para mapear models e retornar metadados para construção de formulários e listagem</h2>
<h3>Visão Geral</h3>

<p>Esta API fornece:
Lista de todos os endpoints reais associados aos models da aplicação.

Estrutura completa dos models:
Campos
Tipos de input
Se é obrigatório
Choices
Relacionamentos FK/ManyToMany
Endpoints especializados (ex: busca de professores, coordenadores)
Campos ocultos
Campos não editáveis

O objetivo é permitir ao frontend gerar formulários totalmente dinâmicos sem necessidade de hardcode.</p>

<h3>Endpoint principal do schema:</h3>
<p>http://localhost:8000/services/schema/

<p>Este endpoint serve como índice. Ele:

Lista todos os modelos cadastrados no ENDPOINT_MAP
Retorna as URLs reais da API para cada recurso
Inclui o próprio link para o schema detalhado de cada model

Exemplo de Resposta (JSON):
{
    "usuario": "http://localhost:8000/services/usuario/",
    "conteudo": "http://localhost:8000/services/conteudo/",
    "parecer": "http://localhost:8000/services/parecer/",
    "cursos": "http://localhost:8000/services/cursos/",
    "aluno": "http://localhost:8000/services/aluno/",
    "pei_central": "http://localhost:8000/services/pei_central/",
    "PEIPeriodoLetivo": "http://localhost:8000/services/PEIPeriodoLetivo/",
    "disciplinas": "http://localhost:8000/services/disciplinas/",
    "componenteCurricular": "http://localhost:8000/services/componenteCurricular/",
    "ataDeAcompanhamento": "http://localhost:8000/services/ataDeAcompanhamento/",
    "documentacaoComplementar": "http://localhost:8000/services/documentacaoComplementar/",
    "notificacoes": "http://localhost:8000/services/notificacoes/",
    "schema": "http://localhost:8000/services/schema/"
}

<h3>GET /services/schema/{model}/:</h3>
<p>Este endpoint, especificando o model que deve ser mapeado via rota do React, irá retornar a estrutura detalhada do model especificado, exemplo:</p>

    <h4>GET /services/schema/componenteCurricular/ </h4>

{
    "model": "componenteCurricular",
    "fields": [
        {
            "name": "id",
            "required": true,
            "type": "BigAutoField"
        },
        {
            "name": "objetivos",
            "required": true,
            "type": "CharField"
        },
        {
            "name": "conteudo_prog",
            "required": true,
            "type": "CharField"
        },
        {
            "name": "metodologia",
            "required": true,
            "type": "CharField"
        },
        {
            "name": "disciplinas",
            "required": true,
            "type": "select",
            "related_model": "Disciplina"
        },
        {
            "name": "periodos_letivos",
            "required": true,
            "type": "multiselect",
            "related_model": "PEIPeriodoLetivo"
        }
    ]
}

<h3>O que retorna?</h3>
<p>Para cada campo do model:

name: nome do campo no Django
required: se o campo é obrigatório
type: tipo de input no frontend (file, text, select, multiselect, char, integer etc.)
choices: lista de valores possíveis (se aplicável)
related_model: nome do model relacionado (FK ou M2M)
related_endpoint: endpoint customizado (casos especiais)</p>

<h3>Regras importantes:</h3>

<p>Campos ocultos não aparecem (periodo_principal, ou outros definidos no HIDDEN_FIELDS)
Campos reverse (relações automáticas) não aparecem
Campos não editáveis são ignorados
Campos relacionais têm tratamento especial</p>

<h3>Este serviço existe para:</h3>

✔ Criar formulários dinâmicos
✔ Criar telas CRUD sem código repetido
✔ Reduzir necessidade de mapeamentos manuais
✔ Centralizar lógica de frontend
✔ Permitir adição de models sem ajustes no React/JS/Flutter




