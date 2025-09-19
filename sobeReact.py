import os
import shutil
import subprocess
import sys

# ------------------------------------------
# pegando nosso diretorio atual, vai valer onde está o script
# portanto deixe ele na pasta raiz de tudo, onde está python, node e os projetos
baseDir = os.path.abspath(os.getcwd())
rodanpm = os.path.join(baseDir, "node", "npm.cmd")

# ------------------------------------------
# funcao pra rodar comandos nativos através do python
def roda(cmd, cwd=None, show=True, ambiente=None):
    if show:
        print(f"> {' '.join(cmd)}")
    env = os.environ.copy()
    if ambiente:
        env.update(ambiente)
    subprocess.run(cmd, cwd=cwd, check=False, env=env, stdout=sys.stdout, stderr=sys.stderr)

# ------------------------------------------
# apagando pasta node_modules se existir
def apagar(caminho):
    if os.path.isdir(caminho):
        shutil.rmtree(caminho, ignore_errors=True)
        print(f"Apagado: {caminho}")
    elif os.path.isfile(caminho):
        try:
            os.remove(caminho)
            print(f"Apagado: {caminho}")
        except FileNotFoundError:
            pass
vaiApagar = [
    os.path.join(baseDir, "frontpei", "node_modules"),
]
for item in vaiApagar:
    apagar(item)

# ------------------------------------------
# recriando e printando versoes de tudo
print(f"\n***********************************************\n")
print(f"Diretorio de trabalho: {baseDir}")
roda([os.path.join(baseDir, "node", "node.exe"), "--version"])
roda([rodanpm, "--version"])
roda([rodanpm, "install"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})
roda([rodanpm, "list", "vite"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})
roda([rodanpm, "list", "react"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})
roda([rodanpm, "list", "axios"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})
roda([rodanpm, "list", "@react-oauth/google"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})
roda([rodanpm, "list", "jwt-decode"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})

# ------------------------------------------
# subindo o webserver do react
roda([rodanpm, "run", "dev", "--debug"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})