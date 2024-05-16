import { useState, useRef, useEffect } from "react";
import Axios from "axios";
import styles from "./App.module.scss";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { Input } from "../Input/Input";
import { Meta } from "../Meta/Meta";
import { ImageOverview } from "../ImageOverview/ImageOverview";
import { Footer } from "../Footer/Footer";
import bugcube_logo from "./assets/BugCubeLogo.jpeg";
import DownloadIcon from "@mui/icons-material/Download";

function App() {
  const backend_ip: string = "XXX_BACKEND_IP_XXX:XXX_BACKEND_PORT_XXX";
  //const backend_ip: string = "http://localhost:3001";

  var leftImage = useState<string>(bugcube_logo);
  var rightImage = useState<string>(bugcube_logo);
  var leftImageNameDefault: string = "Display 'L' here";
  var leftImageName = useRef<string>(leftImageNameDefault);
  var rightImageNameDefault: string = "Display 'R' here";
  var rightImageName = useRef<string>(rightImageNameDefault);

  var publications = useState<string[]>([]);
  var datasets = useState<string[]>([]);
  var directions = useState<string[]>([]);
  var channels = useState<string[]>([]);

  var descriptionText = useState<string>("");
  var youtubeLink = useState<string>("");
  var pubmedLink = useState<string>("");
  var databaseLink = useState<string>("");
  var excelFile = useState<string>("");

  var imageContainer = useState<any[]>([]);

  var publication = useRef<string>("");
  var dataset = useRef<string>("");
  var direction = useRef<string>("");
  var channel = useRef<string>("");

  var shiftCtrlState = useState<boolean>(false);
  var globalSliderValue = useState<number | null>(null);

  function keyUpEvent(e: any) {
    shiftCtrlState[1](e.shiftKey);
    globalSliderValue[1](null);
  }

  const get_default_logo = (filename: string, handler: Function) => {
    Axios.get(backend_ip + "/api/misc/download_file", {
      params: { filename: filename },
      responseType: "blob",
    })
      .then((response) => {
        handler(window.URL.createObjectURL(response.data));
      })
      .catch((_) => {
        console.error(_);
      });
  };

  useEffect(() => {
    get_default_logo("_bugcube_misc/left_default.png", leftImage[1]);
    get_default_logo("_bugcube_misc/right_default.png", rightImage[1]);
    get_publications();
    document.addEventListener("keydown", (e) =>
      shiftCtrlState[1]((_) => e.shiftKey),
    );
    document.addEventListener("keyup", keyUpEvent);
  }, []);

  const get_publications = () => {
    Axios.get(backend_ip + "/api/meta/publications").then((response) => {
      publications[1]((_) => response.data);
      get_datasets(response.data[0]);
    });
  };

  const get_datasets = (cur_publication: string) => {
    if (!cur_publication) {
      datasets[1]([]);
      directions[1]([]);
      channels[1]([]);
      imageContainer[1]([[null], [null], [null], [null]]);
      return;
    }
    publication.current = cur_publication;
    Axios.get(backend_ip + "/api/meta/datasets", {
      params: { publication: cur_publication },
    }).then((response) => {
      globalSliderValue[1]((_) => 0);
      datasets[1]((_) => response.data);
      get_directions(response.data[0]);
      get_metadata(response.data[0]);
    });
  };

  const get_directions = (cur_dataset: string | null) => {
    if (!cur_dataset) {
      directions[1]([]);
      channels[1]([]);
      imageContainer[1]([[null], [null], [null], [null]]);
      return;
    }
    dataset.current = cur_dataset;
    Axios.get(backend_ip + "/api/meta/directions", {
      params: { publication: publication.current, dataset: cur_dataset },
    }).then((response) => {
      globalSliderValue[1]((_) => 0);
      directions[1]((_) => response.data);
      get_channels(response.data[0]);
    });
  };

  const get_channels = (cur_direction: string | null) => {
    if (!cur_direction) {
      channels[1]([]);
      imageContainer[1]([[null], [null], [null], [null]]);
      return;
    }
    direction.current = cur_direction;
    Axios.get(backend_ip + "/api/meta/channels", {
      params: {
        publication: publication.current,
        dataset: dataset.current,
        direction: cur_direction,
      },
    }).then((response) => {
      channels[1](response.data);
      get_overview_images(response.data[0]);
    });
  };

  const get_metadata = (cur_dataset: string | null) => {
    if (!cur_dataset) {
      imageContainer[1]([[null], [null], [null], [null]]);
      return;
    }
    Axios.get(backend_ip + "/api/meta/metainfo", {
      params: { publication: publication.current, dataset: cur_dataset },
    }).then((response) => {
      descriptionText[1](response.data.description);
      youtubeLink[1](response.data.youtube_link);
      pubmedLink[1](response.data.pubmed_link);
      excelFile[1](response.data.excel_file);
      databaseLink[1](response.data.database_link);
    });
  };

  const get_overview_images = (cur_channel: string | null) => {
    imageContainer[1]([[null], [null], [null], [null]]);
    if (!cur_channel) {
      return;
    }
    channel.current = cur_channel;
    Axios.get(backend_ip + "/api/images/overview", {
      params: {
        publication: publication.current,
        dataset: dataset.current,
        direction: direction.current,
        channel: cur_channel,
      },
    }).then((response) => {
      imageContainer[1](response.data);
    });
  };

  const inputs: any[] = [
    [publications[0], get_datasets, "Publication"],
    [datasets[0], get_directions, "Dataset"],
    [directions[0], get_channels, "Direction"],
    [channels[0], get_overview_images, "Channel"],
  ];

  return (
    <Grid container className={styles.App}>
      <Grid xs={4} item container>
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="space-between"
          margin="10px"
        >
          <Grid container direction="column">
            <Grid item container>
              <Input inputs={inputs}></Input>
            </Grid>
            <Grid item container>
              <Meta
                backend_misc_ip={backend_ip + "/api/misc"}
                description={descriptionText[0]}
                youtube_link={youtubeLink[0]}
                pubmed_link={pubmedLink[0]}
                database_link={
                  databaseLink[0].startsWith("http")
                    ? databaseLink[0]
                    : backend_ip + "/static_dir/" + databaseLink[0]
                }
                excel_file={excelFile[0]}
              ></Meta>
            </Grid>
            <Grid item container>
              <ImageOverview
                backendImagesUrl={backend_ip + "/api/images"}
                backendMiscUrl={backend_ip + "/api/misc"}
                imageContainer={imageContainer[0]}
                setLeftImage={leftImage[1]}
                setRightImage={rightImage[1]}
                leftImageName={leftImageName}
                rightImageName={rightImageName}
                shiftCtrlState={shiftCtrlState}
                globalSliderValue={globalSliderValue}
              ></ImageOverview>
            </Grid>
          </Grid>
          <Grid item container>
            <Footer
              backend_misc_ip={backend_ip + "/api/misc"}
              backend_static_ip={backend_ip + "/static"}
            ></Footer>
          </Grid>
        </Grid>
      </Grid>
      <Grid xs={4} item container>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <a
              href={leftImage[0]}
              download={leftImageName.current}
              className={
                leftImageName.current == leftImageNameDefault
                  ? styles.Link_disabled
                  : styles.Link_download
              }
            >
              <IconButton
                size="small"
                color="primary"
                disabled={
                  leftImageName.current == leftImageNameDefault ? true : false
                }
              >
                <DownloadIcon />
              </IconButton>
            </a>
            <label>
              {leftImageName.current.split("/").reverse()[0].split(".")[0]}
            </label>
          </Grid>
          <Grid item>
            <img
              src={leftImage[0]}
              alt="No image available!"
              className={styles.bigImage}
            ></img>
          </Grid>
        </Grid>
      </Grid>
      <Grid xs={4} item container>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <a
              href={rightImage[0]}
              download={rightImageName.current}
              className={
                rightImageName.current == rightImageNameDefault
                  ? styles.Link_disabled
                  : styles.Link_download
              }
            >
              <IconButton
                size="small"
                color="primary"
                disabled={
                  rightImageName.current == rightImageNameDefault ? true : false
                }
              >
                <DownloadIcon />
              </IconButton>
            </a>
            <label>
              {rightImageName.current.split("/").reverse()[0].split(".")[0]}
            </label>
          </Grid>
          <Grid item>
            <img
              src={rightImage[0]}
              alt="No image available!"
              className={styles.bigImage}
            ></img>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
