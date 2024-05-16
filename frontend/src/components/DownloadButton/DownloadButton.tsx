import { useState } from "react";

import styles from "./DownloadButton.module.scss";
import DownloadIcon from "@mui/icons-material/Download";
import DownloadingIcon from "@mui/icons-material/Downloading";

export interface DownloadButtonProps {
  className?: string;
  onClick: Function;
  text: string;
  disabled: boolean;
  function_args: any[];
  is_download?: boolean;
}

export const DownloadButton = ({
  className,
  onClick,
  text,
  disabled,
  function_args,
  is_download,
}: DownloadButtonProps) => {
  if (typeof is_download === "undefined") {
    is_download = true;
  }
  var is_clicked = useState<boolean>(false);

  const on_click = (_: any) => {
    console.log("Start");
    is_clicked[1]((_: any) => true);
    onClick(...function_args, is_clicked[1]);
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={on_click}
      disabled={disabled || is_clicked[0]}
    >
      {is_download ? (
        <span className={styles.button__icon}>
          {is_clicked[0] ? <DownloadingIcon /> : <DownloadIcon />}
        </span>
      ) : (
        ""
      )}
      {is_download ? (
        <span className={styles.button__text}>{text}</span>
      ) : (
        <span className={styles.button__text__no__download}>{text}</span>
      )}
    </button>
  );
};
