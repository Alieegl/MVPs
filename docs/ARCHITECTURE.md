# Arquitectura del Sistema

## 1. Principios de Diseño
- **Simplicidad (KISS):** Mantener la estructura lo más plana posible para el MVP.
- **Modularidad:** Separación lógica de componentes dentro de archivos grandes para facilitar la futura extracción.
- **Separación de Responsabilidades:** La lógica de negocio, los datos (mock) y la vista están desacoplados.

## 2. Control de Acceso Basado en Roles (RBAC)
El sistema implementa dos experiencias de usuario distintas basadas en el rol:

### Director / Coordinador
- **Visión:** Jerárquica y Global.
- **Navegación:** Proyectos -> Carpetas (Planeación, Ejecución...) -> Archivos.
- **Dashboard:** KPIs globales, Carga de trabajo por áreas, Monitor de cuellos de botella.

### Revisor (Jurídica, Compras, GH)
- **Visión:** Plana y Focalizada.
- **Navegación:** Proyectos -> Lista de Documentos Asignados (Sin carpetas).
- **Dashboard:** KPI personal (Mis pendientes, Mi efectividad).

## 3. Máquina de Estados Documental
Los documentos transitan por los siguientes estados:
- `Borrador` -> `En Revisión (Area)` -> `Pendiente Firma` -> `Firmado`
- En cualquier punto de revisión: `Rechazado` (Incrementa versión y requiere comentario).

## 4. Estrategia de UI/UX (Responsive)
El sistema utiliza una estrategia "Adaptativa" más que puramente fluida:

### Navegación
- **Desktop:** Sidebar lateral siempre visible (`fixed left-0`).
- **Mobile:** Menú "Off-canvas" (Drawer) que se desliza con un botón hamburguesa, con overlay oscuro para enfocar la atención.

### Visualización de Datos
- **Patrón Tabla-Tarjeta:** 
  - En pantallas grandes (`md:` en adelante), usamos tablas densas para comparar datos.
  - En móviles, ocultamos la tabla y renderizamos componentes tipo "Tarjeta" (Cards) que apilan la información verticalmente para mejor legibilidad táctil.

## 5. Gestión de Estado
Para el MVP, utilizamos **React Local State** (`useState`).
- Los datos persisten solo en memoria durante la sesión.
- Las acciones (firmar, rechazar) actualizan el estado local simulando transacciones inmutables.