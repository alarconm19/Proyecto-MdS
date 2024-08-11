@echo off

:: Recorre todos los archivos .html en el directorio actual
for %%f in (*.html) do (
    :: Copia el archivo con la nueva extensión .hbs
    copy "%%f" "%%~nf.hbs"
)
