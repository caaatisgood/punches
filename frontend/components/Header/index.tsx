import Link from "next/link";
import { useRouter } from "next/router";

import { useUserStore } from "@/store/userStore";

const Header: React.FC<{ withSync?: boolean }> = ({ withSync = true }) => {
  const { address, sync, unsync } = useUserStore()
  const router = useRouter()

  return (
    <div className="font-sans w-full relative mb-2">
      <div className="rounded-md dark:bg-black backdrop-blur-md dark:bg-opacity-50 flex items-center min-h-[24px]">
        {router.asPath !== "/" && (
          <div className="mr-3 text-sm">
            <Link href="/" className="underline">punches</Link>
          </div>
        )}
        {router.asPath !== "/about" && (
          <div className="mr-3 text-sm">
            <Link href="/about" className="underline">what is punches?</Link>
          </div>
        )}
        {withSync && (
          <div className="flex-1 text-right">
            {address && (
              <span className="font-mono text-sm" title={address}>{address.slice(0, 6)}...{address.slice(-6)}</span>
            )}
            <button className="ml-2 underline" onClick={address ? unsync : sync}>
              {address ? "unsync" : "sync"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
