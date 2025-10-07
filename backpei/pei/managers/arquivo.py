from django.core.exceptions import ValidationError

def validate_file_size(value):
    filesize = value.size
    limit_mb = 10
    if filesize > limit_mb * 1024 * 1024:
        raise ValidationError(f"O tamanho máximo permitido é {limit_mb} MB.")
