import { createBoard } from "@wixc3/react-board";
import App from "../../../components/App/App";

export default createBoard({
  name: "App",
  Board: () => <App />,
});
