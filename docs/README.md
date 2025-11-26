# UCO Gestión Proyectos - MVP

Sistema de gestión documental y flujos de firma digital para la Dirección de Proyectos de la Universidad Católica de Oriente (UCO).

## 🎯 Objetivo
Digitalizar y organizar la gestión documental para resolver problemas de trazabilidad, retrasos en firmas y pérdida de documentos físicos, proporcionando una interfaz moderna y accesible para Directores, Coordinadores y Áreas Transversales.

## 🚀 Funcionalidades Principales
- **Gestión por Carpetas:** Estructura UCO (Planeación, Contractual, Ejecución, Cierre).
- **Flujos de Aprobación:** Estados para Jurídica, Compras, GH y Dirección.
- **Roles y Permisos:** Vistas personalizadas para Director (Torre de Control) y Áreas (Listas Planas).
- **Indicadores de Retraso:** Alertas visuales de días de vencimiento.
- **Power BI Embed:** Integración simulada de tableros de control por proyecto.
- **Trazabilidad:** Historial de versiones y notas de rechazo obligatorias.

## 🚀 Cómo Iniciar
Este proyecto es una aplicación React de una sola página (SPA).

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno (ver abajo).
4. Ejecutar: `npm start`

### Variables de Entorno
- `API_KEY`: Key de Google Gemini API para el asistente inteligente.

## 🛠 Tecnologías Principales
- **Frontend:** React 19, TypeScript.
- **Estilos:** Tailwind CSS.
- **Iconos:** Lucide React.
- **Gráficos:** Recharts.
- **IA:** Google GenAI SDK (Gemini 2.5 Flash).

## 📱 Soporte
El sistema está diseñado con una estrategia "Mobile-First" adaptada, priorizando la visualización de escritorio para la gestión compleja, pero permitiendo consultas y aprobaciones rápidas desde dispositivos móviles.