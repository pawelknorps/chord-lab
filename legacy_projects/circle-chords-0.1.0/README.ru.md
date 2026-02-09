# Guitar Progression Generator

[EN](./README.md)

Демо: https://circle-chords.malikov.tech/

React + TypeScript приложение для генерации аккордовых последовательностей, визуализации на квинтовом круге и гитарных грифах, с воспроизведением аудио. Приложение полностью конфигурируется JSON‑данными и поддерживает русский/английский интерфейс.

## Технологии и структура
- Стек: Vite, React 18, TypeScript, TailwindCSS, i18next, soundfont-player.
- Основные пути:
  - `src/` – код приложения: `App.tsx`, `pages/ChordExplorer.tsx`, `components/*`, `lib/*` (теория, типы, загрузка конфига, аудио).
  - `public/config/` – музыкальные данные: `scales.json`, `chords.json`, `progressions.json`, `circleOfFifths.json` (загружаются в рантайме через `src/lib/config.ts`).
  - `i18n/languages.json` – переводы для `src/i18n.ts`.

## Быстрый старт
Требования: Node 18 или 20.
- Установка: `npm install`
- Дев‑сервер: `npm run dev` (Vite)
- Сборка: `npm run build` → `dist/`
- Просмотр сборки: `npm run preview`
- Тесты: `npm run test` (Vitest + jsdom)
- Линт/формат: `npm run lint` / `npm run lint:fix` / `npm run format:fix`

## Как устроено
- Теория: `src/lib/theory.ts` вычисляет лады, аккорды и формирует прогрессии из данных `public/config`.
- UI: `src/components/*` и `src/pages/ChordExplorer.tsx` показывают прогрессии, диаграммы аккордов, грифы и интерактивный круг.
- Аудио: `src/lib/audio-sf.ts` (soundfont-player) — стабильное воспроизведение на мобильных; Tone.js (`src/lib/audio.ts`) доступен как альтернативный движок.

## Конфигурация
Все музыкальные данные — в `public/config/`, обновляются при перезагрузке страницы. Правьте JSON, чтобы добавлять лады, типы аккордов/аппликатуры и прогрессии. Подробнее в [CONFIG_GUIDE.ru.md](./CONFIG_GUIDE.ru.md).

## Деплой
GitHub Pages: `.github/workflows/static.yml`. В `vite.config.ts` задан `base: './'`, поэтому приложение работает из подпути. CI запускает тесты, собирает и публикует `dist/`.

