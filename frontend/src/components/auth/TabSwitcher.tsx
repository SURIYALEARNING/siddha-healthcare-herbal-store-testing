import { useTranslation } from "react-i18next";

interface TabSwitcherProps {
  active: "login" | "register";
  onChange: (tab: "login" | "register") => void;
}

export default function TabSwitcher({ active, onChange }: TabSwitcherProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 border-b border-gray-100 pb-1.5">
      {(["login", "register"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`py-2 text-xs font-black uppercase tracking-widest cursor-pointer ${
            active === tab
              ? "text-siddha-dark border-b-2 border-siddha-dark pb-3.5"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab === "login" ? t("auth.signIn") : t("auth.register")}
        </button>
      ))}
    </div>
  );
}
