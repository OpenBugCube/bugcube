import { useState, useEffect } from "react";
import Axios from "axios";
import styles from "./Footer.module.scss";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { MyDialog, handleOpen } from "../MyDialog/MyDialog";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)({
  "&.Mui-disabled": {
    color: "#c0c0c0",
  },
  "&.MuiButton-outlined.Mui-disabled": {
    background: "transparent",
    color: "#b7babf",
  },
  "&.MuiButton-contained.Mui-disabled": {
    background: "#4a4a4a",
    color: "#c0c0c0",
  },
});

export interface FooterProps {
  className?: string;
  backend_misc_ip: string;
  backend_static_ip: string;
}

export const Footer = ({
  className,
  backend_misc_ip,
  backend_static_ip,
}: FooterProps) => {
  const privacyPolicy = useState(false);
  const imprint = useState(false);
  const contactInformation = useState(false);

  const privacyPolicyBody = useState("No fetched information yet!");
  const imprintBody = useState("No fetched information yet!");
  const contactInformationBody = useState("No fetched information yet!");

  const xLink = useState("");
  const youtubeLink = useState("");
  const howToCiteLink = useState("");
  const institutionLink = useState("");

  const get_backend_info = (
    endpoint: string,
    handler: Function,
    link: boolean,
  ) => {
    Axios.get(backend_misc_ip + "/endpoint/" + endpoint, {
      params: { extension: ".txt" },
    }).then((response) => {
      if (response.data.includes("FileNotFoundError:")) {
        Axios.get(backend_misc_ip + "/endpoint/" + endpoint, {
          params: { extension: ".html" },
        }).then((sub_resp) => {
          if (sub_resp.data.includes("FileNotFoundError:")) {
            handler("");
          } else {
            handler(sub_resp.data);
          }
        });
      } else {
        if (link) {
          handler(response.data);
        } else {
          handler("<pre>" + response.data + "</pre>");
        }
      }
    });
  };

  useEffect(() => {
    get_backend_info("imprint", imprintBody[1], false);
    get_backend_info("privacy", privacyPolicyBody[1], false);
    get_backend_info("contact", contactInformationBody[1], false);
    get_backend_info("youtube", youtubeLink[1], true);
    get_backend_info("x", xLink[1], true);
    get_backend_info("cite", howToCiteLink[1], true);
    get_backend_info("institution", institutionLink[1], true);
  }, []);

  const buttons_top: any[] = [];
  buttons_top.push(["BugCube on X", xLink[0]]);
  buttons_top.push(["Youtube", youtubeLink[0]]);
  buttons_top.push(["How to Cite", howToCiteLink[0]]);
  buttons_top.push(["Institution", institutionLink[0]]);

  const buttons_bottom: any[] = [];
  buttons_bottom.push(["Imprint", imprintBody[0], imprint]);
  buttons_bottom.push(["Privacy Policy", privacyPolicyBody[0], privacyPolicy]);
  buttons_bottom.push([
    "Contact",
    contactInformationBody[0],
    contactInformation,
  ]);

  return (
    <Grid container direction="column">
      <Grid container className={styles.Footer}>
        {buttons_top.map((entry, i) => (
          <Grid item key={"footer-" + i} xs={12 / buttons_top.length}>
            <Box textAlign="center">
              <StyledButton
                className={styles.Button}
                variant="outlined"
                onClick={(_: any) => {
                  window.open(entry[1]);
                }}
                size="small"
                disabled={!entry[1]}
              >
                {entry[0]}
              </StyledButton>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Grid container className={styles.Footer}>
        <Grid item xs={12 / (buttons_bottom.length + 1)}>
          <Box textAlign="center">
            <StyledButton
              className={styles.Button}
              variant="outlined"
              onClick={(_: any) => {
                window.open(backend_static_ip);
              }}
              size="small"
            >
              Browse files
            </StyledButton>
          </Box>
        </Grid>
        {buttons_bottom.map((entry, i) => (
          <Grid item key={"footer-" + i} xs={12 / (buttons_bottom.length + 1)}>
            <Box textAlign="center">
              <StyledButton
                className={styles.Button}
                variant="outlined"
                onClick={(_: any) => {
                  handleOpen(entry[2][1]);
                }}
                size="small"
                disabled={!entry[1]}
              >
                {entry[0]}
              </StyledButton>
            </Box>
            <MyDialog
              title={entry[0]}
              body={entry[1]}
              open={entry[2][0]}
              handler={entry[2][1]}
            ></MyDialog>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};
