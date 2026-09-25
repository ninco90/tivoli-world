# Tívoli · Atlas del cambio

Visor local en Three.js para comparar el recinto histórico y la propuesta del avance urbanístico.

## Abrir

Con Node.js instalado, haz doble clic en INICIAR.cmd y abre http://127.0.0.1:5173.
No requiere instalar dependencias para abrir la versión ya compilada de dist/.
Si hay otro servidor en ese puerto, ciérralo o abre PowerShell aquí y ejecuta `$env:PORT=5174; node server.mjs`.
El servidor solo escucha en 127.0.0.1. No se publica nada en Internet.

## Usar

- Existente / Propuesta / Comparar: ambas vistas comparten cámara.
- Arrastrar: girar. Rueda: zoom. Botón derecho + arrastrar: desplazar.
- Flechas cuando el lienzo tiene foco: desplazar. + y -: zoom.
- Pulsa zonas o etiquetas para leer explicaciones.
- Vista aérea: reconocer calles y límites; flecha N: norte real del sistema de coordenadas.
- Ocre discontinuo: recinto histórico aproximado. Verde petróleo: ámbito de la actuación, que NO es el perímetro exclusivo del parque futuro.
- Recorrido guiado: siete paradas.
- Aparcamientos: despiece ilustrativo de una planta; se eleva para verla, aunque el uso previsto es bajo rasante.
- Documentación: planos PDF, ortofoto, criterios y enlaces oficiales.
- Guardar imagen: exporta la escena con aviso de interpretación.

## Qué se ha verificado y qué es ilustrativo

El plano 11 del avance (PDF página 26) define 35.860 m² de parcela de parque y 58.000 m² de parcela comercial, de los cuales se vinculan 34.000 m² de cubierta al parque. Los 85.000 m²t comerciales son superficie edificable, no suelo. La cubierta y sus tres patios se interpretan a partir de la infografía aérea publicada el 19 de junio de 2025; no constituyen una huella aprobada.

El hotel exclusivo tiene 4.500 m² de parcela. El segundo hotel anunciado no tiene huella independiente definida, por lo que no se inventa su emplazamiento.

Las parcelas se digitalizaron manualmente del plano municipal y se ajustaron mediante tres puntos de control a OSM. No constituyen un levantamiento topográfico ni catastral. El recinto histórico se trazó de la ortofoto del avance: el perímetro OSM resultaba incompleto en el extremo norte.

Calles, edificios de contexto, tren y teleférico provienen de OpenStreetMap. Alturas sin información se estiman. La topografía utiliza el modelo del terreno IGN MDT05, a 5 m, con escala vertical 1:1. Atracciones, fachadas, vegetación, mobiliario, coches y aparcamiento son ilustrativos; no representan un inventario actualizado ni decisiones constructivas aprobadas. Tampoco representan el estado de conservación del parque cerrado.

Consulta de fuentes: 22/09/2026. Último hito municipal encontrado: 14/07/2026, tramitación ambiental. No se fija fecha de apertura.

## Fuentes

- https://www.benalmadena.es/docs/documento_de_avance_-_normas_urbanisticas_y_planos.pdf
- https://www.benalmadena.es/docs/documento_ambiental_estrategico_del_avance_del_peri.pdf
- https://www.benalmadena.es/noticias/N13518/La-tramitacin-de-Tivoli-da-un-nuevo-paso-y-avanza-conforme-a-lo-previsto.html
- Cartografía © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright

Copias de los documentos oficiales en public/docs y dist/docs. Los planos conservan su autoría original.

## Desarrollo

`npm ci` instala dependencias del lockfile. `npm run dev` inicia Vite. `npm run build` regenera dist. Three.js se empaqueta localmente; la visualización no requiere CDN ni claves API.

Código principal: src/scene.js (maqueta), src/main.js (contenido y controles), src/style.css (interfaz).
Datos: public/context.json (OSM), public/plan.json (trazado del avance y metadatos de transformación).

## Comprobaciones

Compilación de producción y pruebas de navegador Edge/Chromium: carga WebGL, dos escenarios, comparación, vista aérea, etiquetas, iluminación, siete pasos del recorrido, selección de zonas, PDF local y adaptación móvil. Se verifican consola sin errores y ausencia de desbordamiento horizontal en móvil.


## Actualización: distribución del parque existente

El escenario existente se reconstruye sobre una ortofoto PNOA/IGN de JULIO DE 2022, resolución 25 cm. La fecha se verificó con GetFeatureInfo de la capa OI.MosaicElement. No es una imagen en tiempo real ni documenta el estado de conservación de 2026.

Se han trazado 39 cubiertas interiores y la red principal de caminos y plazas. Se identifican la plaza/fuente central, teatro, Tívoli Agua, noria gigante, montaña rusa norte, Caída Libre y entrada histórica. La guía histórica de 2020 permite identificar los elementos; Google Maps se consultó visualmente como contraste. No se han incorporado texturas de Google.

La vegetación se distribuye mediante muestreo determinista de las manchas verdes de la ortofoto, excluyendo huellas edificadas. Las copas representan agrupaciones aproximadas, no un inventario árbol por árbol.

El botón Ortofoto alterna el fondo fotográfico del recinto actual. Los siete puntos de interés del parque actual se pueden seleccionar desde sus etiquetas y desde la lista «Reconocer el parque existente».

Alturas (excepto el nombre histórico Caída Libre 60 m), maquinaria, fachadas, mobiliario, pendientes de atracciones y detalle del graderío son aproximados. El terreno se apoya en elevaciones del IGN; las plataformas y movimientos de tierra futuros no están definidos en la infografía.

Fuentes adicionales:
- Ortofoto © IGN / Sistema Cartográfico Nacional, CC BY 4.0. Servicio: https://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&REQUEST=GetCapabilities
- BBOX CRS:84 de la imagen local: -4.5432,36.5983,-4.5378,36.6033; 1600x1840 píxeles.
- Guía histórica 2020: https://www.parqueplaza.net/2020/06/tivoli-world-abrira-el-3-de-julio-con.html
- Referencia visual: https://www.google.com/maps/@36.6008,-4.541,18z/data=!3m1!1e3

Archivos nuevos: src/existing.js, public/current-buildings.json, public/current-trees.json y public/reference/pnoa.jpg.


## Relieve, boceto y catálogo histórico

- Relieve real: malla IGN/CNIG MDT05. Entre el acceso sur (82,0 m) y el extremo noroeste (127,9 m), el desnivel de referencia es 45,9 m. El botón Perfil del terreno explica la sección. Relieve real permite comparar con la base plana.
- Boceto aéreo: abre la imagen utilizada para las terrazas comerciales, tres patios acristalados y cuatro cubiertas verdes. Infografía publicada el 19/06/2025, anterior al avance de octubre; alturas de edificios y futuras rasantes interpretadas.
- Inventario: 40 entradas de la guía histórica de 2020, con buscador y etiquetas numeradas. Las posiciones pequeñas tienen incertidumbre explícita. El sistema evita superponer los nombres: acercar la cámara o elegir del listado centra la atracción. El catálogo no certifica qué queda conservado actualmente.
- Auditorio: escenario al sureste, graderíos en bloques, pasillos y asientos. Entrada: marquesina curva con módulos y taquillas. Plantas trazadas sobre PNOA; alzados y detalle interpretados.

Fuentes y archivos de esta revisión:
- https://olebenalmadena.com/aprobado-el-convenio-urbanistico-de-tivoli-resurreccion-o-muerte-del-parque-de-ocio-de-benalmadena/
- https://servicios.idee.es/wcs-inspire/mdt?service=WCS&request=GetCapabilities
- public/terrain.json y public/reference/mdt05-tivoli.asc: datos del relieve.
- public/reference/new-project-geometry.json: trazado interpretativo de la infografía.
- public/attractions.json: catálogo y confianza de ubicaciones.
- public/current-specials.json: geometrías y referencias de entrada y auditorio.


## Teleférico

La estación inferior se sitúa sobre la huella OSM 759608839 y la línea sigue el trazado 19745391. Se sustituyeron los postes genéricos por ocho apoyos cartográficos en el ámbito mostrado. La geometría distingue embarque, salida y cables de ida/vuelta; 14 cabinas animadas recorren ambos sentidos. La animación es explicativa, no un seguimiento en tiempo real. Las alturas de apoyos y flecha de cables son interpretativas sobre el terreno IGN: no se presentan como mediciones técnicas. Elegir «Teleférico · estación de salida» centra la vista.

- https://www.openstreetmap.org/way/19745391
- https://www.telefericobenalmadena.com/prepara-tu-visita/informacion-relevante/como-llegar
- public/cablecar.json contiene fuentes, trazado y apoyos. src/cablecar.js contiene la animación.

## Ampliar imágenes
Pulsa cualquier imagen aérea o plano en Documentación para abrir el visor. Usa + y − o la rueda para ampliar, arrastra para recorrerla y Ajustar para ver la imagen completa. En pantalla táctil admite dos dedos. Esc o × cierra el visor y vuelve a la documentación.


## Revisión de fidelidad geométrica
Edificios históricos agrupados como unidades rígidas con zócalos hasta el terreno; noria con cuatro apoyos, montaña rusa con doble vía y traviesas, canal de Tívoli Agua abierto con barcas. Atracciones menores con plataformas niveladas, trenes, carrusel de dos niveles y detalles diferenciados. Los puntos aproximados de la guía no se convierten en coordenadas verificadas por añadir detalle.
La propuesta sustituye las copias automáticas del parque antiguo por trazados propios de la infografía: dos montañas rusas, karting, toboganes, plazas y vegetación. Patios, terrazas, bandas de fachada y pérgolas siguen la composición de referencia. Alturas y rasantes futuras siguen siendo interpretativas; la imagen no las acota.


### Revisión de la propuesta
Se ha separado la noria del trazado de la montaña rusa y recortado el borde norte de las cubiertas. Los patios se representan abiertos, con galerías. El botón Fachada y acceso encuadra la plaza cubierta interpretada de las perspectivas A y D. La posición de la noria y las cotas arquitectónicas son aproximadas; el acceso al conjunto no confirma la ubicación de los tornos del parque.


Dragón reconstruido con doble giro y dos filas de asientos a partir de las fotografías facilitadas. Caída Libre incorpora góndola animada, guías y celosía. Botón Animar atracciones para pausar/reanudar; respeta la preferencia de movimiento reducido. Escalinata contigua y ciclos mecánicos interpretativos, no levantamiento ni simulación física del fabricante.


Revisión fotográfica: Dinolandia recolocada en el edificio almenado detrás de Dragón; norias con cabinas niveladas; Twister y Ford; montaña rusa con curvas a varias alturas; canal Tívoli Agua con decorados y barcos; fuente con surtidores; Show Boat y estanque. Fotografías ampliables y vídeos recopilados en Documentación. Consultados fragmentos de Tívoli Agua (Paco Alcántara) y Twister (R&M Ferias); los demás vídeos se incluyen como referencias adicionales. Dimensiones, velocidades, interiores y posiciones secundarias siguen siendo aproximadas.
