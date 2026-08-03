import { useEffect, useReducer, useState } from "react";
import { createPortal } from "react-dom";

const FIELD_SELECTOR = "form input[placeholder], form textarea[placeholder]";
const EXCLUDED_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const hasVisibleLabel = (field) => {
  if (field.labels?.length) return true;

  return Array.from(field.parentElement?.children || []).some(
    (child) => child.tagName === "LABEL" && !child.contains(field)
  );
};

const isEligibleField = (field) => {
  const placeholder = field.getAttribute("placeholder")?.trim();
  if (!placeholder || field.dataset.noFloatingLabel !== undefined) return false;
  if (field.closest("[data-no-floating-labels]")) return false;
  if (/^search\b/i.test(placeholder)) return false;

  if (field.tagName === "INPUT") {
    const type = (field.getAttribute("type") || "text").toLowerCase();
    if (EXCLUDED_INPUT_TYPES.has(type) || type === "search") return false;
  }

  return !hasVisibleLabel(field);
};

const getFloatingLabel = (field) =>
  field.dataset.floatingLabel?.trim() ||
  field.getAttribute("placeholder")?.trim() ||
  "";

const getFieldBackground = (field) => {
  const fieldBackground = window.getComputedStyle(field).backgroundColor;
  if (fieldBackground && fieldBackground !== "rgba(0, 0, 0, 0)") {
    return fieldBackground;
  }
  return "#ffffff";
};

export default function FloatingFormLabels() {
  const [fields, setFields] = useState([]);
  const [, refresh] = useReducer((value) => value + 1, 0);

  useEffect(() => {
    let observedFields = new Set();
    let observedHosts = new Set();
    let animationFrame = 0;

    const scheduleRefresh = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => refresh());
    };

    const scanFields = () => {
      const nextFields = Array.from(document.querySelectorAll(FIELD_SELECTOR)).filter(
        isEligibleField
      );
      const nextFieldSet = new Set(nextFields);
      const nextHosts = new Set();

      observedFields.forEach((field) => {
        if (!nextFieldSet.has(field) && field.isConnected) {
          delete field.dataset.floatingLabelControl;
        }
      });

      nextFields.forEach((field) => {
        field.dataset.floatingLabelControl = "true";
        const host = field.parentElement;
        if (!host || window.getComputedStyle(host).display === "contents") return;
        nextHosts.add(host);
        if (window.getComputedStyle(host).position === "static") {
          host.dataset.floatingLabelHost = "true";
        }
      });

      observedHosts.forEach((host) => {
        if (!nextHosts.has(host) && host.isConnected) {
          delete host.dataset.floatingLabelHost;
        }
      });

      observedFields = nextFieldSet;
      observedHosts = nextHosts;
      setFields((current) => {
        if (
          current.length === nextFields.length &&
          current.every((field, index) => field === nextFields[index])
        ) {
          return current;
        }
        return nextFields;
      });
      scheduleRefresh();
    };

    const handleFieldActivity = (event) => {
      if (event.type === "reset") {
        window.setTimeout(scheduleRefresh, 0);
        return;
      }
      if (event.target?.matches?.(FIELD_SELECTOR)) scheduleRefresh();
    };

    const mutationObserver = new MutationObserver(scanFields);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["placeholder", "data-floating-label"],
    });

    document.addEventListener("focusin", handleFieldActivity);
    document.addEventListener("focusout", handleFieldActivity);
    document.addEventListener("input", handleFieldActivity);
    document.addEventListener("change", handleFieldActivity);
    document.addEventListener("reset", handleFieldActivity);
    window.addEventListener("resize", scheduleRefresh);
    scanFields();

    return () => {
      mutationObserver.disconnect();
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("focusin", handleFieldActivity);
      document.removeEventListener("focusout", handleFieldActivity);
      document.removeEventListener("input", handleFieldActivity);
      document.removeEventListener("change", handleFieldActivity);
      document.removeEventListener("reset", handleFieldActivity);
      window.removeEventListener("resize", scheduleRefresh);
      observedFields.forEach((field) => {
        if (field.isConnected) delete field.dataset.floatingLabelControl;
      });
      observedHosts.forEach((host) => {
        if (host.isConnected) delete host.dataset.floatingLabelHost;
      });
    };
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return undefined;
    const resizeObserver = new ResizeObserver(() => refresh());

    fields.forEach((field) => {
      if (!field.isConnected) return;
      resizeObserver.observe(field);
      if (field.parentElement) resizeObserver.observe(field.parentElement);
    });

    return () => resizeObserver.disconnect();
  }, [fields]);

  return fields.map((field, index) => {
    const host = field.parentElement;
    if (!field.isConnected || !host || window.getComputedStyle(host).display === "contents") {
      return null;
    }

    const placeholder = field.getAttribute("placeholder")?.trim();
    const labelText = getFloatingLabel(field);
    if (!placeholder || !labelText) return null;

    const computedStyle = window.getComputedStyle(field);
    const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 12;
    const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 10;
    const hasValue = String(field.value ?? "").trim().length > 0;
    const active = document.activeElement === field || hasValue;
    const isTextarea = field.tagName === "TEXTAREA";
    const left = field.offsetLeft + (active ? Math.min(Math.max(paddingLeft, 10), 16) : paddingLeft);
    const idleTop = isTextarea
      ? field.offsetTop + paddingTop + 7
      : field.offsetTop + field.offsetHeight / 2;
    const top = active ? field.offsetTop : idleTop;

    return createPortal(
      <span
        aria-hidden="true"
        className={`floating-form-label${active ? " is-active" : ""}`}
        style={{
          left,
          top,
          backgroundColor: active ? getFieldBackground(field) : "transparent",
          maxWidth: Math.max(field.offsetWidth - paddingLeft - 10, 40),
        }}
      >
        {labelText}
      </span>,
      host,
      `${field.name || field.id || labelText}-${index}`
    );
  });
}
