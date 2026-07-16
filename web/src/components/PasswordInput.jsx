import { useState } from "react";
import Icon from "./Icon.jsx";

// Goster/gizle dugmesi olan sifre alani. Deger disaridan yonetilir.
export default function PasswordInput({
  value,
  onChange,
  placeholder = "",
  required = false,
  autoComplete,
  autoFocus = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-field">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
        tabIndex={-1}
      >
        <Icon name={show ? "eye-off" : "eye"} size={18} />
      </button>
    </div>
  );
}
