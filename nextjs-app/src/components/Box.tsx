import React from "react";

interface BoxProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
  buttons?: React.ReactNode;
  editableTitle?: boolean;
}

const Box: React.FC<BoxProps> = ({
  title,
  onTitleChange,
  editableTitle,
  children,
  buttons,
}) => {
  return (
    <div className="flex w-full flex-col items-center gap-2 bg-violet-400 p-2 text-white">
      <header className="flex h-8 w-full items-center justify-between gap-4 px-3">
        {editableTitle ? (
          <input
            type="text"
            className="small-caps min-w-20 shrink grow border-b-1 text-xl font-semibold tracking-widest"
            value={title}
            onChange={onTitleChange}
            placeholder="Category"
          />
        ) : (
          <h2 className="small-caps min-w-20 grow border-b-1 text-xl font-semibold tracking-widest">
            {title}
          </h2>
        )}
        {buttons && <div className="flex">{buttons}</div>}
      </header>
      <div className="w-full bg-white p-1 text-black">{children}</div>
    </div>
  );
};

export default Box;
