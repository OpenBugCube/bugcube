import styles from "./Input.module.scss";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";
import Grid from "@mui/material/Grid";

export interface InputProps {
  className?: string;
  inputs: [string[], Function, string][];
}

export const Input = ({ className, inputs }: InputProps) => {
  return (
    <Grid className={styles.Input} container direction="column">
      {inputs.map((input, i) => (
        <DropdownMenu
          items={input[0]}
          update_func={input[1]}
          label={input[2]}
          key={"input-" + i}
        ></DropdownMenu>
      ))}
    </Grid>
  );
};

export default Input;
