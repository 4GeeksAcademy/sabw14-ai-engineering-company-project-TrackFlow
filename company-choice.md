# Elección de Empresa: TrackFlow

## ¿Por qué elijo TrackFlow?
He seleccionado **TrackFlow** porque representa un reto técnico completo que conecta la IA directamente con operaciones del mundo físico e infraestructura internacional. Me resulta sumamente interesante el desafío de unificar la visibilidad de inventario y datos en tiempo real entre sus dos almacenes principales en Los Ángeles y Zaragoza, integrando a su vez 8 empresas de transporte distintas como UPS, FedEx, MRW y SEUR. Además, operar con un volumen de devoluciones de entre el 18% y el 25% ofrece un escenario ideal para aplicar soluciones inteligentes que optimicen costes operativos de forma inmediata.

## Departamentos de Interés

### 1. Logística Inversa
Este departamento me llama la atención por el alto impacto que tiene en los márgenes del negocio. Actualmente, el equipo de Sofía Ramos procesa cada devolución mediante revisiones humanas manuales e inspecciones subjetivas. Automatizar la evaluación del estado de los productos mediante inspección visual asistida por IA y establecer reglas de aprobación automática por cliente transformará una fuga de dinero en un proceso eficiente.

### 2. Última Milla y Gestión de Transportistas
Coordinar 8 transportistas en dos países de forma manual representa un cuello de botella operacional enorme para el equipo de Carlos Vega. Me parece un reto de ingeniería muy atractivo crear un motor de selección inteligente que recomiende el transportista óptimo según destino, peso y urgencia, unificando además las múltiples APIs de seguimiento en una sola interfaz.

## Reto de Automatización e IA
**Inspección y clasificación automática de devoluciones mediante visión por computador y reglas de negocio.**
El reto consiste en eliminar la subjetividad y la lentitud en la inspección de productos devueltos, automatizando la decisión de aceptar la devolución y clasificar si el producto debe reacondicionarse, desecharse o devolverse al inventario.

---

## Mi idea de Agente de IA

### Descripción del Agente
El agente actuará como un **Asistente Inteligente para la Gestión e Inspección de Devoluciones**. Su función será procesar las solicitudes de devolución de los clientes, evaluar las fotografías del estado del producto que sube el operario en el almacén y determinar automáticamente el destino del artículo junto con la aprobación de la devolución.

* **Información que necesitaría (Inputs):**
  * Fotografía del producto devuelto tomada por el operario en el almacén.
  * ID del pedido y política de devolución específica del cliente B2B contratante.
  * Historial del estado original del SKU.

* **Qué produciría o desencadenaría (Outputs):**
  * **Clasificación del estado:** Categorización automática (Ej: *Nuevo/Re-empaquetar*, *Reacondicionar*, *Desechar*).
  * **Acción en el sistema:** Emisión o rechazo de la etiqueta/reembolso y actualización automática del inventario en el SGA del almacén correspondiente (Los Ángeles o Zaragoza).
  * **Notificación y Telemetría:** Envío de una actualización al portal del cliente y registro de métricas sobre motivos recurrentes de devolución.