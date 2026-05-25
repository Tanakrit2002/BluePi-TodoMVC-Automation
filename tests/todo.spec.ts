import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

test.describe('TodoMVC - Add Todo', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should add a single new todo item and verify it appears', async () => {
    await todoPage.addTodo('Buy groceries');

    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Buy groceries');
    expect(todoPage.getTodoItems()).toHaveCount(1);
  });

  test('should add multiple items and verify count', async () => {
    await todoPage.addTodo('Item one');
    await todoPage.addTodo('Item two');
    await todoPage.addTodo('Item three');

    await expect(todoPage.getTodoItems()).toHaveCount(3);
    const count = await todoPage.getTodoCount();
    expect(count).toBe(3);
  });

  test('should not add a todo when pressing Enter with empty input', async () => {
    await todoPage.getNewTodoInput().press('Enter');

    await expect(todoPage.getTodoItems()).toHaveCount(0);
  });
});

test.describe('TodoMVC - Complete Todo', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo('Task to complete');
  });

  test('should apply completed class when checking a todo checkbox', async () => {
    await todoPage.completeTodo(0);

    await expect(todoPage.getTodoItemAt(0)).toHaveClass(/completed/);
  });

  test('should remove completed class when unchecking a completed todo', async () => {
    await todoPage.completeTodo(0);
    await expect(todoPage.getTodoItemAt(0)).toHaveClass(/completed/);

    await todoPage.uncompletesTodo(0);
    await expect(todoPage.getTodoItemAt(0)).not.toHaveClass(/completed/);
  });

  test('should decrement active item counter when a todo is completed', async () => {
    await todoPage.addTodo('Another task');
    const initialCount = await todoPage.getTodoCount();

    await todoPage.completeTodo(0);

    const newCount = await todoPage.getTodoCount();
    expect(newCount).toBe(initialCount - 1);
  });
});

test.describe('TodoMVC - Delete Todo', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should remove item when clicking the destroy button', async () => {
    await todoPage.addTodo('Item to delete');

    await todoPage.deleteTodo(0);

    await expect(todoPage.getTodoItems()).toHaveCount(0);
  });

  test('should reduce count by 1 when deleting one item from a list of many', async () => {
    await todoPage.addTodo('Keep this');
    await todoPage.addTodo('Delete this');
    await todoPage.addTodo('Keep this too');

    await todoPage.deleteTodo(1);

    await expect(todoPage.getTodoItems()).toHaveCount(2);
    const titles = await todoPage.getTodoTitles();
    expect(titles).not.toContain('Delete this');
  });
});

test.describe('TodoMVC - Filter: All / Active / Completed', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo('Active item');
    await todoPage.addTodo('Completed item');
    await todoPage.completeTodo(1);
  });

  test('should show all 2 items when All filter is selected', async () => {
    await todoPage.filterBy('All');

    await expect(todoPage.getTodoItems()).toHaveCount(2);
  });

  test('should show only active item when Active filter is selected', async () => {
    await todoPage.filterBy('Active');

    await expect(todoPage.getTodoItems()).toHaveCount(1);
    const titles = await todoPage.getTodoTitles();
    expect(titles[0]).toBe('Active item');
  });

  test('should show only completed item when Completed filter is selected', async () => {
    await todoPage.filterBy('Completed');

    await expect(todoPage.getTodoItems()).toHaveCount(1);
    const titles = await todoPage.getTodoTitles();
    expect(titles[0]).toBe('Completed item');
  });

  test('should apply selected class to the active filter link', async () => {
    await todoPage.filterBy('Active');
    await expect(todoPage.getFilterActive()).toHaveClass(/selected/);

    await todoPage.filterBy('Completed');
    await expect(todoPage.getFilterCompleted()).toHaveClass(/selected/);

    await todoPage.filterBy('All');
    await expect(todoPage.getFilterAll()).toHaveClass(/selected/);
  });
});

test.describe('TodoMVC - Clear Completed', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should remove completed items and keep active items after clicking Clear completed', async () => {
    await todoPage.addTodo('Stay active');
    await todoPage.addTodo('Will be cleared');
    await todoPage.completeTodo(1);

    await todoPage.clearCompleted();

    await expect(todoPage.getTodoItems()).toHaveCount(1);
    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Stay active');
    expect(titles).not.toContain('Will be cleared');
  });

  test('should not show Clear completed button when no items are completed', async () => {
    await todoPage.addTodo('Active task');

    await expect(todoPage.getClearCompletedButton()).not.toBeVisible();
  });

  test('should show Clear completed button when at least one item is completed', async () => {
    await todoPage.addTodo('Task to complete');
    await todoPage.completeTodo(0);

    await expect(todoPage.getClearCompletedButton()).toBeVisible();
  });
});
