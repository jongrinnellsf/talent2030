import { ChevronLeftIcon } from "@radix-ui/react-icons";

type CoachBackButtonProps = {
  onClick: () => void;
};

export function CoachBackButton({ onClick }: CoachBackButtonProps) {
  return (
    <button
      type="button"
      className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-[0.8125rem]"
      onClick={onClick}
    >
      <ChevronLeftIcon className="h-4 w-4" aria-hidden />
      Back to Coach home
    </button>
  );
}
