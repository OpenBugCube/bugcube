import styles from "./MyDialog.module.scss";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ReactElement, Ref, forwardRef } from "react";

export interface MyDialogProps {
  className?: string;
  title: string;
  body: string;
  open: boolean;
  handler: Function;
}

export const handleClose = (handler: Function) => {
  handler(false);
};

export const handleOpen = (handler: Function) => {
  handler(true);
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const MyDialog = ({
  className,
  title,
  body,
  open,
  handler,
}: MyDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={(_: any) => {
        handleClose(handler);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullScreen={true}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={(_: any) => {
              handleClose(handler);
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <DialogContentText
          className={styles.ContentText}
          id="alert-dialog-description"
        >
          <Typography dangerouslySetInnerHTML={{ __html: body }}></Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(_: any) => {
            handleClose(handler);
          }}
          autoFocus
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
