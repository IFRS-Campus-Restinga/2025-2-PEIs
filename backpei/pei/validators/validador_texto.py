from django.core.validators import RegexValidator

# Validador: proíbe caracteres especiais
no_special_characters = RegexValidator(
    regex=r'^[\w\sÀ-ÿ]+$',
    message='Não use caracteres especiais. Use apenas letras, números e espaços.',
)

# Validador: exige pelo menos um caractere especial
must_have_special_char = RegexValidator(
    regex=r'^(?=.*[!@#$%^&*(),.?":{}|<>]).+$',
    message='O campo deve conter pelo menos um caractere especial.',
)