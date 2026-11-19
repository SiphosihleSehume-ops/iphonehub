"use client";

import { useState } from "react";
import { CONDITION_FILTERS, MODEL_FILTERS, STORAGE_FILTERS } from "@/lib/products";
import { ChevronUp } from "./Icons";

export interface FilterState {
  models: string[];
  storages: string[];
  conditions: string[];
}

interface FiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

type Group = keyof FilterState;

const GROUPS: { key: Group; title: string; options: readonly string[] }[] = [
  { key: "models", title: "Model", options: MODEL_FILTERS },
  { key: "storages", title: "Storage", options: STORAGE_FILTERS },
  { key: "conditions", title: "Condition", options: CONDITION_FILTERS },
];

export default function Filters({ value, onChange }: FiltersProps) {
  const [collapsed, setCollapsed] = useState<Record<Group, boolean>>({
    models: false,
    storages: false,
    conditions: false,
  });

  const toggle = (group: Group, option: string) => {
    const current = value[group];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    onChange({ ...value, [group]: next });
  };

  return (
    <aside className="filters" aria-label="Filter products">
      <h2 className="filters__title">Filter Products</h2>

      {GROUPS.map((group) => (
        <fieldset key={group.key} className="filters__group">
          <legend className="filters__legend">
            <button
              type="button"
              className="filters__head"
              aria-expanded={!collapsed[group.key]}
              onClick={() =>
                setCollapsed((c) => ({ ...c, [group.key]: !c[group.key] }))
              }
            >
              {group.title}
              <ChevronUp
                className={collapsed[group.key] ? "is-flipped" : undefined}
                width={16}
                height={16}
              />
            </button>
          </legend>

          {!collapsed[group.key] && (
            <ul>
              {group.options.map((option) => (
                <li key={option}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={value[group.key].includes(option)}
                      onChange={() => toggle(group.key, option)}
                    />
                    <span className="check__box" aria-hidden="true" />
                    {option}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      ))}
    </aside>
  );
}
