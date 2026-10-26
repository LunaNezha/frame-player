import { useEffect, useId, useRef, type ReactNode } from "react";
import { PlayerIcon } from "./PlayerIcon";

export interface ControlMenuOption {
  value: string;
  label: string;
  description?: string;
}

interface ControlMenuProps {
  label: string;
  display: ReactNode;
  options: readonly ControlMenuOption[];
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
}

export function ControlMenu({
  label,
  display,
  options,
  value,
  open,
  onOpenChange,
  onSelect,
}: ControlMenuProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const changeRef = useRef(onOpenChange);
  useEffect(() => {
    changeRef.current = onOpenChange;
  });

  useEffect(() => {
    if (!open) return;
    const selected = menuRef.current?.querySelector<HTMLElement>(
      '[aria-checked="true"]',
    );
    (
      selected ??
      menuRef.current?.querySelector<HTMLElement>('[role="menuitemradio"]')
    )?.focus();
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        changeRef.current(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="player-menu-root"
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          onOpenChange(false);
        else if (!event.relatedTarget) onOpenChange(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className="player-button player-menu-trigger"
        data-active={open}
        onClick={() => onOpenChange(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            onOpenChange(true);
          }
        }}
      >
        {display}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          aria-labelledby={`${id}-trigger`}
          className="player-menu"
          onKeyDown={(event) => {
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                '[role="menuitemradio"]',
              ),
            );
            const index = items.indexOf(document.activeElement as HTMLElement);
            if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              event.stopPropagation();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? items.length - 1
                    : (index +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        items.length) %
                      items.length;
              items[next]?.focus();
            } else if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              onOpenChange(false);
              triggerRef.current?.focus();
            }
          }}
        >
          <p className="player-menu-heading">{label}</p>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === option.value}
              tabIndex={-1}
              className="player-menu-option"
              onClick={() => {
                onSelect(option.value);
                onOpenChange(false);
                triggerRef.current?.focus();
              }}
            >
              <span>
                {option.label}
                {option.description && <small>{option.description}</small>}
              </span>
              {value === option.value && (
                <PlayerIcon name="check" width="16" height="16" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
