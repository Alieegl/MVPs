# Arquitectura del Sistema

## 1. Principios de Diseño
- **Simplicidad (KISS):** Mantener la estructura lo más plana posible para el MVP.
- **Modularidad:** Separación lógica de componentes dentro de archivos grandes para facilitar la futura extracción.
- **Separación de Responsabilidades:** La lógica de negocio, los datos (mock) y la vista están desacoplados.

## 2. Estructura de Carpetas
El proyecto sigue una estructura conceptual que se expandirá en fases futuras:

```
/
├── components/      # (Virtual) Bloques de UI reutilizables (Sidebar, Cards, Tablas)
├── services/        # Lógica de conexión externa (GeminiService)
├── types/           # Definiciones de TypeScript (Interfaces de dominio)
├── docs/            # Documentación viva del proyecto
└── constants.ts     # Datos Mock (Simulación de Base de Datos)
```

## 3. Estrategia de UI/UX (Responsive)
El sistema utiliza una estrategia "Adaptativa" más que puramente fluida:

### Navegación
- **Desktop:** Sidebar lateral siempre visible (`fixed left-0`).
- **Mobile:** Menú "Off-canvas" (Drawer) que se desliza con un botón hamburguesa, con overlay oscuro para enfocar la atención.

### Visualización de Datos
- **Patrón Tabla-Tarjeta:** 
  - En pantallas grandes (`md:` en adelante), usamos tablas densas para comparar datos.
  - En móviles, ocultamos la tabla y renderizamos componentes tipo "Tarjeta" (Cards) que apilan la información verticalmente para mejor legibilidad táctil.

## 4. Gestión de Estado
Para el MVP, utilizamos **React Local State** (`useState`).
- Los datos persisten solo en memoria durante la sesión.
- Las acciones (firmar, rechazar) actualizan el estado local simulando transacciones inmutables.

## 5. Integración con IA (Gemini)
El servicio `geminiService.ts` actúa como una capa de abstracción.
- **Modelo:** Gemini 2.5 Flash.
- **Contexto:** Se inyectan los metadatos (JSON) en el prompt del sistema para permitir RAG (Retrieval-Augmented Generation) ligero en el cliente.