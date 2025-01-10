"use client";
import { Modal } from "../common/Modal";
import { LoginForm } from "./LoginForm";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
}

export function LoginDialog({ isOpen, onClose, onSubmit }: LoginDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <LoginForm onSubmit={onSubmit} />
    </Modal>
  );
}
