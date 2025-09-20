<h1>Sistema PEI - Documentação</h1>

<h2>Como iniciar</h2>

<p>Os seguintes passos devem ser executados para realização do download do sistema e colocá-lo no ar, seja para fins de teste ou avaliação (como para os professores)
ou mesmo para continuar o desenvolvimento a partir da branch main.</p>

<h3>1. Download das plataformas:</h3>
<pÉ necessário estar usando Windows, faça o download do arquivo ZIP abaixo. <i>"Mas eu tenho um MacBook/Linux, não uso Windows."</i>
Para fazer uso completo da automação criada para desenvolvimento, vai ser necessário estar usando Windows. Use uma máquina do campus ou uma VM, a delimitação de sistema operacional
foi criada justamente para a uniformidade do ambiente e baseada no uso pessoal da equipe de desenvolvimento e das máquinas do campus. Segue o link de download:</p>

<a href="https://drive.google.com/file/d/1YuVCgy0Zeid9icHX5Ltqh11OpNqjQxHr">https://drive.google.com/file/d/1YuVCgy0Zeid9icHX5Ltqh11OpNqjQxHr</a>

<p>Basta criar uma pasta qualquer e descompactar o conteúdo do ZIP, logo após ele é dispensável. Usaremos como exemplo uma pasta chamada "dev2" criada na área de trabalho. O ZIP vai
lhe fornecer todo o ambiente Python, Node e Git que é dependência para nosso projeto. Não é necessária nenhuma instalação e nenhuma alteração será feita na sua instalação de Windows,
realmente é só deixar as pastas dentro da sua pasta geral "dev2".</p> <i>"Eu já tenho essas três plataformas instaladas, posso usar as que já possuo?"</i> Até pode, mas isso vai te obrigar
a realizar alguns comandos manualmente. Por exemplo, toda vez que você baixar o conteúdo do repositório do github, você precisaria gerar manualmente o token do superuser do Django
(mais sobre isso depois). Também precisa ter certeza que seu python possui todas as bibliotecas que estamos usando, pois diferente do node, o python salva elas dentro da plataforma e
não na pasta do projeto. Enfim, só há vantagens em usar essas plataformas comuns e apenas mais transtorno em tentar seguir isolado delas. Basta criar o seu diretório (como "dev2")
e descompactar lá dentro. Simples assim.</p>

<h3>2. Download do projeto atual:</h3>
<p>Abra a sua pasta "dev2" no vscode e abra um terminal de powershell. Considerando que o terminal sempre abre na pasta do projeto, use o seguinte comando para fazer o download:</p>

<pre>.\git\bin\git.exe clone https://github.com/IFRS-Campus-Restinga/2025-2-PEIs.git</pre>

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

<pre>.\python\python.exe .\sobeDjango.py</pre>

<p>Pode responder que sim para as perguntas de refazer o migrate e apagar o banco. Toda vez que você modificar models significativamente, é bom rodar esse script de novo zerando as migrações
e apagando o banco. Já no seu segundo terminal nós iremos levantar o react. Considerando que ele estará na pasta "dev2", rode esse comando:</p>

<pre>.\python\python.exe .\sobeReact.py</pre>

<p>Caso você já tenha a pasta node_modules no projeto (não vai ter quando vier do github), o script vai perguntar se quer apagar ela e baixar os pacotes de novo. Então pronto, você pode
acessar <b>http://localhost:5173</b> no seu navegador para usar o sistema.</p>
<p><b>ATENÇÃO:</b> Sempre que você quiser apagar tudo que fez e começar limpo de novo a partir do repositório, você pode apagar tudo da pasta "dev2" e manter apenas as pastas "git", "node" e
"python" que haviam vindo do ZIP "plataformas.zip". Então faça o git clone novamente a partir do ponto 2 desse tutorial.</p>

<h2>Usando o Github:</h2>
<p>Se você não criou sua branch, <a href="https://github.com/IFRS-Campus-Restinga/2025-2-PEIs/branches">clique nesse link</a> e vá em "New branch" no canto superior direito, criando uma branch
com seu nome a partir da main.</p> Sempre que você faz o git clone, ele faz o download de todas as branchs mas você trabalha na default, que é a main. Você pode sair usando sua própria branch
com o seguinte comando:</p>

<pre>.\git\bin\git.exe clone -b MinhaBranch https://github.com/IFRS-Campus-Restinga/2025-2-PEIs.git</pre>

<p>Você pode ver a branch que está usando com o comando abaixo. Apenas lembre que o comando deve ser dado onde está a pasta oculta .git, então a cada clone a prática recomendada para nosso projeto
é mover todo o conteúdo da pasta "2025-2-PEIs" que é criada pelo clone para o mesmo local onde estão suas pastas das plataformas "git", "node", e "python". Depois apague a pasta vazia. Segue
o comando que vê sua branch atual:</p>

<pre>.\git\bin\git.exe branch -a</pre>

<p>Você pode trocar muito facilmente de branch com o seguinte comando:</p>

<pre>.\git\bin\git.exe checkout main</pre>

<p>No exemplo acima, supondo que você estava na sua branch, você volta para a main. Os próprios arquivos exibidos pelo vscode vão mudar e você sempre pode confirmar onde está com o "branch -a".</p>
<p><b>Agora importante:</b> Você sempre vai commitar <b>!!! NA SUA PRÓPRIA BRANCH !!!</b> sempre, pra isso SEMPRE garanta que você está nela com o branch -a e você pode salvar seu progresso
com os seguintes comandos:</p>

<pre>.\git\bin\git.exe checkout MinhaBranch <== te liga
.\git\bin\git.exe branch -a <== confirme que está na sua
.\git\bin\git.exe add .
.\git\bin\git.exe commit -m "escreva brevemente o que fez"
.\git\bin\git.exe push origin MinhaBranch
</pre>

<p>Pode conferir pelo site do github que tudo deu certo. Para atualizar a main, ou nós usaremos pull requests que precisam de aprovação de todo o time, ou vamos fazer inserções pontuais. Em qualquer
dos casos nós sempre faremos todos juntos em aula.</p>
<p>É bem provável que ao final de cada sprint, com o progresso de todos salvo na main, além de apagar os arquivos do seu computador você também queira resetar sua branch para ficar igual ao main.
É possível simplesmente apagar ela na interface web e criar de novo. Ou então pode ser dado os seguintes comandos, desde que com muita cautela. Comece apagando seu conteúdo local, então execute:</p>

<pre>.\git\bin\git.exe clone https://github.com/IFRS-Campus-Restinga/2025-2-PEIs.git
.\git\bin\git.exe checkout MinhaBranch <== pelo amor de deus
.\git\bin\git.exe branch -a <== confirme mil vezes que é a sua
.\git\bin\git.exe reset --hard main
.\git\bin\git.exe push --force origin MinhaBranch
</pre>

<p>Confira que ficou certinho no site e pode apagar todo seu conteúdo local (procure preservar as plataformas, para não precisar fazer o download de novo).</p>

<h2>Segurança na comunicação</h2>

<p>...</p>
