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

<h2> API de Schema Dinâmico — Mapeamento de Models para Formulários e Listagens</h2>
<p>Caminho para o arquivo dentro do projeto:</p>
<pre><code>backpei/pei/services/views/model_schema_view.py</code></pre>

<p>
Esta API fornece metadados completos dos <strong>models</strong> da aplicação, permitindo que o frontend
gere formulários e interfaces totalmente dinâmicas, sem necessidade de códigos fixos (hardcoded).
</p>

<hr/>

<h3> Visão Geral</h3>

<p>A API oferece:</p>

<ul>
    <li> Lista de todos os endpoints reais associados aos models</li>
    <li> Estrutura detalhada de cada model, incluindo:
        <ul>
            <li>Nome e tipo de cada campo</li>
            <li>Informação sobre obrigatoriedade</li>
            <li>Choices (opções pré-definidas)</li>
            <li>Campos de relacionamento (FK e ManyToMany)</li>
            <li>Tipos adequados para construção de inputs no frontend</li>
            <li>Endpoints especializados para filtragem (ex: professores, coordenadores)</li>
        </ul>
    </li>
    <li> Respeito a regras internas:
        <ul>
            <li>Campos ocultos definidos em <code>HIDDEN_FIELDS</code></li>
            <li>Ignora campos reverse (relações automáticas)</li>
            <li>Ignora campos marcados como não editáveis</li>
        </ul>
    </li>
</ul>

<p>O objetivo central é permitir geração automática de formulários e páginas CRUD,
reduzindo retrabalho e garantindo consistência com o backend.</p>

<hr/>

<h3> Endpoint Principal</h3>

<pre><code>GET http://localhost:8000/services/schema/</code></pre>

<p>Este endpoint funciona como o índice do schema. Ele:</p>

<ul>
    <li>Retorna todos os models configurados em <code>ENDPOINT_MAP</code></li>
    <li>Mapeia cada model ao seu endpoint real da API</li>
    <li>Inclui o próprio link para acessar o schema individual de cada model</li>
</ul>

<h3> Exemplo de Resposta</h3>

<pre><code>{
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
</code></pre>

<hr/>

<h3> Endpoint de Schema por Model</h3>

<pre><code>GET /services/schema/&lt;model&gt;/</code></pre>

<p>
Retorna a estrutura completa do model especificado.  
Este endpoint é consumido pelo frontend para construção dinâmica de formulários, listas, selects, multiselects etc.
</p>

<h3> Exemplo real:</h3>

<pre><code>GET /services/schema/componenteCurricular/</code></pre>

<h3>Resposta:</h3>

<pre><code>{
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
</code></pre>

<hr/>

<h3> O que cada campo representa?</h3>

<p>Cada item dentro de <code>fields[]</code> contém:</p>

<ul>
    <li><strong>name</strong> — nome do campo no model</li>
    <li><strong>required</strong> — se é obrigatório no formulário</li>
    <li><strong>type</strong> — tipo esperado no frontend:
        <ul>
            <li><code>file</code></li>
            <li><code>select</code></li>
            <li><code>multiselect</code></li>
            <li><code>CharField</code>, <code>IntegerField</code>, etc.</li>
        </ul>
    </li>
    <li><strong>choices</strong> — lista de opções (caso o campo tenha choices)</li>
    <li><strong>related_model</strong> — nome do model relacionado (FK / M2M)</li>
    <li><strong>related_endpoint</strong> — endpoint especializado (quando aplicável)</li>
</ul>

<hr/>

<h3>Regras Internas</h3>

<ul>
    <li> <strong>Campos ocultos</strong> definidos em <code>HIDDEN_FIELDS</code> não aparecem no schema</li>
    <li> Campos reverse (relações automáticas) são ignorados</li>
    <li> Campos com <code>editable = False</code> são descartados</li>
    <li> <strong>ForeignKeys</strong> são retornados como <code>select</code></li>
    <li> <strong>ManyToMany</strong> são retornados como <code>multiselect</code></li>
    <li> <strong>FileField</strong> é retornado como <code>file</code></li>
</ul>

<hr/>

<h3> Benefícios deste Serviço</h3>

<ul>
    <li>✔ Criação automática de formulários dinâmicos</li>
    <li>✔ Geração de telas CRUD sem repetição de código</li>
    <li>✔ Redução drástica de acoplamento entre frontend e backend</li>
    <li>✔ Consistência total com os models reais</li>
    <li>✔ Facilidade para adicionar novos models sem modificar o frontend</li>
    <li>✔ Ideal para arquiteturas baseadas em componentes</li>
</ul>

<hr/>

<h2>Componente de CRUD Dinâmico</h2>

<p>caminho para o componente no frontend:
<pre><code>frontpei/src/components/crud</code></pre></p>

<h3>Geração de formulários, telas de edição e listagens sem código repetido</h3>
<p>Este módulo implementa um CRUD Universal Dinâmico, capaz de gerar telas completas de criação, edição e listagem de registros sem necessidade de escrever componentes manuais para cada model.
Ele funciona consumindo a API de mapeamento de models (/services/schema/)</p>

<h3>1. Visão geral do funcionamento:</h3>
<p><strong>O fluxo de funcionamento é:</strong>
<ul>
<li>React envia o nome do model para o componente CrudUniversal.</li>
<li>O componente consulta o endpoint de serviços (/services/) para descobrir os links de cada model.</li>
<li>Em seguida, consulta o endpoint de schema:</li>
</ul>
<pre><code>GET /services/schema/{model}/</code></pre>

<p>Este endpoint retorna metadados completos do model.</p>

<p>O CRUD renderiza automaticamente:</p>
<ul>
<li>Formulário de criação</li>
<li>Listagem de registros</li>
<li>Edição inline</li>
<li>Remoção</li>
</ul>

<p>Nenhum componente específico para cada model é necessário.</p>

<h3>2. Arquitetura do CRUD Universal:</h3>
<p>Mapeia todos os endpoints reais da API:</p>

<pre><code>const [servicesMap, setServicesMap] = useState({}); </code></pre>

<p><strong>Carregamento da Metadata do Model</strong></p>
<pre><code>api.get(`${servicesMap.schema}${modelName}`); </code></pre>

<p>Aqui o CRUD recebe:</p>
<ul>
<li>Campos</li>
<li>Tipos</li>
<li>Choices</li>
<li>Relacionamentos</li>
<li>Campo obrigatórios</li>
<li>Campos editáveis</li>
</ul>

<p>Essa metadata passa a controlar toda a lógica da tela.</p>

<strong>Carregamento Dinâmico de Selects e MultiSelects</strong>

<p>Para cada campo select ou multiselect, o componente: </p>
<ul>
<li>Identifica o related_model</li>
<li>Converte nomes que precisam de exceção (Disciplina → disciplinas) </li>
<li>Busca automaticamente o endpoint correto</li>
<li>Carrega as opções</li>
</ul>
<pre><code>setSelectOptions((prev) => ({
  ...prev,
  [f.name]: options,
}));</code></pre>

Assim, uma FK pode aparecer automaticamente como dropdown.

<strong>Normalização de Payload:</strong>

<p>Antes de enviar ao backend, o CRUD transforma o payload:</p>
<ul>
<li>Converte IDs de selects para número</li>
<li>Converte arrays de multiselects</li>
<li>Adapta campos especiais (ex.: periodos_letivos_id)</li>
<li>Remove campos ignorados</li>
</ul>
Isso garante compatibilidade com o serializer no backend.

<strong>Criação de Registro (POST)</strong>
<pre><code>await api.post(getEndpoint(modelName), payload);</code></pre>

O payload já vem normalizado.

<strong>Edição Inline (PUT)</strong>

<p>Quando o usuário clica em Editar, o CRUD:</p>
<ul>
<li>Normaliza o registro retornado do backend</li>
<li>Preenche o formulário com os valores corretos</li>
<li>Salva via PUT</li>
</ul>
<pre><code>await api.put(`${getEndpoint(modelName)}${id}/`, payload);</code></pre>

<strong>Exclusão</strong>

<p>A deleção usa um componente dedicado:</p>
<pre><code><BotaoDeletar id={r.id} axiosInstance={getEndpoint(modelName)} /></pre></code>

<strong>Renderização Dinâmica de Inputs</strong>

<p>O método renderInput decide qual componente utilizar:</p>

| Tipo DRF           | Tipo do Form        | Exemplo                     |
|--------------------|---------------------|------------------------------|
| CharField          | text                | `<input type="text">`        |
| IntegerField       | number              | `<input type="number">`      |
| DateField          | date                | `<input type="date">`        |
| FileField          | file                | `<input type="file">`        |
| select + choices   | enum                | `<select>`                   |
| select + FK        | dropdown (API)      | `<select>`                   |
| multiselect        | checkbox list       | *lista de checkboxes*        |

<p>Não é necessário escrever nenhum input manual. </p>

<strong>Renderização da Listagem</strong>

<p>O componente lista todos os registros usando a mesma metadata, formatando:</p>
<ul>
<li>Selects</li>
<li>Choices</li>
<li>Many-to-many</li>
<li>Arquivos</li>
<li>Datas</li>
</ul>
<p>Tudo baseado no tipo do campo detectado dinamicamente.</p>

<strong>Exceções de Models</strong>

<p>Alguns nomes de models precisam ser ajustados, por exemplo:</p>

<pre><code>const exceptions = {
  Disciplina: "disciplinas",
  ComponenteCurricular: "componenteCurricular",
  CustomUser: "usuario",
  Curso: "cursos",
};</code></pre>

<p>Isso garante que o nome do model → endpoint real seja interpretado corretamente.</p>

<strong><p>Benefícios do CRUD Dinâmico</p></strong>
<p>✔ Zero repetição de código</p>
<p>Sem componentes separados para Curso, Aluno, Disciplina, etc.
</p>

<p>✔ O backend controla a UI</p>
Alterou o model?
O schema muda e o CRUD se adapta automaticamente.

<p>✔ Expansão instantânea</p>
Criou um novo model e adicionou ao schema?
Já funciona no frontend sem desenvolver nenhuma tela.

<p>✔ Redução de bugs</p>
Menos código duplicado significa menos inconsistências.

<p>✔ Padronização das telas</p>
Todas as telas CRUD ficam unificadas, limpas e previsíveis.</p>

<strong>Conclusão</strong>
Este componente transforma a aplicação em uma plataforma extremamente escalável, onde novos models podem ser manipulados pelo frontend sem desenvolvimento adicional, graças à integração entre:
<ul>
<li>API de Metadados</li>
<li>CRUD Universal Dinâmico</li>
</ul>

<p>Essa abordagem combina:</p>
<ul>
<li>Flexibilidade</li>
<li>Padronização</li>
<li>Redução de esforço/li>
<li>Baixa manutenção</li>
<li>Expansão rápida</li>
</ul>

<h2>Sistemas de alertas (Toast + Inline + Confirmação)</h2>
<p>Este módulo fornece um sistema completo de alertas para aplicações React, incluindo:</p>

<ul>
<li>Toasts (alertas temporários no canto inferior direito)</li>
<li>Alertas Inline (mensagens associadas a campos de formulário)</li>
<li>Alertas de Confirmação (modal centralizado com Sim/Não)</li>
<li>Limpeza automática ao trocar de rota</li>
<li>Suporte a callbacks onConfirm e onCancel</li>   
</ul>

<h3>Instalação e Estrutura:</h3>
<p>O sistema é composto por dois arquivos:</p>
<pre><code>src/context/AlertContext.jsx
src/components/AlertComponent.jsx</code></pre>

<p>Basta envolver sua aplicação com o AlertProvider e incluir o AlertComponent.</p>

<h3>Uso</h3>

<h4>Envolvendo a aplicação:</h4>
<pre><code>import { AlertProvider } from "./context/AlertContext";
import AlertComponent from "./components/AlertComponent";

function App() {
  return (
    <"AlertProvider">
      <"AlertComponent" />
      {/** restante da aplicação */}
    </"AlertProvider">
  );
}</code></pre>

<h4>API do contexto</h4>
<p>Você pode usar:</p>

<pre><code>const {
  addAlert,
  removeAlert,
  clearAlerts,
  clearFieldAlert,
  alerts,
  fieldAlerts
} = useAlert();</code></pre>

<h4>Criando alertas globais (toasts)</h4>

<pre><code>addAlert("Salvo com sucesso!", "success");
addAlert("Algo deu errado.", "error");
addAlert("Aviso importante!", "warning");
addAlert("Informação útil.", "info");</code></pre>

<p><strong>Tipos suportados:</strong></p>

<ul>
    <li><strong>success:</strong> Limpa todos os alertas anteriores antes de exibir</li>
    <li><strong>error:</strong> Não limpa outros</li>
    <li><strong>warning:</strong> Aviso genérico</li>
    <li><strong>info:</strong> Informação</li>
    <li><strong>confirm: </strong>Abre modal com botões “Sim” e “Não”</li>
</ul>

<h4>Alertas Inline (para formulários)</h4>
<p>Perfeito para exibir erros de validação associados a campos específicos.</p>

<h4>Criar alerta inline:</h4>
<pre><code>addAlert("Campo obrigatório", "error", { fieldName: "email" });</code></pre>

<h4>Exibir no componente:</h4>
<pre><code><FieldAlert fieldName="email" /></code></pre>

<h4>Remover alerta inline:</h4>
<pre><code>clearFieldAlert("email");</code></pre>

<h3>Integração com validaCampos</h3>
<p>O sistema de alertas também possui uma função utilitária para validação de formulários:</p>

<pre><code>import { validaCampos } from "../../utils/validaCampos";

const erros = validaCampos(form, metadata, backendErrors, prefix, addAlert);
</code></pre>

<h4>Como funciona:</h4>
<ul>
    <li>Valida campos obrigatórios (required)</li>
    <li>Valida regras customizadas (ex.: campo objetivos)</li>
    <li>Transforma erros de backend em alertas inline</li>
    <li>Suporta envio de alertas inline usando addAlertFn</li>
</ul>

<h4>Exemplo de uso com inline no form de criação/edição:</h4>
<pre><code>import { useAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";

const { addAlert } = useAlert();

// Ao enviar formulário
const erros = validaCampos(form, metadata, backendErrors, "", addAlert);

if (erros.length > 0) {
  // os erros já são exibidos inline
  return;
}</code></pre>

<p>Cada erro retornado pela função contém { fieldName, message }, e os alertas inline aparecem automaticamente nos componentes <"FieldAlert fieldName="..."" />.</p>



<h3>Alertas de Confirmação (com modal)</h3>
<pre><code>addAlert("Deseja realmente excluir?", "confirm", {
  onConfirm: () => console.log("Confirmado!"),
  onCancel: () => console.log("Cancelado!")
});</code></pre>

<p>Abre uma modal centralizada com Sim / Não.</p>

<h3>Limpeza de alertas ao mudar de rota</h3>
<pre><code>useEffect(() => {
  setAlerts([]);
}, [location]);</code></pre>

<p>Ou seja:</p>
<ul>
    <li>✔ Ao trocar de página → toasts desaparecem automaticamente</li>
    <li>✔ Alertas inline permanecem até serem limpos manualmente</li>
</ul>

<h3>Funções disponíveis:</h3>
<ul>
    <li>addAlert(message, type, options) - Cria qualquer tipo de alerta.</li>
    <li>removeAlert(id) - Remove um alerta global usando seu ID.</li>
    <li>clearAlerts() - Remove todos os alertas globais e inline.</li>
    <li>clearFieldAlert(fieldName) - Remove apenas o alerta inline do campo informado.</li>
</ul>

<h3>Estilização:</h3>
<p>O sistema utiliza classes:</p>
<ul>
    <li>alert</li>
    <li>alert success</li>
    <li>alert error</li>
    <li>alert warning</li>
    <li>alert info</li>
    <li>alert inline</li>
    <li>alert-confirm-overlay</li>
    <li>alert-confirm-box</li>
    <li>alert-close</li>
</ul>
<p>Você pode personalizar livremente no cssGlobal.css.</p>

<h3>Resumo do Fluxo</h3>
<ul>
    <li>AlertProvider gerencia o estado</li>
    <li>AlertComponent renderiza toast/modals</li>
    <li>addAlert decide automaticamente:</li>
        <ul>
            <li>toast comum</li>
            <li>toast de erro</li>
            <li>inline</li>
            <li>modal de confirmação</li>
        </ul>
    <li>Limpeza automática ao mudar de rota</li>
</ul>
