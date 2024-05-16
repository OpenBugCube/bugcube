import { useState } from "react";
import styles from "./Meta.module.scss";
import Axios from "axios";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { MyDialog, handleOpen } from "../MyDialog/MyDialog";
import { DownloadButton } from "../DownloadButton/DownloadButton";

export interface MetaProps {
  className?: string;
  backend_misc_ip: string;
  description: string;
  youtube_link: string;
  pubmed_link: string;
  database_link: string;
  excel_file: string;
}
export const Meta = ({
  className,
  backend_misc_ip,
  description,
  youtube_link,
  pubmed_link,
  database_link,
  excel_file,
}: MetaProps) => {
  const metaDialog = useState(false);

  const open_new_tab = (link: string, set_false_callback: Function) => {
    window.open(link);
    set_false_callback((_: any) => false);
  };

  const download_file = (filename: string, set_false_callback: Function) => {
    Axios.get(backend_misc_ip + "/download_file", {
      params: {
        filename: filename,
      },
      responseType: "blob",
    })
      .then((response) => {
        var path_split = response.config.params.filename.split("/");
        var filename: string = path_split[path_split.length - 1];
        if (filename.toLowerCase().startsWith("utf-8''"))
          filename = decodeURIComponent(filename.replace("utf-8''", ""));
        else filename = filename.replace(/['"]/g, "");
        return [response.data, filename];
      })
      .then((resp) => {
        var blob = resp[0];
        var filename = resp[1];
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // append the element to the dom
        a.click();
        a.remove(); // afterwards, remove the element
        set_false_callback((_: any) => false);
      })
      .catch((error) => {
        console.error(error);
        set_false_callback((_: any) => false);
      });
  };

  const buttons: any[] = [
    ["Pubmed", pubmed_link, open_new_tab],
    ["Youtube", youtube_link, open_new_tab],
    ["Database", database_link, open_new_tab],
    ["Metadata", excel_file, download_file],
  ];

  return (
    <Grid container direction="column" className={styles.Meta}>
      <Grid container>
        {buttons.map((button, i) => (
          <Grid item xs={3} key={"meta-" + i}>
            <Box textAlign="center">
              <DownloadButton
                className={styles.Button}
                onClick={button[2]}
                text={button[0]}
                function_args={[button[1]]}
                disabled={button[1] ? false : true}
                is_download={button[2] === download_file}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
      <MyDialog
        title={"Dataset description"}
        body={"<pre>" + description + "</pre>"}
        //body={"<pre>"+description+"</pre>"}
        open={metaDialog[0]}
        handler={metaDialog[1]}
      ></MyDialog>
      <textarea
        onClick={() => handleOpen(metaDialog[1])}
        className={styles.TextArea}
        readOnly
        value={description}
      ></textarea>
    </Grid>
  );
};
