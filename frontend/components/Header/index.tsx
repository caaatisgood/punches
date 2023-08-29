import { useUserStore } from "@/store/userStore";

const Header = () => {
  const { address, sync, unsync } = useUserStore()

  return (
    <div className="font-sans fixed top-2 right-4">
      {address && (
        <span className="font-mono text-sm" title={address}>{address.slice(0, 6)}...{address.slice(-6)}</span>
      )}
      <button className="ml-3 underline" onClick={address ? unsync : sync}>
        {address ? "unsync" : "sync"}
      </button>
    </div>
  );
};

export default Header;
