// components/common/ConnectWalletButton.tsx
import React from "react";

interface ConnectWalletButtonProps {
  onClick: () => void;
  label?: string;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onClick,
  label = "CONNECT WALLET",
}) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer px-10 py-1 text-lg font-bold font-monument rounded-full shadow-lg transform transition hover:scale-105"
      style={{ backgroundColor: "#540CCC", color: "#FFFF4F" }}
    >
      {label}
    </button>
  );
};

export default ConnectWalletButton;
