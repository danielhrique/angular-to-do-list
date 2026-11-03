# Entendendo o TaskFormDialog

Este documento explica, passo a passo, os conceitos usados no componente do formulário de tarefa. A ideia é entender o papel de cada parte, não apenas memorizar a sintaxe.

## 1. O que é uma classe?

Uma classe é uma descrição de como criar objetos que compartilham estrutura e comportamento. Uma analogia cotidiana é a planta de uma casa: a planta descreve os cômodos e as características; a casa construída a partir dela é uma instância.

Em Angular, a classe `TaskFormDialog` descreve o componente. Ela contém dados e métodos. Quando Angular encontra `<app-task-form-dialog>` em um template, cria uma instância dessa classe e conecta essa instância ao HTML do componente.

```ts
export class TaskFormDialog {
  // propriedades e métodos do componente
}
```

A palavra `export` permite que outros arquivos importem essa classe.

## 2. Imports: ferramentas usadas pelo arquivo

```ts
import { Component, output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { type NewTask, type TaskPriority } from '../task.model';
```

Cada import disponibiliza uma ferramenta ou tipo para este arquivo:

- `Component` marca a classe como um componente Angular.
- `output` cria eventos que o componente pode emitir para o pai.
- `inject` pede ao sistema de injeção do Angular uma dependência, como um serviço.
- `MatIconModule` permite usar `<mat-icon>` no template.
- `FormBuilder` ajuda a criar o modelo do formulário.
- `ReactiveFormsModule` disponibiliza as diretivas usadas para conectar esse modelo ao HTML.
- `Validators` contém regras de validação, como `required`.
- `NewTask` e `TaskPriority` são tipos TypeScript. O modificador `type` deixa claro que eles servem à checagem de tipos e não representam valores usados em tempo de execução.

Uma analogia: os imports são as ferramentas que você coloca na bancada antes de começar um trabalho. O componente só pode usar as ferramentas que importou.

## 3. O decorator `@Component`

```ts
@Component({
  imports: [MatIconModule, ReactiveFormsModule],
  selector: 'app-task-form-dialog',
  styleUrl: './task-form-dialog.css',
  templateUrl: './task-form-dialog.html',
})
```

`@Component` é um decorator: uma anotação que fornece metadados para o Angular. Ele informa como a classe deve participar da aplicação:

- `selector` define a tag usada para renderizar o componente: `<app-task-form-dialog>`.
- `templateUrl` aponta para o HTML do componente.
- `styleUrl` aponta para os estilos do componente.
- `imports` lista as dependências que o template standalone pode usar.

Como o componente é standalone, as dependências do template são declaradas no próprio componente. Por exemplo, `MatIconModule` é necessário porque o HTML usa `<mat-icon>`.

## 4. Injeção de dependência e `FormBuilder`

```ts
private readonly formBuilder = inject(FormBuilder).nonNullable;
```

`FormBuilder` é um serviço Angular que facilita a criação de controles de formulário. `inject(FormBuilder)` pede uma instância desse serviço ao sistema de injeção do Angular, em vez de criar o serviço manualmente.

Imagine que o Angular administra uma caixa de ferramentas compartilhada. O componente pede a ferramenta `FormBuilder`, e o Angular fornece a instância apropriada.

Os modificadores têm papéis diferentes:

- `private`: a propriedade só é acessada de dentro da classe `TaskFormDialog`.
- `readonly`: a propriedade não será substituída por outra referência depois de inicializada.
- `.nonNullable`: cria controles que não tratam `null` como valor possível. Assim, um campo iniciado com `''` continua sendo uma string.

`readonly` não torna o formulário imutável. Os valores dos controles continuam mudando conforme a pessoa digita; o que não pode ser trocado é a referência `formBuilder` por outro objeto.

## 5. Outputs: comunicação do filho para o pai

```ts
readonly closeRequested = output<void>();
readonly taskAdded = output<NewTask>();
```

Um output é um evento que um componente filho emite para o componente que o contém. No Vue, o paralelo mais próximo é um evento enviado pelo filho com `emit`.

- `closeRequested` comunica que a pessoa pediu para fechar o modal. Ele não carrega dados.
- `taskAdded` comunica que o formulário forneceu os dados de uma nova tarefa. Ele carrega um valor do tipo `NewTask`.

O tipo dentro de `<...>` define o valor que o evento pode carregar:

- `output<void>()`: evento sem payload. Por isso, pode ser emitido com `emit()`.
- `output<NewTask>()`: evento que deve carregar um objeto compatível com `NewTask`, enviado com `emit(objeto)`.

O `readonly` protege a referência do output; ele não impede chamar `emit()`.

## 6. Modelo do formulário

```ts
readonly taskForm = this.formBuilder.group({
  title: ['', Validators.required],
  description: ['', Validators.required],
  priority: ['low' as TaskPriority],
  date: [''],
});
```

`group()` cria um grupo de controles. Pense nele como uma ficha com vários campos e um estado geral: o Angular sabe os valores atuais e se as regras de validação foram satisfeitas.

Cada entrada do objeto define um controle:

- `title`: começa como string vazia; `Validators.required` diz que é obrigatório.
- `description`: também começa vazia e é obrigatória.
- `priority`: começa com o valor `'low'`, que significa baixa prioridade.
- `date`: começa vazia. A data é opcional no tipo do domínio.

`'low' as TaskPriority` informa ao TypeScript que esse valor inicial pertence ao conjunto permitido por `TaskPriority`, definido no modelo como `'low' | 'medium' | 'high'`.

`readonly taskForm` impede substituir o grupo inteiro, mas não impede que seus campos sejam atualizados pelo formulário.

### O modelo e o HTML trabalham juntos

Reactive Forms separam o estado do formulário do elemento HTML, e conectam os dois por meio de diretivas:

```html
<form [formGroup]="taskForm" (ngSubmit)="submitTask()">
  <input formControlName="title" />
  <textarea formControlName="description"></textarea>
  <select formControlName="priority"></select>
  <input type="date" formControlName="date" />
  <button type="submit">Adicionar tarefa</button>
</form>
```

- `[formGroup]="taskForm"` liga o elemento `<form>` ao grupo criado na classe.
- `formControlName="title"` conecta aquele elemento ao controle de mesmo nome.
- `(ngSubmit)="submitTask()"` chama o método de envio quando o formulário é submetido.

Essa ligação faz o valor digitado aparecer no modelo e permite que a classe leia a validação de cada campo.

## 7. Fechar: método e evento

```ts
requestClose() {
  this.closeRequested.emit();
}
```

No HTML, o botão X chama `requestClose()` por meio de um event binding:

```html
<button type="button" (click)="requestClose()">
  Fechar
</button>
```

O método emite `closeRequested`. Ele não altera diretamente o estado do pai. Essa separação é importante: o filho comunica uma intenção; o pai decide o que fazer com ela.

O pai escuta o output pelo nome entre parênteses:

```html
<app-task-form-dialog
  (closeRequested)="closeTaskDialog()"
  (taskAdded)="addTask($event)"
/>
```

No exemplo, `$event` representa o valor que o filho enviou. Em `closeRequested`, não há payload. Em `taskAdded`, `$event` é o objeto `NewTask`.

## 8. Enviar os dados do formulário

```ts
submitTask(): void {
  if (this.taskForm.invalid) {
    this.taskForm.markAllAsTouched();
    return;
  }

  const { date, ...taskFields } = this.taskForm.getRawValue();

  this.taskAdded.emit({
    ...taskFields,
    ...(date ? { date } : {}),
  });
}
```

`submitTask(): void` declara um método chamado `submitTask`. `void` é o tipo de retorno: significa que o método não entrega um resultado com `return valor`.

### Verificação da validade

```ts
if (this.taskForm.invalid) {
  this.taskForm.markAllAsTouched();
  return;
}
```

`invalid` é `true` quando algum controle não passa nas validações. Se o título ou a descrição estiver vazio, por exemplo, `Validators.required` deixa o formulário inválido.

`markAllAsTouched()` marca todos os campos como visitados. Formulários costumam usar esse estado para decidir quando exibir mensagens de validação. `return` encerra o método imediatamente: se o formulário é inválido, não chegamos à emissão do evento.

### Ler e separar os valores

```ts
const { date, ...taskFields } = this.taskForm.getRawValue();
```

`getRawValue()` lê os valores atuais do grupo como um objeto. Essa sintaxe usa desestruturação: separa `date` e coloca os outros campos em `taskFields`.

Por exemplo, suponha que o formulário contenha:

```ts
{
  title: 'Estudar Angular',
  description: 'Praticar formulários',
  priority: 'medium',
  date: ''
}
```

Depois da desestruturação:

```ts
date === ''
taskFields === {
  title: 'Estudar Angular',
  description: 'Praticar formulários',
  priority: 'medium'
}
```

### Montar o objeto enviado

```ts
this.taskAdded.emit({
  ...taskFields,
  ...(date ? { date } : {}),
});
```

O operador `...` espalha as propriedades de um objeto dentro de outro. Primeiro copiamos `title`, `description` e `priority`. Depois, usamos uma condição: se `date` tiver valor, adicionamos `{ date }`; se estiver vazia, adicionamos um objeto vazio e a propriedade não entra no resultado.

Assim o payload enviado ao pai tem o formato `NewTask`.

## 9. Por que `NewTask` não tem `id` nem `completed`?

No arquivo `task.model.ts`, os tipos estão relacionados assim:

```ts
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  date?: string;
  completed: boolean;
}

export type NewTask = Omit<Task, 'id' | 'completed'>;
```

`interface Task` descreve uma tarefa que já existe na lista. Ela tem `id` e `completed`.

`Omit<Task, 'id' | 'completed'>` cria um tipo baseado em `Task`, mas remove esses dois campos. Isso representa os dados que o formulário conhece: o formulário não precisa criar o identificador nem decidir que a tarefa começa concluída.

O pai pode receber `NewTask` e completar a tarefa:

```ts
const task: Task = {
  ...newTask,
  id: nextId,
  completed: false,
};
```

Analogia: o filho preenche a ficha com as informações fornecidas pela pessoa; o pai acrescenta o número de protocolo e o status inicial antes de guardar a tarefa.

## 10. Fluxo completo entre formulário e lista

1. A pessoa digita no formulário.
2. As diretivas conectam os campos ao `taskForm`.
3. Ao submeter, `submitTask()` verifica as validações.
4. Se válido, o filho monta um `NewTask` e emite `taskAdded`.
5. O pai escuta o evento, recebe os dados em `$event`, cria um `Task` completo e atualiza seu array de tarefas.
6. O template do pai renderiza a lista.

O filho é responsável por coletar e comunicar os dados. O pai é responsável por manter a lista. Isso é comunicação de componente para componente, semelhante ao padrão `props`/`emit` do Vue: o pai passa ou mantém o estado, e o filho emite eventos para solicitar mudanças.

## Documentação oficial

- [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [Outputs e eventos entre componentes](https://angular.dev/guide/components/outputs)
- [Injeção de dependência](https://angular.dev/guide/di)
- [Signals](https://angular.dev/guide/signals)
