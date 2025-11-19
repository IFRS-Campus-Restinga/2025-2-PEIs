from django.urls import path
from .views import GoogleLoginView, PreCadastroView
from auth_app.views_admin import (
    SolicitacoesPendentesView,
    AprovarSolicitacaoView,
    RejeitarSolicitacaoView
)
from auth_app.views_me import MeView

urlpatterns = [
    path("login/google/", GoogleLoginView.as_view(), name="google-login"),
    path("pre-cadastro/", PreCadastroView.as_view(), name="pre-cadastro"),

    # admin
    path("solicitacoes/pendentes/", SolicitacoesPendentesView.as_view()),
    path("solicitacoes/aprovar/", AprovarSolicitacaoView.as_view()),
    path("solicitacoes/rejeitar/", RejeitarSolicitacaoView.as_view()),
     
    # informações do usuário logado
    path("me/", MeView.as_view()),

]
