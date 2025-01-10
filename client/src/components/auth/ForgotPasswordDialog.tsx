import { Modal } from "../common/Modal";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { email: string }) => Promise<void>;
  isLoading: boolean
}

export function ForgotPasswordDialog({
  isOpen,
  onClose,
  onSubmit,
}: ForgotPasswordDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ForgotPasswordForm onSubmit={onSubmit} />
    </Modal>
  );
}
