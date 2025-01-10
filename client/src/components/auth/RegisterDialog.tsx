import { Modal } from "../common/Modal";
import { RegisterForm } from "./RegisterForm";

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function RegisterDialog({
  isOpen,
  onClose,
  onSubmit,
  onSwitchToLogin
}: RegisterDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <RegisterForm onSubmit={onSubmit} onSwitchToLogin={onSwitchToLogin} />
    </Modal>
  );
}
