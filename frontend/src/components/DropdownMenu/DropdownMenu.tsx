import { useEffect, useState, useMemo } from "react";
import styles from "./DropdownMenu.module.scss";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const CssTextField = styled(TextField)({
  "& input": {
    color: "floralwhite",
    fontSize: "1.1em",
  },
  "& label.Mui-focused": {
    color: "#2196f3",
  },
  "& label": {
    color: "floralwhite",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "floralwhite",
    },
    "&:hover fieldset": {
      borderColor: "#2196f3",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1769aa",
    },
  },
});

export interface DropdownMenuProps {
  className?: string;
  items: string[];
  update_func: Function;
  label: string;
}

export const DropdownMenu = ({
  className,
  items,
  update_func,
  label,
}: DropdownMenuProps) => {
  const [values, setValues] = useState<string[]>([]);
  const [value, setValue] = useState<string | null>("");
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setValues(items);
    setValue(items[0] ? items[0] : "");
    setInputValue(items[0] ? items[0] : "");
  }, [items]);

  return (
    <Grid container className={styles.DropdownMenu}>
      <Autocomplete
        autoHighlight={true}
        className={styles.Select}
        options={values}
        renderInput={(params) => (
          <CssTextField
            {...params}
            label={label}
            size="small"
            autoComplete="off"
          />
        )}
        onChange={(_: any, new_value: string | null) => {
          setValue(new_value);
          update_func(new_value);
        }}
        inputValue={inputValue}
        value={value}
        onInputChange={(_: any, new_value: string) => setInputValue(new_value)}
      />
    </Grid>
  );
};
