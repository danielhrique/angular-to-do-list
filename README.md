# Minha Lista de Tarefas

Aplicação de lista de tarefas desenvolvida com Angular para praticar componentes standalone, formulários reativos e gerenciamento de estado local.

## Funcionalidades

- Criar, editar e excluir tarefas com confirmação.
- Marcar tarefas como concluídas e reabri-las.
- Filtrar tarefas por todas, pendentes ou concluídas.
- Acompanhar os totais de tarefas e receber notificações das ações.
- Manter os dados no `localStorage` do navegador.
- Usar a interface em telas móveis, tablets e desktops.

## Tecnologias

- Angular 22
- Angular Material
- TypeScript
- Reactive Forms e Signals
- CSS e Sass

## Requisitos

Node.js e npm instalados.

## Instalação

```bash
npm install
```

## Uso

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Abra `http://localhost:4200/` no navegador. As tarefas ficam salvas localmente nesse navegador; limpar os dados do site também remove as tarefas.

## Verificação

Execute os testes:

```bash
npm test
```

Gere o build de produção:

```bash
npm run build
```
