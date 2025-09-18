<h1>Sistema PEI - Documentação</h1>

<h2>Como iniciar</h2>

<p>Os seguintes passos devem ser executados para realização do download do sistema e colocá-lo no ar, seja para fins de teste ou avaliação (como para os professores)
ou mesmo para continuar o desenvolvimento a partir da branch main.</p>

<p><b>1. Download das plataformas:></b></p>
<p>É necessário estar usando Windows, faça o download do arquivo ZIP abaixo. <i>"Mas eu tenho um MacBook/Linux, não uso Windows."</i>
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

<p><b>2. Download do projeto atual:</b></p>
<p>Abra a sua pasta "dev2" no vscode e abra um terminal de powershell. Considerando que o terminal sempre abre na pasta do projeto, use o seguinte comando para fazer o download:</p>
<pre>.\git\bin\git.exe clone https://github.com/IFRS-Campus-Restinga/2025-2-PEIs.git</pre>
<p>Isso usa nosso git portátil para baixar o conteúdo da branch main. Perceba que o git tenta evitar sobrescrita de arquivos criando uma nova pasta "2025-2-PEIs" com todo conteúdo
que veio do repositório lá dentro. Você pode entrar na pasta, recortar tudo e colar na mesma pasta "dev2" onde você descompactou as plataformas, depois apague a pasta "2025-2-PEIs"
que estará vazia. O seu diretório "dev2" estará correto se contiver a seguinte lista de arquivos e pastas:</p>
<p>.git - pasta de metadados do github, é oculta, importante ter certeza que veio junto</p>
<p>backpei - pasta do projeto django do backend</p>
<p>frontpei - pasta do projeto reac do frontend</p>
<p>git - pasta de toda a plataforma git</p>
<p>node - pasta da plataforma node onde roda o frontednd</p>
<p>python - pasta do python que contém inclusive nossos middlewares</p>
<p>.gitignore - arquivo com a lista de coisas que não devem ir para o repositório</p>
<p>LICENSE - arquivo genérico dizendo qual o tipo de licença do nosso código</p>
<p>limpeza.sh - script bash opcional que limpa arquivos desnecessários</p>
<p>README.md - documentação do projeto, é isso que você está lendo aqui</p>
<p>sobeDjango.py - script de inicialização do projeto django</p>
<p>sobeReact.py - script de inicialização do projeto react</p>

<p><b>3. Inicializar os webservers:</b></p>
<p></p>
