import { type Page, type Locator } from '@playwright/test';

type FilterOption = 'All' | 'Active' | 'Completed';

export class TodoPage {
  private readonly page: Page;
  private readonly newTodoInput: Locator;
  private readonly todoList: Locator;
  private readonly todoItems: Locator;
  private readonly todoCount: Locator;
  private readonly clearCompletedButton: Locator;
  private readonly filterAll: Locator;
  private readonly filterActive: Locator;
  private readonly filterCompleted: Locator;
  private readonly toggleAll: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoList = page.locator('.todo-list');
    this.todoItems = page.locator('.todo-list li');
    this.todoCount = page.locator('.todo-count strong');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    this.filterAll = page.getByRole('link', { name: 'All' });
    this.filterActive = page.getByRole('link', { name: 'Active' });
    this.filterCompleted = page.getByRole('link', { name: 'Completed' });
    this.toggleAll = page.locator('.toggle-all');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://demo.playwright.dev/todomvc');
  }

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async completeTodo(index: number): Promise<void> {
    await this.todoItems.nth(index).locator('.toggle').click();
  }

  async uncompletesTodo(index: number): Promise<void> {
    await this.todoItems.nth(index).locator('.toggle').click();
  }

  async deleteTodo(index: number): Promise<void> {
    await this.todoItems.nth(index).hover();
    await this.todoItems.nth(index).locator('.destroy').click();
  }

  async filterBy(option: FilterOption): Promise<void> {
    switch (option) {
      case 'All':
        await this.filterAll.click();
        break;
      case 'Active':
        await this.filterActive.click();
        break;
      case 'Completed':
        await this.filterCompleted.click();
        break;
    }
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  async getTodoTitles(): Promise<string[]> {
    return this.todoItems.locator('label').allTextContents();
  }

  async getTodoCount(): Promise<number> {
    const text = await this.todoCount.textContent();
    return parseInt(text ?? '0', 10);
  }

  getTodoItemAt(index: number): Locator {
    return this.todoItems.nth(index);
  }

  getTodoItems(): Locator {
    return this.todoItems;
  }

  getFilterAll(): Locator {
    return this.filterAll;
  }

  getFilterActive(): Locator {
    return this.filterActive;
  }

  getFilterCompleted(): Locator {
    return this.filterCompleted;
  }

  getClearCompletedButton(): Locator {
    return this.clearCompletedButton;
  }

  getNewTodoInput(): Locator {
    return this.newTodoInput;
  }
}
