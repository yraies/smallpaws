import type React from "react";
import EdgeActionButton from "./EdgeActionButton";

export type RailAction = {
  key: string;
  label: string;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  variant?: "default" | "success" | "info" | "danger";
  icon: React.ReactElement;
};

interface PageActionRailsProps {
  leftActions?: RailAction[];
  rightActions?: RailAction[];
}

export default function PageActionRails({
  leftActions = [],
  rightActions = [],
}: PageActionRailsProps) {
  return (
    <nav aria-label="Page actions" className="print:hidden">
      {leftActions.length > 0 && (
        <div className="fixed top-20 left-6 z-10 hidden flex-col gap-2 lg:flex xl:left-10">
          {leftActions.map((action) => (
            <EdgeActionButton
              key={action.key}
              onClick={action.onClick}
              label={action.label}
              title={action.title}
              disabled={action.disabled}
              variant={action.variant}
            >
              {action.icon}
            </EdgeActionButton>
          ))}
        </div>
      )}

      {rightActions.length > 0 && (
        <div className="fixed top-20 right-6 z-10 hidden flex-col gap-2 lg:flex xl:right-10">
          {rightActions.map((action) => (
            <EdgeActionButton
              key={action.key}
              onClick={action.onClick}
              label={action.label}
              title={action.title}
              disabled={action.disabled}
              variant={action.variant}
            >
              {action.icon}
            </EdgeActionButton>
          ))}
        </div>
      )}

      {(leftActions.length > 0 || rightActions.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 lg:hidden">
          {[...leftActions, ...rightActions].map((action) => (
            <EdgeActionButton
              key={action.key}
              onClick={action.onClick}
              label={action.label}
              title={action.title}
              disabled={action.disabled}
              variant={action.variant}
            >
              {action.icon}
            </EdgeActionButton>
          ))}
        </div>
      )}
    </nav>
  );
}
