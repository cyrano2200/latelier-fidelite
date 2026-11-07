"use client";

import { useState, useTransition } from "react";
import { redeemRewardAction } from "@/lib/actions";
import { FormMessage } from "./FormMessage";

export function RedeemRewardButton({
  rewardId,
  affordable,
}: {
  rewardId: string;
  affordable: boolean;
}) {
  const [message, setMessage] = useState<{ error?: string; success?: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={!affordable || pending}
        className="btn-ghost px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => {
          startTransition(async () => {
            const result = await redeemRewardAction(rewardId);
            setMessage(result);
            if (result.success) {
              window.location.reload();
            }
          });
        }}
      >
        {pending ? "Échange…" : affordable ? "Échanger" : "Points insuffisants"}
      </button>
      <FormMessage error={message?.error} success={message?.success} />
    </div>
  );
}
