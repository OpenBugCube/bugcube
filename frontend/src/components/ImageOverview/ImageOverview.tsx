import styles from "./ImageOverview.module.scss";
import Axios from "axios";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import default_loading from "./assets/loading.gif";
import Tooltip from "@mui/material/Tooltip";
import ImageNotSupported from "./assets/image_not_supported.svg";
import FmdBad from "./assets/fmd_bad.svg";
import FolderOff from "./assets/folder_off.svg";
import { DownloadButton } from "../DownloadButton/DownloadButton";

export interface SingleOverviewProps {
  className?: string;
  backendImagesUrl: string;
  backendMiscUrl: string;
  imageList: any[];
  setLeftImage: Function;
  setRightImage: Function;
  shiftCtrlState: any[];
  globalSliderValue: any[];
  globalIdx: number;
  leftImageName: any;
  rightImageName: any;
}
export const SingleOverview = ({
  className,
  backendImagesUrl,
  backendMiscUrl,
  imageList,
  setLeftImage,
  setRightImage,
  shiftCtrlState,
  globalSliderValue,
  globalIdx,
  leftImageName,
  rightImageName,
}: SingleOverviewProps) => {
  const download_options: string[] = ["ZStack", "TStack-ZM", "TStack-ZN"];
  var localImageList = useState<any[]>([]);
  var localActive = useState<number>(0);
  var localActiveLoad = useState<number | null>(null);
  var activeZStack = useState<boolean>(true);
  var activeTStackZM = useState<boolean>(true);
  var activeTStackZN = useState<boolean>(true);
  var activeButton = useState<boolean>(true);
  var downloadButton = useState<string[]>([]);

  const list_to_image = (imgList: any[]) => {
    var listWithURL: any[] = [];

    if (imgList.length === 0) {
      return [ImageNotSupported];
    }

    for (let i = 0; i < imgList.length; i++) {
      if (imgList[i] !== null) {
        if (localActiveLoad[0] !== null) {
          localActive[1]((_) => localActiveLoad[0] as number);
          localActiveLoad[1]((_) => null);
          activeZStack[1](imgList[localActive[0]].zstack_file);
          activeTStackZM[1](imgList[localActive[0]].tstack_zm_file);
          activeTStackZN[1](imgList[localActive[0]].tstack_zn_file);
          activeButton[1](true);
        }
        if (imgList[i].path === "TOOMANYFILES") {
          listWithURL.push(FolderOff);
        } else if (imgList[i].path === "BADNAMEING") {
          listWithURL.push(FmdBad);
        } else {
          listWithURL.push(imgList[i].image);
        }
      } else {
        if (localActiveLoad[0] === null) {
          localActiveLoad[1]((_) => localActive[0]);
          localActive[1]((_) => 0);
          activeZStack[1](false);
          activeTStackZM[1](false);
          activeTStackZN[1](false);
          activeButton[1](false);
        }
        listWithURL.push(default_loading);
      }
    }
    return listWithURL;
  };

  const update_slider = (_: any, value: number | number[], _2: number) => {
    if (Array.isArray(value)) {
      value = value[0];
    }
    if (shiftCtrlState[0]) {
      globalSliderValue[1](value);
    } else {
      if (globalSliderValue[0] !== null) {
        globalSliderValue[1]((_: number | null) => null);
      }
      localActive[1](value);
      activeZStack[1](imageList[value].zstack_file);
      activeTStackZM[1](imageList[value].tstack_zm_file);
      activeTStackZN[1](imageList[value].tstack_zn_file);
    }
  };

  const get_single_image = (
    handler: Function,
    name_handler: any,
    set_false_callback: Function,
  ) => {
    const cur_image: any = imageList[localActive[0]];
    if (cur_image === undefined) {
      handler(undefined);
      name_handler.current = "Undefined";
      return;
    }
    Axios.get(backendImagesUrl + "/single", {
      params: {
        path: cur_image.path,
        idx: localActive[0],
      },
    })
      .then((response) => {
        name_handler.current = cur_image.download_name;
        handler(response.data.image);
        set_false_callback((_: any) => false);
      })
      .catch((error) => {
        console.error(error);
        alert(error);
        set_false_callback((_: any) => false);
      });
  };

  const get_download = (target_dir: string, set_false_callback: Function) => {
    downloadButton[1]((prev_items) => [...prev_items, target_dir]);

    var img_path: string = "";
    if (target_dir === "ZStack") {
      img_path = imageList[localActive[0]].zstack_file;
    } else if (target_dir === "TStack-ZM") {
      img_path = imageList[localActive[0]].tstack_zm_file;
    } else if (target_dir === "TStack-ZN") {
      img_path = imageList[localActive[0]].tstack_zn_file;
    } else {
      return;
    }
    Axios.get(backendMiscUrl + "/download_file", {
      params: {
        filename: img_path,
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
        downloadButton[1]((prev_items) =>
          prev_items.filter(function (item) {
            return item !== target_dir;
          }),
        );
        set_false_callback((_: any) => false);
      })
      .catch((error) => {
        console.error(error);
        alert(error);
        downloadButton[1]((prev_items) =>
          prev_items.filter(function (item) {
            return item !== target_dir;
          }),
        );
        set_false_callback((_: any) => false);
      });
  };

  function get_tooltip(name: string): string {
    if (!activeButton[0]) {
      return `${name} not available for download – this direction has not been recorded`;
    } else if (name === "ZStack" && !activeZStack[0]) {
      return `ZStack not available for download – reconstruct by reslicing the DR000${
        globalIdx + 1
      } ZStack and/or merging CH000X ZStack`;
    } else if (name === "TStack-ZM" && !activeTStackZM[0]) {
      return "No TStack-ZM available";
    } else if (name === "TStack-ZN" && !activeTStackZN[0]) {
      return "No TStack-ZN available";
    }
    return `Download ${name}`;
  }

  const update_active_buttons = () => {
    if (imageList[localActive[0]]) {
      activeZStack[1](imageList[localActive[0]].zstack_file);
      activeTStackZM[1](imageList[localActive[0]].tstack_zm_file);
      activeTStackZN[1](imageList[localActive[0]].tstack_zn_file);
    }
  };

  useEffect(() => {
    localImageList[1](list_to_image(imageList));
  }, [imageList]);

  useEffect(() => {
    update_active_buttons();
  }, [localActive[0], localImageList[0]]);

  useEffect(() => {
    if (globalSliderValue[0] !== null) {
      if (globalSliderValue[0] <= imageList.length) {
        localActive[1]((_) => globalSliderValue[0]);
      }
      update_active_buttons();
    }
  }, [globalSliderValue[0]]);

  return (
    <div className={styles.SingleOverview}>
      <img
        className={styles.Image}
        src={localImageList[0][localActive[0]]}
        alt={"No data available!"}
      />
      <Box textAlign="center">
        <Tooltip
          disableInteractive
          title={
            <Typography fontSize={15}>
              Change presented point in time. Hold down Shift to change all
              sliders at once.
            </Typography>
          }
        >
          <Slider
            className={styles.Slider}
            defaultValue={localActive[0]}
            valueLabelDisplay="auto"
            valueLabelFormat={`${localActive[0] + 1}`}
            step={1}
            min={0}
            max={localImageList[0].length - 1}
            marks
            onChange={update_slider}
            value={localActive[0]}
            color={shiftCtrlState[0] ? "secondary" : "primary"}
            //defaultValue = {1}
          />
        </Tooltip>
      </Box>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item className={styles.ButtonContainer}>
          <Tooltip
            disableInteractive
            title={
              <Typography fontSize={15}>
                Display current image on the left side of the comparison view
              </Typography>
            }
          >
            <span>
              <DownloadButton
                className={styles.DownloadButton}
                onClick={get_single_image}
                function_args={[setLeftImage, leftImageName]}
                disabled={!activeButton[0]}
                text={"L"}
                is_download={false}
              />
            </span>
          </Tooltip>
        </Grid>
        <Grid item className={styles.ButtonContainer}>
          <Tooltip
            disableInteractive
            title={
              <Typography fontSize={15}>
                Display current image on the right side of the comparison view
              </Typography>
            }
          >
            <span>
              <DownloadButton
                className={styles.DownloadButton}
                onClick={get_single_image}
                function_args={[setRightImage, rightImageName]}
                disabled={!activeButton[0]}
                text={"R"}
                is_download={false}
              />
            </span>
          </Tooltip>
        </Grid>
      </Grid>
      <Box sx={{ py: 1 }}>
        {download_options.map((name: string, i: number) => (
          <Box sx={{ py: 0.3 }} key={name + i}>
            <Tooltip
              disableInteractive
              title={<Typography fontSize={15}>{get_tooltip(name)}</Typography>}
            >
              <span>
                <DownloadButton
                  className={styles.DownloadButton}
                  onClick={get_download}
                  disabled={
                    (!activeZStack[0] && name === "ZStack") ||
                    (!activeTStackZM[0] && name === "TStack-ZM") ||
                    (!activeTStackZN[0] && name === "TStack-ZN")
                  }
                  text={name}
                  function_args={[name]}
                />
              </span>
            </Tooltip>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export interface ImageOverviewProps {
  className?: string;
  backendImagesUrl: string;
  backendMiscUrl: string;
  imageContainer: any[];
  setLeftImage: Function;
  setRightImage: Function;
  shiftCtrlState: any[];
  globalSliderValue: any[];
  leftImageName: any;
  rightImageName: any;
}
export const ImageOverview = ({
  className,
  backendImagesUrl,
  backendMiscUrl,
  imageContainer,
  setLeftImage,
  setRightImage,
  shiftCtrlState,
  globalSliderValue,
  leftImageName,
  rightImageName,
}: ImageOverviewProps) => {
  return (
    <Grid container direction="column" className={styles.ImageOverview}>
      <Grid container>
        {imageContainer.map((images: any[], i: number) => (
          <Grid
            item
            container
            xs={3}
            direction="column"
            key={"imageoverview-" + i}
          >
            <SingleOverview
              backendImagesUrl={backendImagesUrl}
              backendMiscUrl={backendMiscUrl}
              imageList={images}
              setLeftImage={setLeftImage}
              setRightImage={setRightImage}
              className={styles.SingleOverview}
              shiftCtrlState={shiftCtrlState}
              globalSliderValue={globalSliderValue}
              globalIdx={i}
              leftImageName={leftImageName}
              rightImageName={rightImageName}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};
