# Tívoli · Atlas del cambio

Visor interactivo en Three.js para explorar el Tívoli World histórico de Benalmádena y comparar su entorno con una interpretación del avance urbanístico. Incluye relieve, calles, límites aproximados, atracciones animadas y fichas explicativas.

**Es una maqueta interpretativa.** Las atracciones, cotas de instalaciones, edificios futuros y conexiones ocultas de Tívoli Agua no son planos de ejecución ni un levantamiento exacto. El parque permanece cerrado en el escenario «Existente»; la animación no indica que las atracciones funcionen hoy.

## Ejecutarlo

Requiere Node.js. Desde esta carpeta:

```bash
npm ci
npm run dev
```

Abre <http://127.0.0.1:5173/>. Para generar la versión estática: `npm run build`. La aplicación no envía datos a ningún servicio propio.

## Contribuir

Las mejoras de geometría, accesibilidad, rendimiento, documentación y correspondencia con fuentes son bienvenidas. Abre una incidencia con la referencia que sustente el cambio o envía una pull request. Consulta [CONTRIBUTING.md](CONTRIBUTING.md).

Los ficheros de fotografías históricas, las infografías de prensa y las copias locales de los PDF oficiales se han omitido del repositorio porque no se ha acreditado una licencia de redistribución. El visor puede ejecutarse sin ellos, aunque esas referencias ampliables no estarán disponibles en una instalación limpia. Los enlaces originales y el criterio de interpretación están en [LEEME.md](LEEME.md) y en `public/reference/new-project-source.json`. La ortofoto PNOA y el terreno IGN tienen su atribución en el visor y en la documentación.

## Datos y licencias

- Código propio: [MIT](LICENSE).
- Ortofoto y relieve: © IGN / Sistema Cartográfico Nacional, CC BY 4.0; véase [LEEME.md](LEEME.md).
- Datos de calles y edificios del entorno: © OpenStreetMap contributors, ODbL; véase <https://www.openstreetmap.org/copyright>.
- Los nombres «Tívoli World» y de sus atracciones se usan para identificación histórica; este proyecto comunitario no representa al titular de la marca ni al promotor.

La documentación técnica y el inventario de fuentes, hipótesis y límites de precisión están en [LEEME.md](LEEME.md).
