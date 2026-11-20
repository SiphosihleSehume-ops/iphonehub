"use client";

import { useState } from "react";
import { CONDITIONS } from "@/lib/types";
import { ChevronUp } from "./Icons";

export interface FilterState {
  models: string[];
  storages: string[];
  conditions: string[];
}

interface FiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** Built from the products currently on sale, so new models appear automatically */
  models: string[];
  storages: string[];
}

type Group = keyof FilterState;

export default function Filters({ value, onChange, models, storages }: FiltersProps) {
  const groups: { key: Group; title: string; options: readonly string[] }[] = [
    { key: "models", title: "Model", options: models },
    { key: "storages", title: "Storage", options: storages },
    { key: "conditions", title: "Condition", options: CONDITIONS },
  ];

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

      {groups.map((group) => (
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
