# Habit Tracker - Plataforma de Seguimiento de Hábitos

Una plataforma moderna para crear, seguir y recompensar hábitos diarios con un sistema gamificado de ruleta.

## Características

✨ **Autenticación completa** - Registro e inicio de sesión con validación de datos
📅 **Calendario interactivo** - Marca los días que completaste cada hábito
🎡 **Sistema de ruleta** - Cada 7 días consecutivos, gana una recompensa
🎨 **Recompensas personalizables** - Define tus propias recompensas para cada hábito
🌓 **Tema claro/oscuro** - Cambia de tema y persiste tu preferencia
📊 **Racha de hábitos** - Visualiza tu progreso con contadores de racha

## Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   └── habits/
│   │       ├── route.ts
│   │       └── [habitId]/
│   │           ├── route.ts
│   │           ├── complete/route.ts
│   │           └── reset-wheel/route.ts
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── header.tsx
│   ├── habit-list.tsx
│   ├── habit-card.tsx
│   ├── habit-calendar.tsx
│   ├── create-habit-modal.tsx
│   └── reward-wheel-modal.tsx
├── hooks/
│   ├── use-auth.ts
│   └── use-theme.ts
├── lib/
│   ├── auth.ts
│   └── habits.ts
└── data/
    └── db.json (Base de datos simulada)
```

## Base de Datos JSON

La base de datos utiliza un archivo `data/db.json` con la siguiente estructura:

```json
{
  "users": [
    {
      "id": 1,
      "email": "usuario@example.com",
      "password": "hashed_password",
      "name": "Nombre Usuario",
      "createdAt": "2024-02-25T00:00:00Z",
      "habits": [
        {
          "id": 1,
          "name": "Ejercicio",
          "description": "30 minutos de ejercicio",
          "color": "#7c3aed",
          "createdAt": "2024-02-25T00:00:00Z",
          "streak": 3,
          "lastCompletedDate": "2024-02-25",
          "completedDates": ["2024-02-23", "2024-02-24", "2024-02-25"],
          "rewardWheelTriggered": false,
          "rewards": [
            { "id": 1, "name": "Helado", "icon": "🍦" }
          ]
        }
      ]
    }
  ]
}
```

## Autenticación

### Sistema de Validación Integrado

Las validaciones están integradas en los módulos, preparadas para migración a Supabase:

- **Email:** Validación de formato de email
- **Contraseña:** Mínimo 6 caracteres
- **Unicidad:** Verificación de email único en la base de datos

Archivo clave: `lib/auth.ts`

### Credenciales de Prueba

- **Email:** test@example.com
- **Contraseña:** 123456

## Cómo Usar

### 1. Registro
1. Dirígete a `/register`
2. Completa el formulario con nombre, email y contraseña
3. Se guardará automáticamente y te llevará al dashboard

### 2. Crear Hábito
1. En el dashboard, haz clic en "+ Nuevo Hábito"
2. Define:
   - Nombre del hábito
   - Descripción (opcional)
   - Color (para identificación visual)
   - Recompensas (al menos una)
3. Haz clic en "Crear Hábito"

### 3. Marcar Completado
1. En el calendario del hábito, haz clic en el día que lo completaste
2. El día se marcará con un checkmark
3. Tu racha se actualizará automáticamente

### 4. Ruleta de Recompensas
- Cuando alcances 7 días consecutivos, se activa automáticamente la ruleta
- Se bloquea la interacción con el calendario
- Haz clic en "Girar Ruleta" para elegir tu recompensa
- Después de reclamar, se reinicia el contador

### 5. Cambiar Tema
- En el header, usa el botón de sol/luna para cambiar entre modo claro y oscuro
- La preferencia se guarda automáticamente

## Migración a Supabase

La aplicación está preparada para migrar a Supabase. Para hacerlo:

1. Las funciones de validación en `lib/auth.ts` se pueden reemplazar con Supabase Auth
2. Las operaciones de lectura/escritura en `lib/habits.ts` usarían Supabase Database
3. Los endpoints de API necesitarían actualizarse para usar el cliente de Supabase
4. Se puede implementar Row Level Security (RLS) para proteger datos de usuarios

## Tecnologías Utilizadas

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Shadcn/ui** - Componentes de UI
- **Lucide Icons** - Iconografía
- **JSON** - Base de datos simulada

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm run start

# Lint
npm run lint
```

## Notas de Desarrollo

- La base de datos JSON se lee/escribe desde `data/db.json`
- Los validaciones están centralizadas en `lib/auth.ts` y `lib/habits.ts`
- Los temas se guardan en localStorage
- Las sesiones se mantienen con tokens simples en localStorage
- El sistema de racha se calcula comparando fechas consecutivas

## Próximas Mejoras

- Migración a Supabase Auth y Database
- Implementar bcrypt para hash de contraseñas
- Agregar notificaciones push
- Estadísticas avanzadas y gráficos
- Importar/exportar datos
- Compartir hábitos con amigos
- Sistema de logros

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 25, 2026
