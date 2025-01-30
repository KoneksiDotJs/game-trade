import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export function OAuthButtons() {
  const { socialLogin, isLoading } = useAuth();

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => socialLogin("google")}
        disabled={isLoading}
        className="p-2 rounded-full border bg-white hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Continue with Google"
      >
        <Image src="/google.svg" alt="Google" width={24} height={24} />
      </button>

      <button
        onClick={() => socialLogin("facebook")}
        disabled={isLoading}
        className="p-2 rounded-full bg-[#1877F2] hover:bg-[#1869D6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Continue with Facebook"
      >
        <Image src="/facebook.svg" alt="Facebook" width={28} height={28} />
      </button>

      <button
        onClick={() => socialLogin("discord")}
        disabled={isLoading}
        className="p-2 rounded-full bg-white hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Continue with Discord"
      >
        <Image src="/discord.svg" alt="Discord" width={28} height={28} />
      </button>
    </div>
  );
}
