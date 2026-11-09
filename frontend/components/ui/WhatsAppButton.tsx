import styles from "./WhatsAppButton.module.css";

// Digits only, with country code. Override with NEXT_PUBLIC_WHATSAPP_NUMBER if it ever changes.
const RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918356939586";
const DIGITS = RAW.replace(/\D/g, "");
const PRETTY = `+${DIGITS.slice(0, 2)} ${DIGITS.slice(2)}`;
const MESSAGE = "Hi MakeUsSparkle! I need some help.";

/** Floating "chat with us" button, bottom-right on every storefront page. */
export default function WhatsAppButton() {
  return (
    <a
      className={styles.wa}
      href={`https://wa.me/${DIGITS}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp, ${PRETTY}`}
      title="Chat with us on WhatsApp"
    >
      <svg className={styles.icon} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 29l8.14-1.56a12 12 0 0 0 3.9.65h.01C22.68 28.1 28 22.7 28 16.06 28 9.4 22.68 3 16.04 3Zm0 21.9h-.01c-1.18 0-2.34-.32-3.35-.92l-.24-.14-4.83.93.96-4.7-.16-.25a9.9 9.9 0 0 1-1.52-5.26c0-5.5 4.48-9.98 9.99-9.98 5.5 0 9.97 4.48 9.97 9.99 0 5.5-4.47 9.98-9.97 9.98Zm5.47-7.47c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
