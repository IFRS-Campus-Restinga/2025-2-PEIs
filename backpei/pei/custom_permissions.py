from __future__ import annotations

import os
import sys
from typing import Iterable, List, Set

baseDir = os.path.abspath(os.getcwd())
sys.path.append(os.path.join(baseDir, "backpei"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backpei.settings")

import django
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from guardian.shortcuts import assign_perm
from django.contrib.contenttypes.models import ContentType

from pei.models.pei_central import PeiCentral
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from pei.models.componenteCurricular import ComponenteCurricular
from pei.models.disciplina import Disciplina
from pei.models.curso import Curso
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
from pei.models.documentacaoComplementar import DocumentacaoComplementar
from pei.models.parecer import Parecer
from pei.models.aluno import Aluno

User = get_user_model()

def perm_fullname(perm: Permission) -> str:
    return f"{perm.content_type.app_label}.{perm.codename}"

def safe_iter(qs) -> Iterable:
    if qs is None:
        return ()
    return qs

def get_pei_centrals_for_course(course: Curso) -> List[PeiCentral]:
    alunos = Aluno.objects.filter(curso=course)
    return list(PeiCentral.objects.filter(aluno__in=alunos))

def get_pei_centrals_for_discipline(disc: Disciplina) -> Set[PeiCentral]:
    peis = set()
    componentes = ComponenteCurricular.objects.filter(disciplinas=disc)
    for comp in safe_iter(componentes):
        periodos = []
        if hasattr(comp, "periodos_letivos"):
            periodos = list(comp.periodos_letivos.all())
        elif hasattr(comp, "periodos"):
            periodos = list(comp.periodos.all())
        elif hasattr(comp, "pei_periodo_letivo"):
            try:
                periodos = [comp.pei_periodo_letivo]
            except Exception:
                periodos = []

        for periodo in periodos:
            if hasattr(periodo, "pei_central") and periodo.pei_central:
                peis.add(periodo.pei_central)
    return peis

def assign_perm_to_user_on_many(perm_name: str, user, objects: Iterable):
    count = 0
    for obj in safe_iter(objects):
        try:
            assign_perm(perm_name, user, obj)
            print(f"[ASSIGN] {perm_name} -> {user.username} on {obj.__class__.__name__}(id={getattr(obj, 'id', None)})")
            count += 1
        except Exception as e:
            print(f"[ERROR] assign_perm {perm_name} -> {user} on {obj}: {e}")
    return count

def process_group_permissions():
    grupos_of_interest = ["Professor", "Coordenador", "Pedagogo", "NAPNE", "Admin"]
    all_groups = Group.objects.filter(name__in=grupos_of_interest)
    print(f"[INFO] Encontrados grupos: {[g.name for g in all_groups]}")

    for group in all_groups:
        usuarios = list(group.user_set.all())
        perms = list(group.permissions.all())
        print(f"\n[GROUP] {group.name} — users: {len(usuarios)} — perms: {len(perms)}")

        for perm in perms:
            perm_name = perm_fullname(perm)
            model_cls = perm.content_type.model_class()
            model_name = model_cls.__name__ if model_cls else str(perm.content_type)
            print(f"  [PERM] {perm_name} (model: {model_name})")

            if group.name == "Admin":
                all_objs = model_cls.objects.all()
                for user in usuarios:
                    assign_perm_to_user_on_many(perm_name, user, all_objs)
                continue

            if group.name == "Coordenador":
                for user in usuarios:
                    cursos = Curso.objects.filter(coordenador=user)
                    if not cursos.exists():
                        continue
                    curso_peis = []
                    for curso in cursos:
                        curso_peis.extend(get_pei_centrals_for_course(curso))
                    curso_peis = list(set(curso_peis))
                    if model_cls is Curso or model_name == "Curso":
                        cursos = Curso.objects.filter(coordenador=user)
                        assign_perm_to_user_on_many(perm_name, user, cursos)
                        continue
                    if model_cls in [PeiCentral] or model_name == "PeiCentral":
                        assign_perm_to_user_on_many(perm_name, user, curso_peis)
                    elif model_cls is PEIPeriodoLetivo or model_name == "PEIPeriodoLetivo":
                        periodos = []
                        for pei in curso_peis:
                            periodos.extend(list(pei.periodos.all()))
                        assign_perm_to_user_on_many(perm_name, user, periodos)
                    elif model_cls is ComponenteCurricular or model_name == "ComponenteCurricular":
                        comps = []
                        for pei in curso_peis:
                            for periodo in pei.periodos.all():
                                comps.extend(list(periodo.componentes_curriculares.all()))
                        assign_perm_to_user_on_many(perm_name, user, comps)
                    elif model_cls is Disciplina or model_name == "Disciplina":
                        discs = []
                        for pei in curso_peis:
                            for periodo in pei.periodos.all():
                                for comp in periodo.componentes_curriculares.all():
                                    try:
                                        discs.extend(list(comp.disciplinas.all()))
                                    except Exception:
                                        pass
                        assign_perm_to_user_on_many(perm_name, user, discs)
                    else:
                        related_objs = []
                        for pei in curso_peis:
                            if model_name == "AtaDeAcompanhamento":
                                related_objs.extend(list(pei.ata_de_acompanhamentos.all()) if hasattr(pei, "ata_de_acompanhamentos") else [])
                            if model_name == "DocumentacaoComplementar":
                                related_objs.extend(list(pei.documentacao_complementares.all()) if hasattr(pei, "documentacao_complementares") else [])
                        assign_perm_to_user_on_many(perm_name, user, related_objs)
                continue

            if group.name == "Professor":
                for user in usuarios:
                    disciplinas = Disciplina.objects.filter(professores=user)
                    if not disciplinas.exists():
                        continue
                    peis_set = set()
                    for disc in disciplinas:
                        peis_set.update(get_pei_centrals_for_discipline(disc))
                    if model_cls in [PeiCentral] or model_name == "PeiCentral":
                        assign_perm_to_user_on_many(perm_name, user, peis_set)
                    elif model_cls is PEIPeriodoLetivo or model_name == "PEIPeriodoLetivo":
                        periodos = []
                        for pei in peis_set:
                            periodos.extend(list(pei.periodos.all()))
                        assign_perm_to_user_on_many(perm_name, user, periodos)
                    elif model_cls is ComponenteCurricular or model_name == "ComponenteCurricular":
                        comps = []
                        for pei in peis_set:
                            for periodo in pei.periodos.all():
                                comps.extend(list(periodo.componentes_curriculares.all()))
                        assign_perm_to_user_on_many(perm_name, user, comps)
                    elif model_cls is Disciplina or model_name == "Disciplina":
                        assign_perm_to_user_on_many(perm_name, user, disciplinas)
                    elif model_cls is Parecer or model_name == "Parecer":
                        pareceres = Parecer.objects.filter(componente_curricular__disciplinas__professores=user)
                        assign_perm_to_user_on_many(perm_name, user, pareceres)
                    else:
                        related_objs = []
                        for pei in peis_set:
                            if model_name == "AtaDeAcompanhamento":
                                related_objs.extend(list(pei.ata_de_acompanhamentos.all()) if hasattr(pei, "ata_de_acompanhamentos") else [])
                            if model_name == "DocumentacaoComplementar":
                                related_objs.extend(list(pei.documentacao_complementares.all()) if hasattr(pei, "documentacao_complementares") else [])
                        assign_perm_to_user_on_many(perm_name, user, related_objs)
                continue

            if group.name in ("Pedagogo", "NAPNE"):
                for user in usuarios:
                    try:
                        all_objs = model_cls.objects.all()
                        assign_perm_to_user_on_many(perm_name, user, all_objs)
                    except Exception as e:
                        print(f"[ERROR] ao listar instâncias de {model_name}: {e}")
                continue

            print(f"[WARN] Regra não implementada para grupo {group.name} + modelo {model_name}")

    print("[END] Processamento concluído.")

if __name__ == "__main__":
    print("[START] assign_object_perms.py iniciando...")
    process_group_permissions()
    print("[DONE] assign_object_perms.py finalizado.")
