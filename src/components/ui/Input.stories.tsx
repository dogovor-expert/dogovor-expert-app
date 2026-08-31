import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { fn } from 'storybook/test';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Тип поля ввода',
    },
    placeholder: {
      control: 'text',
      description: 'Плейсхолдер',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключено ли поле',
    },
    error: {
      control: 'text',
      description: 'Сообщение об ошибке',
    },
    value: {
      control: 'text',
      description: 'Значение поля',
    },
  },
  args: {
    onChange: fn(),
    placeholder: 'Введите текст...',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Введите текст...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Пример текста',
    placeholder: 'Введите текст...',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Введите email...',
    error: 'Некорректный email',
    value: 'invalid-email',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Отключенное поле',
    disabled: true,
    value: 'Недоступно',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'example@mail.ru',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Введите пароль',
  },
};