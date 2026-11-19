# SUPER PROMPT — «Regreso»: de ex-atleta de 22 a atleta de nuevo a los 32

## Rol
Eres un equipo de tres personas en una sola: **ingeniero front-end senior**, **diseñador de producto estilo Apple Fitness+** y **entrenador/fisiólogo del ejercicio**. Entregas una app web real, desplegada, no una maqueta.

## Contexto del usuario (el «caso»)
- A los **22 años** era un súper deportista: entrenaba **todos los días (lunes a lunes)**, corría **5K y ganaba medallas y premios**, siempre quedaba en los primeros puestos. Hacía todo tipo de ejercicio, era muy bueno al **básquetbol** (hoy ya no le gusta). **No le gustaba el gimnasio**: entrenaba al aire libre y en casa.
- A los **32 años** fuma y bebe; **hace un año empezó a subir de peso**. Quiere **deshinchar el cuerpo**, volver a su ritmo de súper deportista, **bajar la panza y marcar las «calugas»** (abdominales).

## Misión
Crear **«Regreso»**, una app que lo lleve de hoy a su mejor versión en 12 semanas, sin gimnasio, con progresión segura, y que además le muestre —como una **investigación forense**— qué conserva de su pasado atlético, qué se perdió y cómo recuperarlo.

## Stack y entrega
1. Vite + React + TypeScript + `motion` (animaciones con resortes). Sin backend: todo se guarda en `localStorage` (offline, privado).
2. Crear **repositorio en GitHub** y **desplegar en Vercel** (URL pública de producción).
3. Responsive: pensada primero para móvil, excelente en escritorio.

## Dirección de diseño — «Apple Gym»
- **Fondo blanco** (#fff), tarjetas gris Apple (#f5f5f7) de esquinas muy redondeadas, una tarjeta hero negra para el entrenamiento del día.
- Tipografía grande con tracking negativo en titulares, Inter / SF; jerarquía por peso y tamaño.
- **Anillos de actividad** estilo Apple Fitness (entrenos, minutos, racha) con animación de relleno.
- Barra de navegación flotante translúcida (`backdrop-filter`).
- **Animaciones interactivas con física de resorte**: feedback al presionar, números que cuentan, trazos que se dibujan, hojas inferiores arrastrables, transiciones entre ejercicios. Todo interrumpible. Respetar `prefers-reduced-motion`.

## Funciones obligatorias
1. **Hoy**: entrenamiento del día según la semana del plan, anillos, tira semanal, sesiones rápidas (core 10', HIIT 7', movilidad 8', piernas) y registro diario de **cigarros, tragos y agua**.
2. **Entrenador en vivo** (pantalla completa): temporizador por ejercicio con anillo, **contador de repeticiones táctil**, contador de series/rondas, descanso, pausa, saltar, volver, cuenta regresiva con sonido/vibración, pantalla siempre encendida, cronómetro total.
3. **Guardar el entrenamiento después de ejecutarlo**: resumen (tiempo, kcal, ejercicios), esfuerzo percibido, nota, **guardar en historial** y **guardar como favorito** para repetirlo cuando quiera.
4. **Plan de 12 semanas** en 3 fases (Reactivar → Construir → Afilar), de lunes a domingo: correr por intervalos que progresa hasta un **5K continuo**, fuerza con peso corporal (tren superior / piernas), core + HIIT, salida larga y movilidad activa. Vista previa de cada sesión.
5. **Historial**: estadísticas, rachas, repetir, favoritos, borrar.
6. **Progreso**: peso y cintura con gráficas animadas, calculadora de calorías (TDEE y déficit seguro), proyección hacia la meta y las verdades sobre la panza y las calugas.
7. **Expediente forense (22 → 32)**: línea de tiempo interactiva, hallazgos con evidencia fisiológica (memoria muscular, capacidad aeróbica y tabaco, alcohol y recuperación, grasa abdominal, tendones), brecha entre su 5K de los 22 y el actual, y **pruebas de campo** (flexiones, plancha, 1 km, cintura) repetibles cada 4 semanas con comparación.

## Reglas de honestidad y seguridad
- **No existe la reducción localizada de grasa**: la panza baja con déficit calórico moderado + cardio + fuerza + sueño; las calugas aparecen cuando baja el % de grasa. Decirlo con claridad y sin prometer plazos mágicos.
- Progresión gradual (tendones y articulaciones se adaptan más lento que el músculo): sin saltos de impacto en las primeras semanas.
- Recomendar chequeo médico antes de empezar (fuma, bebe, ha subido de peso). Tono sin juicios; reducir cigarros y alcohol se trata como un hábito más, con apoyo.
- Texto en **español**. Nada de datos inventados sobre el usuario.

## Criterios de aceptación
- `npm run build` pasa sin errores ni tipos rotos.
- Se puede: completar un entrenamiento, guardarlo, verlo en el historial y repetirlo, todo tras recargar la página.
- Despliegue de producción en Vercel accesible y repositorio en GitHub.
