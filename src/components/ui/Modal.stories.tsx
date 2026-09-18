import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { useState, type ComponentProps } from 'react';
import { Button } from './Button';
import { fn } from 'storybook/test';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Открыто ли модальное окно',
    },
    title: {
      control: 'text',
      description: 'Заголовок модального окна',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Размер модального окна',
    },
  },
  args: {
    onClose: fn(),
    title: 'Заголовок модального окна',
    isOpen: true,
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalWithState = (args: ComponentProps<typeof Modal>) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Открыть модалку</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p className="text-gray-600">Содержимое модального окна. Здесь может быть любой контент.</p>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Закрыть</Button>
          <Button onClick={() => setIsOpen(false)}>Подтвердить</Button>
        </div>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Заголовок модального окна',
  },
};

export const Small: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Маленькое модальное окно',
    size: 'sm',
  },
};

export const Large: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Большое модальное окно',
    size: 'lg',
  },
};

export const WithoutTitle: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: '',
  },
};

export const WithLongContent: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    title: 'Модалка с длинным контентом',
    children: (
      <div>
        <p className="text-gray-600">Это модальное окно с большим количеством контента, чтобы проверить скроллинг.</p>
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i} className="text-gray-600 mt-2">Строка {i + 1}: дополнительный контент для проверки прокрутки.</p>
        ))}
      </div>
    ),
  },
};