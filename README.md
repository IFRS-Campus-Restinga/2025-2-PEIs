<h1>Sistema PEI - Documentação</h1>

<h2>Como iniciar</h2>

<p>Os seguintes passos devem ser executados para realização do download do sistema e colocá-lo no ar, seja para fins de teste ou avaliação (como para os professores)
ou mesmo para continuar o desenvolvimento a partir da branch main.</p>

<p><b><u>1. Download das plataformas:</u></b> É necessário estar usando Windows, faça o download do arquivo ZIP abaixo. <i>"Mas eu tenho um MacBook/Linux, não uso Windows."</i>
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

<p><b><u>2. Download do projeto atual:</u></b> Abra a sua pasta "dev2" no vscode e abra um terminal de powershell. Considerando que o terminal sempre abre na pasta do projeto, use o seguinte
comando para fazer o download da branch main:</p>
<pre></pre>
<p></p>
